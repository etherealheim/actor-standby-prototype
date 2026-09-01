# Actor Servers navigation prototype

A clickable prototype of the Actor detail navigation, exploring how **Run mode** and **Server mode** should sit next to each other in Console. It is served over Actor Standby, so reviewers open a URL instead of cloning the repo and running `next dev`.

This is an internal design prototype, not a Store Actor. It scrapes nothing, takes no input, and writes no dataset — the whole Actor is the web UI.

## Opening it

Open the Actor's Standby URL in a browser. The navigation variant is selected with the `option` query parameter:

| URL | Variant | What it shows |
| --- | --- | --- |
| `?option=1` | **Detached** | Mode switcher lives in the header meta row, above the tabs |
| `?option=2` | **Inline** | Mode switcher sits in the tab bar, separated by a divider |
| `?option=3` | **Disabled** | No switcher — both modes' tabs merged into one bar, unavailable ones greyed out |

Without `option`, it opens variant 1.

## Browser access requires Console authentication

Standby requests are authenticated. For a browser to load the prototype — including its JavaScript chunks, fonts and images — the Actor needs **Enable Console authentication** (`isConsoleAuthEnabled`) switched on in its Standby settings. That setting is admin-only.

With it on, an unauthenticated request redirects to Console sign-in and subsequent requests authenticate via browser cookies, which is what lets the page's subresources load. With it off, every request needs an `Authorization: Bearer <token>` header — fine for `curl`, but a browser will render a blank page because it won't attach the token to `/_next/static/*`.

## The control dock

The dark bar along the bottom is prototype scaffolding, not part of the design. It drives the states a reviewer needs to see:

- **Variant** — switch between the three navigation options
- **Server mode / Service mode** — flips the product wording everywhere at once, for comparing the two names in place
- **Run support / Server support** — what the Actor declares it can do; turning one off is how you see the unsupported-mode states
- **No hiding** — keeps the mode switcher visible when a mode is unsupported, greyed out rather than removed
- **Single-tenant / Multi-tenant** — drives the tab capability rules
- **Developer** — adds the Source / Publishing / Settings tabs
- **Standby flow / Reshuffle flow** — plays the onboarding walkthroughs

## Running it locally

```bash
npm install
npm run dev      # http://localhost:3000, hot reload
npm test         # Playwright specs covering the variant rules
```

To exercise the Actor entry point rather than `next dev`:

```bash
npm run build
apify run        # serves the production build on the standby port
```

## How it is wired

`server.mjs` is the Actor entry point. It calls `Actor.init()`, answers the platform's readiness probe (`x-apify-container-server-readiness-probe`) directly so a probe never triggers a Next.js render, and hands every other request to the Next.js production handler.

It deliberately never calls `Actor.exit()` — a Standby Actor is a long-lived server and should stay up until the platform stops it on idle timeout.

## Cost note

A Standby Actor stays warm after the first request and bills until it hits its idle timeout. For a prototype that sits unused between review sessions, that is small but not zero.
