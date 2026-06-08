---
name: last30days
description: "Research what real people have actually been saying about a topic over a recent time window (default last 30 days) across Reddit, Hacker News, X, YouTube, and GitHub — then synthesize an engagement-weighted, cited brief. Use when the user asks: what's new/recent buzz/trending with X, community sentiment on X, what people are saying about X lately, last30days, past week/last N days, 最近大家在聊什么 / 最近 X 有什么新动态 / 时效性调研 / 选型/产品调研. Complements deep-research (fact-checking) by focusing on recency + community signal rather than authoritative sources."
---

# last30days

Research a topic the way a sharp human would skim the last month of the internet: pull what **real people actually engaged with** across Reddit, Hacker News, X/Twitter, YouTube, and GitHub within a recent time window, weight it by engagement and cross-source agreement, and synthesize a grounded brief with inline citations.

This is a lightweight, zero-dependency take on [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). It runs entirely on the built-in `WebSearch` and `WebFetch` tools — no API keys, no Python engine.

**When to use this vs. `deep-research`:** reach for `last30days` when *recency and community signal* are the point (trend discovery, product/tool selection, "is X any good lately", sentiment, current events). Reach for `deep-research` when you need *authoritative, fact-checked* answers regardless of date.

## Prerequisites

- `WebSearch` and `WebFetch` are built-in — no setup. If `WebSearch` isn't available in the session, load it first (`ToolSearch` → `select:WebSearch,WebFetch`).
- `WebSearch` is US-region and works best on indexed web. Reddit, Hacker News, GitHub, and YouTube are reliably searchable. X/Twitter is partially indexable — treat it as best-effort and lean on the others when it's thin.

## Workflow

### Step 0 — Scope the query

1. **Topic.** Restate the topic in one line so the user can correct it before you burn searches.
2. **Time window.** Default to the **last 30 days**. Honor explicit windows: "this week" → 7d, "past two weeks" → 14d, "last N days/months". Today's date is known from context — compute the cutoff date and carry it into every search as a recency anchor (the current month + year, e.g. "June 2026", and terms like "this week"/"latest").
3. **Query type** (shapes synthesis):
   - *Trend discovery* — what's emerging, what shifted.
   - *Product / tool selection* — what practitioners actually pick and why; quote real usage.
   - *Sentiment* — how people feel, the split between camps.
   - *News / event monitoring* — what happened and the reactions.
4. **Keyword traps.** Flag ambiguous names (a tool that shares a word with something common) and disambiguate in the query before searching.

### Step 1 — Resolve entities & plan queries

Before firing searches, name the concrete places the conversation lives:

- **Subreddits** likely to discuss it (e.g. `r/LocalLLaMA`, `r/programming`).
- **X/Twitter handles** — the project, its founder, loud practitioners.
- **GitHub** repo/org (releases, PR activity, star momentum are strong recency signals).
- **YouTube** channels likely to have recent walkthroughs/reviews.

Draft **3–6 targeted subqueries**, each pointed at one source family (see `references/source-recipes.md` for exact `WebSearch` recipes per platform).

### Step 2 — Parallel multi-source search

Fire the planned searches **in a single message (parallel tool calls)** so they run concurrently. Use `allowed_domains` to pin each search to a source, and always include the recency anchor:

- Reddit → `allowed_domains: ["reddit.com"]`
- Hacker News → `allowed_domains: ["news.ycombinator.com"]` (and the Algolia API via `WebFetch`, see recipes)
- GitHub → `allowed_domains: ["github.com"]`
- YouTube → `allowed_domains: ["youtube.com"]`
- X/Twitter → `allowed_domains: ["x.com", "twitter.com"]` (best-effort)
- Open web → a plain `WebSearch` with the recency anchor, no domain pin, to catch blogs/news.

### Step 3 — Deepen the high-signal hits

For the strongest 4–8 results, `WebFetch` the page to pull the *actual substance*, not just the snippet:

- Reddit thread → the claim + top comments + rough upvote/comment counts.
- HN thread → top comments and the contrarian replies.
- GitHub → latest release notes, recent PR/commit themes, star trajectory.
- YouTube → title, channel, view count, and the gist (description/transcript if reachable).

### Step 4 — Score & converge

Rank by signal, not mention-count:

- **Engagement weight** — upvotes, comments, stars, views, retweets. A 2k-upvote thread outweighs ten driveby mentions.
- **Recency** — inside the window; surface "as of last week" shifts.
- **Cross-source convergence** — the same claim appearing on ≥2 platforms is *high confidence*; flag single-source claims as such.
- **Per-voice cap** — don't let one loud account or one mega-thread dominate; cap ~3 items per author/source and diversify.
- **Separate signal from noise** — drop SEO spam, ancient reposts surfacing late, and off-topic keyword collisions.

### Step 5 — Synthesize the brief

Output grounded prose, not an evidence dump. Structure:

```
🗓️ last30days · <topic> · window: <start>–<today>

**TL;DR** — 3–5 bullets of what someone busy needs to know.

**Key themes**
- <Theme>: what's being said, who's saying it, confidence (multi-source vs single), with inline links.
- ...

**Notable takes** — a few real quotes/positions with source links (never invent quotes or titles).

**Emerging / shifting** — what's newer than the rest, what changed this window.

**Contrarian & risks** — the dissent, the caveats, the "don't" warnings.

**Gaps** — what you couldn't verify or where coverage was thin (e.g. X was sparse).

---
Scanned <N> sources across <platforms> · window <N> days · <date>
```

Rules:
- Every non-obvious claim gets an **inline markdown link** to its source.
- Prefer convergent, multi-source claims; label single-source ones as unconfirmed.
- No fabricated titles, quotes, counts, or links — if you didn't see it, don't assert it.
- Lead with the synthesis; keep the raw list in the links, not the body.

## Notes & limits

- `WebSearch` is US-indexed; non-English/regional communities and X/Twitter may be under-covered — say so in **Gaps** rather than papering over it.
- This skill reports the *current conversation* on a topic; it is not a fact-checker. For "is this claim actually true," hand off to `deep-research`.
