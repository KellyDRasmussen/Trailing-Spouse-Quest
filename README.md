# Trailing-Spouse-Quest
A narrative game exploring the emotional landscape of migration

Built in [Twine](https://twinery.org/) with SugarCube 2.0, this interactive fiction simulates the reality of trailing spouses.

---

## 🎮 Gameplay Summary

You sit at your kitchen table with:
- A **laptop** (emails, job boards)
- A **phone** (WhatsApp, social posts)
- A **Bullet Journal** (to reflect, commit, or procrastinate)

Time advances month by month, based on how you spend your limited energy. Some things build momentum; others just pass the time.

---

## 🧠 Design Principles

- **No fail state** — you survive, but your inner life changes
- **Stress as absence of positive factors** — no disasters, just silence
- **Discovery over instruction** — emotions emerge via systems, not exposition
- **Hidden goals** — the game learns your intent by watching, not asking

---

## 🧩 Core Systems

| System | Description |
|--------|-------------|
| `Time Bucket` | Every month has a total time cost of 1. Activities add to the bucket until it overflows and time advances. |
| `Bullet Journal` | Lets you plan, reflect, or avoid. Tracks hidden tags for goal inference and reflection generation. |
| `Hidden Variables` | Tracks stress, purpose, connection, boundaries, and more — some shift quietly over time. |
| `Opportunities` | Dynamic offers from emails, friends, or scrolling. Some unlock new reflections or goals. |
| `Life Goals` | Not chosen — inferred. The game tracks if you're trying to rebuild a career, survive, or rewire your self-worth. |

---

## 🛠 Technical Architecture

- `Trailing Spouse Experience.twee` — main source file
- `setup.*` functions — logic refactor in progress (see [`logic.js`](logic.js))
- Uses SugarCube macros: `<<run>>`, `<<link>>`, `<<if>>`, custom macros coming

### Key Twine Tags and Macros

- `<<useTime("id", value)>>` — adds time and logs the source
- `<<removeTime("id")>>` — rolls back time if a player changes their mind
- `<<run setup.jobhuntSelect(...)>>` — centralized logic for job application decisions

---

## 🧬 Game Variables

| Variable | Purpose |
|----------|---------|
| `$timeBucket` | Total time spent this month (soon deprecated in favor of `$provisionalTime`) |
| `$provisionalTime` | Current unconfirmed time use |
| `$timeLog` | Dictionary of time spent by activity ID |
| `$application_state` | "ft", "pt", "vpt", or "nope" — how seriously the player is job hunting |
| `$appsSent` | Total applications sent (used for mood/luck modifiers) |
| `$luck` | Abstract variable affected by effort, timing, and choices |
| `$connectedness`, `$stress`, `$purpose`, etc. | Emotional state proxies |

More variables will be documented inline in the `logic.js` file as refactoring continues.

---


🧾 License
All code and logic is MIT Licensed — use freely with credit.

All writing, character content, and story is Creative Commons BY-NC-SA 4.0 — share and remix noncommercially, with attribution and under the same terms.

See LICENSE-MIT and LICENSE-CC for full terms.
