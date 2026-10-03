# HTML explainer

Build one self-contained page whose every element teaches something the chat answer could not. This is an explanation, not a dashboard or a product UI.

## Shape

- Open with the takeaway in one or two sentences, then the model or diagram, then the detail.
- State the model contract on the page: which input each control changes, its units, range, and default, and the rule that maps inputs to outputs. Defaults show the key case; one or two presets for boundary cases beat a free-form form. Provide a reset to the documented default and seed any randomness so results reproduce.
- Pair interaction with an inspectable record: an event trace, a step list, or a table that updates with the controls, so the reader can check the mechanism instead of trusting the picture.
- For staged change, use a stepper with numbered frames and a caption per frame. Do not add motion or video.
- Keep a short "what this model simplifies" note. Label synthetic data, toy parameters, and simulated results inside the page.
- A static page with an inline SVG diagram and prose is a valid result when nothing needs to change.

## Build

- Single `.html` file with inline CSS, JS, and SVG. The page must read correctly offline with no network dependencies.
- Write in the user's language, keeping key technical terms in English in prose, labels, legends, and controls alike. When Chinese and Latin text mix, pair fonts within one family, sans with sans or serif with serif, and declare explicit fallbacks.
- Restrained palette: one background, one ink, and at most two semantic accents such as hit and miss or before and after. Idle elements stay flat.
- Plain, measured wording and plain titles; no slang or decorative headings.
- Links are in-document anchors or public URLs only. Never link to local paths or `file://`; they break for anyone else who opens the page.
- No secrets or private data in the page.

## Verify

Check one normal scenario against an independently calculated result and one boundary such as zero or a threshold. Render the file in an available browser and check wide and narrow layouts, every control, the updated trace, and the absence of overflow or overlap. If no browser is available, say so and list what was not checked. Do not present a page that failed to render as finished.

## Deliver

Save as a descriptive `<SUBJECT>.html` under `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Opening the page for local verification is part of building it; opening it for the user, publishing it, or sharing it externally requires a request or existing authorization.
