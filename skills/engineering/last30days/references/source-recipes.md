# Community source recipes

Use the session's available search and fetch tools; parameter names vary by provider. Apply supported date filters, then verify dates on the actual sources.

| Source | Starting query or page | Evidence to inspect |
|---|---|---|
| Reddit | `site:reddit.com <TOPIC> <DATE_ANCHOR>`, narrowed to a relevant subreddit | Post, substantive replies, date, visible votes/comments |
| Hacker News | `site:news.ycombinator.com <TOPIC>` or the API below | Discussion date, practitioner reports, dissent |
| GitHub | Known repository's discussions, issues, releases, and recent PRs | Dated usage reports and actual changes; a current star count is not growth |
| YouTube | `site:youtube.com <TOPIC> review <DATE_ANCHOR>` | Upload date and accessible transcript/description; disclose when only metadata is available |
| X | `site:x.com <TOPIC> <DATE_ANCHOR>`, optionally a known author | Original post and date; coverage may be sparse |
| Practitioner blogs | `<TOPIC> experience <DATE_ANCHOR>` | First-hand use and publication date, separated from promotional reposts |

## Hacker News date-filter query

URL-encode the topic and substitute the window start as a Unix timestamp:

```text
https://hn.algolia.com/api/v1/search_by_date?query=<ENCODED_TOPIC>&tags=story&numericFilters=created_at_i%3E<UNIX_CUTOFF>
```

Read the returned story IDs and open `https://news.ycombinator.com/item?id=<STORY_ID>` for the discussion. Inspect pagination when a query has more results than the returned page.

## Coverage

A month/year keyword is a search aid, not a date filter. Discard out-of-window results or clearly label them as historical context. Do not report inaccessible platforms as searched in depth or infer a video's substance from its title.
