# Source recipes

Per-platform `WebSearch` / `WebFetch` recipes for the `last30days` skill. `<TOPIC>` is the
user's subject; `<MONTH YEAR>` is the current month/year recency anchor (e.g. `June 2026`).
Run the source searches in a single message so they execute in parallel.

## Reddit — discussion + sentiment + upvotes

```
WebSearch:
  query: "<TOPIC> <MONTH YEAR>"
  allowed_domains: ["reddit.com"]
```

Then `WebFetch` the top thread for the claim + top comments + counts:

```
WebFetch:
  url: <reddit thread url>
  prompt: "What is the main claim or question, what do the top comments say
           (summarize the highest-voted ones), and roughly how many upvotes/comments?
           Quote at most one short line verbatim."
```

Tip: Reddit's own search is weak; Google-style domain-pinned `WebSearch` finds the high-engagement
threads. Add a likely subreddit to sharpen: `"<TOPIC> site:reddit.com/r/<sub>"` style intent.

## Hacker News — practitioner takes + contrarians

Domain-pinned search:

```
WebSearch:
  query: "<TOPIC> <MONTH YEAR>"
  allowed_domains: ["news.ycombinator.com"]
```

Or query the Algolia HN API directly (sorted by date, last-window) via `WebFetch`:

```
WebFetch:
  url: "https://hn.algolia.com/api/v1/search_by_date?query=<TOPIC>&tags=story&numericFilters=created_at_i%3E<UNIX_CUTOFF>"
  prompt: "List the story titles, points, number of comments, and URLs from this JSON,
           newest first."
```

`<UNIX_CUTOFF>` = unix timestamp of the window start. Then `WebFetch` the item page for top comments:
`https://news.ycombinator.com/item?id=<ID>`.

## GitHub — release/PR/star momentum (strong recency signal)

```
WebSearch:
  query: "<TOPIC> release OR changelog <MONTH YEAR>"
  allowed_domains: ["github.com"]
```

For a known repo, fetch releases and recent activity directly:

```
WebFetch:
  url: "https://github.com/<owner>/<repo>/releases"
  prompt: "Summarize the releases from the last 30 days: version, date, and the headline changes."
```

Also useful: `.../pulls?q=is%3Apr+sort%3Aupdated-desc` (what's actively being worked on) and the
repo homepage for star count / recent commit cadence.

## YouTube — reviews / walkthroughs + view counts

```
WebSearch:
  query: "<TOPIC> review OR tutorial <MONTH YEAR>"
  allowed_domains: ["youtube.com"]
```

`WebFetch` a top video URL for channel, view count, upload date, and the description/gist. Treat
view count as the engagement weight.

## X / Twitter — best-effort

```
WebSearch:
  query: "<TOPIC> <MONTH YEAR>"
  allowed_domains: ["x.com", "twitter.com"]
```

X is only partially indexed by web search. If results are thin, don't fake coverage — note it in the
brief's **Gaps** section and lean on Reddit/HN/GitHub. If a key handle is known, try
`"<TOPIC> from:<handle>"` intent in the query.

## Open web — blogs, news, Substack

A plain search with no domain pin, recency-anchored, to catch everything the pinned searches miss:

```
WebSearch:
  query: "<TOPIC> <MONTH YEAR> latest"
```

## Recency anchors

`WebSearch` has no hard date filter, so steer it with text:

- The current month + year: `June 2026`.
- Relative terms: `this week`, `latest`, `just released`, `now`.
- Drop a year only when the window spans one; otherwise month+year is tighter.

Always discard results whose visible date is outside the window, even if they rank well.
