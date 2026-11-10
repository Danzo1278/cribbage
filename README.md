# Cribbage

A pixel-art cribbage game in a single web page: quick games against the computer, a roguelike adventure with a branching map, relics and two bosses, plus a collection of card backs, pegs and tables.

**Play:** https://danzo1278.github.io/cribbage/

On iPhone, open the link in Safari, tap Share, then **Add to Home Screen**. After the first visit it also works offline.

Notes
- "Play a friend" connects two phones directly: one taps Host, the other enters the 4-letter code and taps Join. Uses the free PeerJS connection service (and the Open Relay TURN server as a fallback), so both phones need internet.
- Saves (stats, gems, collection) are stored on each device.
- When updating `index.html`, bump the cache name in `sw.js` (`cribbage-v1` → `cribbage-v2`) so installed copies pick up the new version.

## Cribbage Classic
A stripped-down copy with just regular cribbage (no Adventure mode, gems or Collection) lives in `classic/`:
https://danzo1278.github.io/cribbage/classic/
It keeps its own stats and settings. It is now maintained on its own (`classic/index.html` is edited directly); see `classic/CLAUDE.md`.
