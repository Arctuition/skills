---
name: python-web-troubleshooter
description: "Diagnose and fix Python web service issues: request queuing, Gunicorn worker exhaustion, 502/504 errors, OOM crashes, high latency, DB slowness, and capacity decisions (workers vs replicas vs DB read replicas). Use when user reports slow API, requests piling up, workers all busy, timeouts, or wants to tune Gunicorn/uWSGI. Also covers storage layer (gp2 vs gp3 IOPS) impact on web service performance."
---

# Python Web Service Troubleshooter

Structured diagnosis for Python web service (Gunicorn / uWSGI) performance and capacity issues.

**Core principle: workers are buffers, replicas are scale-out, and latency is what actually determines capacity.**

---

## Step 1: Break Down Latency First

Before changing any config, collect these metrics to build a complete picture of where time is being spent:

| Layer | Key Metrics |
|-------|-------------|
| **Gunicorn** | idle worker count vs working worker count |
| **Nginx** | `upstream_response_time`, `upstream_connect_time` |
| **Application** | total request duration, queue wait time as % of total |
| **Database** | DB CPU, query latency, DB load, waiting on IO? |

```bash
# Gunicorn worker state (via process list)
ps aux | grep gunicorn | grep -v grep

# Nginx log analysis (upstream_response_time field)
awk '{print $NF}' /var/log/nginx/access.log | sort -n | tail -20

# PostgreSQL slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

# MySQL slow queries
SELECT * FROM information_schema.PROCESSLIST
WHERE TIME > 1
ORDER BY TIME DESC;
```

---

## Step 2: Symptom → Root Cause Decision Matrix

Match observed symptoms to the most likely root cause:

### Symptom A: All workers busy, backlog growing, app CPU high
**Root cause:** Application-layer concurrency exhausted
**Action:** Add more app replicas (scale out), not more workers per replica

### Symptom B: App requests queuing, but DB CPU is low
**Root cause:** DB IO instability / storage layer performance issue (classic: RDS gp2 burst credit exhausted)
**Action:** Check RDS IOPS and BurstBalance metrics; evaluate upgrading to gp3

### Symptom C: DB CPU high, read-heavy workload
**Root cause:** Read load exceeding single instance capacity
**Action:** Evaluate adding a DB read replica

### Symptom D: DB CPU high, write-heavy or high lock contention
**Root cause:** Write bottleneck — read replicas won't help here
**Action:** Optimize write-path SQL, upgrade DB instance size; consider sharding

### Symptom E: A few specific endpoints are very slow (long tail), others are fine
**Root cause:** Individual slow handlers (PDF generation, complex queries, slow external calls) locking up workers
**Action:** Add workers as a buffer for the long tail; or make the endpoint async

### Symptom F: Everything is slow system-wide
**Root cause:** Systemic high latency — this is not a concurrency problem
**Action:** Optimize slow queries, add indexes, reduce external calls; **do not try to fix this by adding workers**

---

## Step 3: Capacity Math

### Throughput formula
```
Stable throughput ≈ total workers ÷ avg request duration (seconds)

Example: 32 replicas × 4 workers = 128 workers, avg latency 4s
→ Stable throughput ≈ 128 ÷ 4 = 32 QPS
```

### Impact of reducing latency vs adding workers
```
Avg latency 4s → 1s:  4× throughput gain (zero new workers needed)
Double the workers:    2× throughput gain (plus more DB pressure)
```

**Reducing latency is always the higher-leverage move.**

---

## Step 4: Gunicorn Worker Count

### Baseline formula
```bash
# General rule (reduce for CPU-bound, increase for IO-bound)
workers = (2 × CPU_cores) + 1

nproc  # check CPU count

# Example: 4-core machine → workers = 9
```

### When to add workers (and when not to)
- **Good fit:** A small number of slow, infrequent endpoints — use workers as a buffer to absorb the long tail
- **Bad fit:** System-wide slowness or DB already under pressure — adding workers just sends more concurrent load to the DB

### Patterns to avoid

| Pattern | Why it's harmful |
|---------|-----------------|
| Thread workers | Spikes DB concurrency; lock/IO contention worsens latency |
| gevent | Monkey-patching dependency traps; very hard to debug in production |
| Forking child processes inside workers | Non-linear memory growth, orphan processes, OOM risk |

---

## Step 5: Storage Layer Check (RDS gp2 vs gp3)

### Check gp2 burst credit balance
```bash
# BurstBalance below 20% is a warning sign
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name BurstBalance \
  --dimensions Name=DBInstanceIdentifier,Value=<DB_INSTANCE_ID> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Also check ReadIOPS / WriteIOPS vs provisioned limit
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name ReadIOPS \
  --dimensions Name=DBInstanceIdentifier,Value=<DB_INSTANCE_ID> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### When to upgrade gp2 → gp3

| Signal | Recommendation |
|--------|---------------|
| BurstBalance frequently < 20% | Evaluate gp3 upgrade soon |
| App requests queue but DB CPU is low | Likely IOPS instability — gp3 decouples IOPS from volume size |
| Intermittent latency spikes during peak traffic | gp2 burst may be depleting at the wrong moment |

**gp3 advantage:** IOPS and throughput are independently configurable and no longer tied to burst credits. Predictable performance matters more than peak headroom on paper.

---

## Step 6: Decision Order

```
1. Break down latency → find which layer is slow
   ↓
2. Fix latency → slow queries, indexes, reduce external calls, async offload
   ↓
3. Check storage layer → gp2 IOPS / BurstBalance, upgrade to gp3 if needed
   ↓
4. Tune workers → only for long-tail slow endpoints as a buffer
   ↓
5. Scale replicas → when app-layer concurrency is genuinely the bottleneck
   ↓
6. Add DB read replica → when read-heavy and primary is saturated
```

---

## Checklist

```
[ ] Check Gunicorn idle vs working worker ratio
[ ] Check Nginx upstream_response_time and upstream_connect_time
[ ] Check DB slow queries (> 1s)
[ ] Check DB CPU and load
[ ] Check RDS BurstBalance (if on gp2)
[ ] Calculate throughput ceiling: total workers ÷ avg request duration
[ ] Determine: long-tail problem or system-wide slowness?
[ ] Determine: bottleneck in app layer or DB layer?
```

---

## Anti-Pattern Alerts

**Death spiral #1 — Worker accumulation loop:**
Add workers → queue clears → DB gets hammered → latency rises → add more workers → memory pressure → OOM / 502

**Death spiral #2 — Restart loop:**
gp2 burst depletes → DB latency spikes → workers get held longer → requests pile up → OOM → container restarts → pile-up continues

When you recognize either pattern, **stop adding workers**. Investigate storage layer and latency root cause instead.
