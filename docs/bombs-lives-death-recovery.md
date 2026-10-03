Continue from the existing implementation. Do not rewrite working systems unnecessarily.

Add the remaining core combat and wave mechanics:

- Living enemies can drop downward bombs.
- Bomb spawning must use elapsed simulation time / delta time, not per-frame probability.
- Bomb rate increases with wave and is capped at a reasonable maximum.
- Swarm movement speed also increases with wave and is capped.

Player damage:

- An unshielded bomb hit removes exactly one life.
- Prevent multiple bomb hits from removing multiple lives in the same update.
- At zero lives, immediately enter game over.
- Any direct enemy/player collision causes immediate game over regardless of lives.

After losing a non-final life:

- clear all active bullets/bombs
- center the player
- pause combat for 1 second
- then resume with 1.5 active-simulation seconds of visible player invulnerability
- preserve enemies, score, lives and wave
- make invulnerability visually obvious

Waves:

- when every formation enemy is destroyed, start the next wave after a brief transition
- preserve score and remaining lives
- increment wave
- increase capped swarm speed and bomb rate

Game over:

- stop gameplay simulation
- show final score
- clearly indicate whether a new high score was achieved
- keep mute control available
- provide Play Again
- Play Again must fully restart without page reload

Keep collision/state handling deterministic and avoid unnecessary architectural changes.
