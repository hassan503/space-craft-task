Modify the current enemy swarm behavior. Keep the existing architecture and working systems; make targeted changes only.

ENEMY FORMATION

- Keep the full enemy formation near the top of the playfield.
- The formation moves horizontally left and right as one swarm.
- When the swarm reaches a horizontal boundary, reverse direction.
- The swarm must NOT descend when changing direction.
- Preserve the original formation positions and spacing as enemies are removed.

ATTACKING ENEMIES

- At controlled random intervals, select one eligible living formation enemy to become an attacker.
- The selected enemy separates from the formation and moves downward toward the player.
- While attacking, it can drop bombs toward the player.
- Keep this behavior simple and predictable enough for fair gameplay.
- An attacking enemy remains part of the current wave and can be destroyed by player bullets.
- Do not collapse or rearrange the formation when an enemy leaves it.

WAVE COMPLETION

- A wave is complete only when all formation and attacking enemies from that wave have been destroyed.
- If the player is still alive, show a brief wave transition and start the next wave.
- Preserve score and remaining lives between waves.

DIFFICULTY

Increase difficulty gradually with each wave.

Prioritize:

- faster attacking-enemy movement toward the player
- increased attack frequency and/or bomb rate where appropriate

Cap difficulty values so later waves remain playable.

The horizontal formation movement can also increase slightly if already supported, but attacking-enemy speed should be the main difficulty progression.

Do not add complex dive paths, pathfinding, steering, or elaborate animations. A simple downward movement toward the player's position is sufficient for this time-boxed implementation.

Keep the retro arcade presentation and existing simple pixel-art style.

Run the existing TypeScript/build checks after making the changes and fix any errors.
