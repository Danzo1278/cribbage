# Cribbage Classic — working notes

Cribbage Classic is the stripped-down version of the cribbage game in this repo: regular cribbage only.
It is played at https://danzo1278.github.io/cribbage/classic/ (GitHub Pages, deployed from `main`, folder `/classic`).

## Scope rules
- Work **only inside `classic/`**. The repo root (`index.html`, `sw.js`, icons, manifest) is the *full* game, which is maintained in a different session. Do not edit, rebuild or overwrite root files.
- Before every push: `git pull --rebase origin main` (the other session pushes to the same branch).
- Classic is now its own source. `classic/index.html` is edited directly; it is no longer generated from the full game.

## What Classic has
- Quick game vs the computer (easy / normal / hard), muggins option, hints, how to play, settings, stats.
- "Play a friend": online play, one phone each (see below).
- Art styles: Pixel (default), Rustic, Flat pastel, Standard. Table themes all unlocked.
- Removed from the full game: Adventure mode (map, relics, bosses, shop), gems, Collection screen. Some of that code is still in the file but unreachable (`RUN` is always `null`, `gems()` returns 0, `owns()` returns true, the `#rn` button does nothing). It can be deleted, but carefully: render code still checks `RUN`.

## File layout (`classic/`)
- `index.html` — the whole game: one file, vanilla JS/CSS, inline SVG and base64 pixel art (~900 KB; big data constants such as `PXSC`, `PXS`, `SCN`, `PXI`, `PXBD`, `PXLOGO` and the embedded "CribPixel" font are art, not logic).
- `manifest.webmanifest`, `icon-*.png`, `favicon.png` — Home Screen app ("Crib Classic").
- `sw.js` — offline support. Pages load **network-first** (newest version when online); other files are cache-first.
- `tests/quick.js`, `tests/online.js` — Playwright checks (see Testing).

## Publishing an update
1. Edit `classic/index.html`.
2. Bump the cache name in `classic/sw.js`: `const C='cribbage-classic-vN'` → `vN+1`. Keep the `cribbage-classic-` prefix: each game's service worker only deletes caches with its own prefix, so the two games don't wipe each other's offline copies.
3. Run the tests.
4. `git pull --rebase origin main`, commit, `git push origin main`. Pages redeploys in a minute or two. On a phone, close and reopen the app to get the update.

## Key code facts
- Game state `G` (phase `discard|peg|show|over`, `turn`, `score`, `pegs`, `hands`, `pegHands`, `crib`, `starter`, `pile`, `count`, `sel`, `shown`, `winner`, `dealer`). Player 0 is the local player.
- Settings `S`, saved in localStorage key **`crib-classic`** (the full game uses `crib`, on the same site).
- Scoring: `score(hand,starter,isCrib)` returns `{total, items, f}`; pegging: `pegScore(pile,card,count)`. Both have been checked against an independent scorer (300k hands, 1.6M pegging plays), so they are correct.
- Board: oval track `OB`, `boardSVG()`, `drawBoard()`. Pegs **leapfrog**: after the first score, only the back peg jumps past the front peg, one hop at a time (`animPeg`, queue `PQ`, capped at 2).
- Art switching: `S.art` (`pixel`, `rustic`, `cal` = Flat pastel, `''` = Standard) → `setArt()` sets `html[data-art]`/`html[data-skin]`.
- End of game: the summary popup must be seen before "Play again" shows in the table (`SUMK`, `guardOv`, 5-second fallback via `OVAT`), so fast tapping can't skip it.
- Cards don't use sticky hover lift on phones (hover rules are inside `@media (hover:hover)`).

## Online play ("Play a friend")
- Host-authoritative. The host runs the game and broadcasts each player's view (`mkView`); the guest sends actions (`hostAct`). Messages: `hi`, `st` (state), `act`, reactions.
- Transport: `mpGo()` uses the claude.ai `room` capability when present (only on claude.ai). Otherwise it uses `peerRoom()`: PeerJS loaded from jsDelivr/unpkg, peer id `cribbage-<code>` on the free PeerJS cloud, Google STUN, plus Open Relay TURN (credentials generated in the page from the public static-auth secret). The guest auto-reconnects after drops or when the app is backgrounded.
- Peer ids are shared with the full game, so a Classic phone and a full-game phone can play each other **as long as the message protocol stays compatible**. If you change the protocol, change the id prefix in `peerRoom` (e.g. `crib-classic-`) so the two never cross.
- Known fixed bugs to keep fixed: the guest must hide the home screen when the first state arrives; state updates must not close the guest's popups; the guest's cards stay sorted by rank (`mkView` sorts `pegHands`).

## Testing
Playwright and Chromium are usually pre-installed in Claude's workspace (`require('playwright')`).
- `node classic/tests/quick.js`: menus, then one full game vs the computer with real taps at iPhone 13 size. Expect `errors []`.
- `node classic/tests/online.js`: serves `classic/` on localhost:8765, two pages with a stand-in for PeerJS. It covers a wrong code, joining from the home screen, a real-tap discard, two games plus rematch, a dropped connection, a mirrored score, hidden cards, and the host leaving. Expect `errors []`.
- Real PeerJS can't be reached from the sandbox, so real-network behaviour has to be confirmed on phones.
- For iPhone layout checks use Playwright devices `iPhone 13` / `iPhone 15 Pro Max`, and 375×553 for an iPhone SE in Safari.

## Owner preferences (from building the full game)
- Keep the existing table layout; don't redesign it into a one-screen/compact layout unless asked.
- Pixel art is the default style. The player avatar is a pixel version of the drawn kid, not based on a photo.
- Pegs leapfrog one at a time (the back peg never takes the front peg's place).
