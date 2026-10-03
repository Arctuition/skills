#!/usr/bin/env node
// Dependency-free HTML -> MP4 renderer. See ../references/video-renderer.md.
import { spawn, execFile } from 'node:child_process';
import { constants } from 'node:fs';
import { access, copyFile, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify, parseArgs } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const run = promisify(execFile);
const abort = new AbortController();
const commandTimeout = 30_000;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => abort.abort(new Error(`Stopped by ${signal}`)));
}

async function exists(path) {
  try { await lstat(path); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function findChrome(explicit) {
  const names = process.platform === 'win32' ? ['chrome.exe', 'chromium.exe'] : ['google-chrome', 'chromium', 'chromium-browser'];
  const candidates = explicit ? [explicit] : [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ...(process.env.PATH || '').split(delimiter).flatMap(dir => names.map(name => join(dir, name))),
  ];
  for (const candidate of candidates) {
    try { await access(candidate, constants.X_OK); return resolve(candidate); } catch { /* try next */ }
  }
  throw new Error('Chrome/Chromium not found; pass --chrome or set CHROME to its executable path.');
}

async function until(check, description) {
  const deadline = Date.now() + commandTimeout;
  while (Date.now() < deadline) {
    abort.signal.throwIfAborted();
    const result = await check();
    if (result) return result;
    await delay(100, undefined, { signal: abort.signal });
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 0;
  let failure;
  const fail = error => {
    failure ||= error;
    for (const { reject, timer } of pending.values()) { clearTimeout(timer); reject(failure); }
    pending.clear();
  };
  socket.addEventListener('close', () => fail(new Error('Chrome debugging connection closed')));
  socket.addEventListener('error', () => fail(new Error('Chrome debugging connection failed')));
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      const detail = message.params.exceptionDetails;
      fail(new Error(detail.exception?.description || detail.text));
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const onAbort = () => { fail(abort.signal.reason); socket.close(); };
  abort.signal.addEventListener('abort', onAbort, { once: true });
  try {
    await until(() => { if (failure) throw failure; return socket.readyState === WebSocket.OPEN; }, 'Chrome debugging connection');
  } catch (error) {
    abort.signal.removeEventListener('abort', onAbort);
    socket.close();
    throw error;
  }
  return {
    send(method, params = {}) {
      if (failure) return Promise.reject(failure);
      abort.signal.throwIfAborted();
      return new Promise((resolveRequest, reject) => {
        const id = ++nextId;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timed out: ${method}`));
        }, commandTimeout);
        pending.set(id, { resolve: resolveRequest, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      abort.signal.removeEventListener('abort', onAbort);
      fail(new Error('Renderer finished'));
      socket.close();
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function probe(path, countFrames = false) {
  const args = ['-v', 'error', ...(countFrames ? ['-count_frames'] : []), '-show_format', '-show_streams', '-of', 'json', path];
  const { stdout, stderr } = await run('ffprobe', args, { signal: abort.signal });
  if (stderr.trim()) throw new Error(stderr.trim());
  return JSON.parse(stdout);
}

function timeline(config, sceneId, scale) {
  if (!config || typeof config !== 'object') throw new Error('The page must expose window.videoConfig.');
  const { width, height, fps, duration, scenes = [] } = config;
  for (const [name, value] of Object.entries({ width, height, fps })) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`videoConfig.${name} must be a positive integer.`);
  }
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('videoConfig.duration must be positive seconds.');
  if (!Number.isFinite(scale) || scale <= 0 || scale > 1) throw new Error('--scale must be greater than zero and at most 1.');
  const outputWidth = width * scale, outputHeight = height * scale;
  if ([width, height, outputWidth, outputHeight].some(n => !Number.isSafeInteger(n) || n <= 0 || n % 2)) {
    throw new Error('Original and scaled dimensions must be positive even integers.');
  }
  if (!Array.isArray(scenes)) throw new Error('videoConfig.scenes must be an array.');
  const ids = new Set();
  for (const scene of scenes) {
    if (!scene || typeof scene.id !== 'string' || !scene.id || ids.has(scene.id) ||
        !Number.isFinite(scene.start) || !Number.isFinite(scene.end) ||
        scene.start < 0 || scene.end <= scene.start || scene.end > duration) {
      throw new Error('Scenes need unique string IDs and nonempty ranges within videoConfig.duration.');
    }
    ids.add(scene.id);
  }
  const scene = sceneId ? scenes.find(item => item.id === sceneId) : { start: 0, end: duration };
  if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
  const first = Math.round(scene.start * fps), end = Math.ceil(scene.end * fps - 1e-9);
  if (end <= first) throw new Error('Selected scene is shorter than one frame after rounding.');
  return { width, height, fps, duration, outputWidth, outputHeight, first, end, seconds: (end - first) / fps };
}

async function main() {
  const { values } = parseArgs({ options: {
    html: { type: 'string' }, output: { type: 'string' }, audio: { type: 'string' },
    scene: { type: 'string' }, chrome: { type: 'string' }, scale: { type: 'string', default: '1' },
    overwrite: { type: 'boolean', default: false }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('Usage: node render-video.mjs --html <SCENE_HTML> --output <VIDEO_MP4>\n' +
      '  [--scene <SCENE_ID>] [--audio <FULL_TIMELINE_AUDIO>] [--scale 0.5]\n' +
      '  [--chrome <EXECUTABLE>] [--overwrite]\nRequires Node 22.4+, Chrome/Chromium, ffmpeg, ffprobe.');
    return;
  }
  if (typeof WebSocket === 'undefined') throw new Error('Node 22.4+ with built-in WebSocket is required.');
  if (!values.html || !values.output) throw new Error('--html and --output are required. Use --help.');
  const html = resolve(values.html), output = resolve(values.output);
  const audio = values.audio ? resolve(values.audio) : undefined;
  if (!output.toLowerCase().endsWith('.mp4')) throw new Error('--output must end in .mp4.');
  if (output === html || output === audio) throw new Error('Output must differ from input files.');
  await access(html, constants.R_OK);
  if (audio) await access(audio, constants.R_OK);
  if (!values.overwrite && await exists(output)) throw new Error('Output exists; choose a new path or use --overwrite.');
  const chrome = await findChrome(values.chrome || process.env.CHROME);
  await run('ffmpeg', ['-version'], { signal: abort.signal });
  await run('ffprobe', ['-version'], { signal: abort.signal });
  await mkdir(dirname(output), { recursive: true });
  const work = await mkdtemp(join(dirname(output), '.video-render-'));
  let browser, browserDone, cdp;
  try {
    const profile = join(work, 'profile');
    browser = spawn(chrome, ['--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
      '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] });
    let browserError, browserLog = '';
    browser.on('error', error => { browserError = error; });
    browser.stderr.on('data', data => { browserLog = (browserLog + data).slice(-2000); });
    browserDone = new Promise(resolveDone => browser.once('close', resolveDone));
    const page = await until(async () => {
      if (browserError) throw browserError;
      if (browser.exitCode !== null || browser.signalCode !== null) throw new Error(`Chrome exited: ${browserLog}`);
      const portFile = join(profile, 'DevToolsActivePort');
      if (!await exists(portFile)) return false;
      const port = Number((await readFile(portFile, 'utf8')).split('\n')[0]);
      if (!port) return false;
      const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]) });
      if (!response.ok) throw new Error(`Chrome target discovery returned ${response.status}`);
      return (await response.json()).find(target => target.type === 'page');
    }, 'headless Chrome');
    cdp = await connect(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    const url = pathToFileURL(html).href;
    const navigation = await cdp.send('Page.navigate', { url });
    if (navigation.errorText) throw new Error(navigation.errorText);
    await until(() => evaluate(cdp, `location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`), 'scene page load');
    const config = await evaluate(cdp, `(async () => {
      await window.videoReady;
      if (typeof window.renderAt !== 'function') throw new Error('The page must expose window.renderAt(t).');
      return window.videoConfig;
    })()`);
    const t = timeline(config, values.scene, Number(values.scale));
    if (audio) {
      const info = await probe(audio);
      if (!info.streams.some(stream => stream.codec_type === 'audio')) throw new Error('--audio contains no audio stream.');
      const seconds = Number(info.format.duration);
      if (!Number.isFinite(seconds)) throw new Error('Cannot measure supplied audio duration.');
      if (seconds > t.duration + 1 / t.fps) throw new Error('Audio exceeds the full video duration; extend the visual timeline or edit the narration.');
    }
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: t.width, height: t.height, deviceScaleFactor: 1, mobile: false });
    const frameDir = join(work, 'frames');
    await mkdir(frameDir);
    const frames = t.end - t.first;
    console.log(`Rendering ${frames} frames at ${t.fps} fps; timeline ${t.first / t.fps}–${t.end / t.fps}s; ${t.outputWidth}×${t.outputHeight}.`);
    for (let index = 0; index < frames; index++) {
      await evaluate(cdp, `(async () => {
        await window.renderAt(${(t.first + index) / t.fps});
        document.documentElement.getBoundingClientRect();
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode()));
      })()`);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png',
        clip: { x: 0, y: 0, width: t.width, height: t.height, scale: Number(values.scale) } });
      await writeFile(join(frameDir, `${String(index).padStart(6, '0')}.png`), Buffer.from(data, 'base64'));
      if ((index + 1) % Math.max(1, Math.ceil(frames / 10)) === 0 || index === frames - 1) console.log(`Captured ${index + 1}/${frames}`);
    }
    const encoded = join(work, 'encoded.mp4');
    const args = ['-v', 'error', '-nostdin', '-framerate', String(t.fps), '-start_number', '0', '-i', join(frameDir, '%06d.png')];
    if (audio) args.push('-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-af',
      `apad,atrim=start=${t.first / t.fps}:end=${t.end / t.fps},asetpts=PTS-STARTPTS`, '-c:a', 'aac', '-ar', '48000', '-b:a', '192k');
    else args.push('-an');
    args.push('-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-t', String(t.seconds), '-movflags', '+faststart', encoded);
    await run('ffmpeg', args, { signal: abort.signal });
    const info = await probe(encoded, true);
    const video = info.streams.find(stream => stream.codec_type === 'video');
    const hasAudio = info.streams.some(stream => stream.codec_type === 'audio');
    if (!video || Number(video.nb_read_frames) !== frames || video.width !== t.outputWidth || video.height !== t.outputHeight ||
        !Number.isFinite(Number(info.format.duration)) || Math.abs(Number(info.format.duration) - t.seconds) > 1 / t.fps + 0.025 || hasAudio !== Boolean(audio)) {
      throw new Error('Encoded output failed frame count, dimensions, duration, or audio-stream checks.');
    }
    if (values.overwrite) await rename(encoded, output);
    else await copyFile(encoded, output, constants.COPYFILE_EXCL);
    console.log(`Saved ${output}\nVerified ${frames} decoded frames, ${info.format.duration}s, ${hasAudio ? 'with audio' : 'no audio'}. Check content and playback separately.`);
  } finally {
    cdp?.close();
    if (browser && browser.exitCode === null && browser.signalCode === null) {
      browser.kill('SIGTERM');
      const timer = setTimeout(() => browser.kill('SIGKILL'), 2000);
      await browserDone;
      clearTimeout(timer);
    }
    await rm(work, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(`render-video: ${error.message}`); process.exitCode = 1; });
