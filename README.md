# Cribbage

A pixel-art cribbage game in a single web page: quick games against the computer, a roguelike adventure with a branching map, relics and two bosses, plus a collection of card backs, pegs and tables.

**Play:** https://danzo1278.github.io/cribbage/

On iPhone, open the link in Safari, tap Share, then **Add to Home Screen**. After the first visit it also works offline.

Notes
- Online "Play a friend" only works in the claude.ai version.
- Saves (stats, gems, collection) are stored on each device.
- When updating `index.html`, bump the cache name in `sw.js` (`cribbage-v1` → `cribbage-v2`) so installed copies pick up the new version.
