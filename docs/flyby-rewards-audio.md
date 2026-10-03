Continue the current implementation without restructuring working code.

Implement the fly-by enemy, rewards, audio, and persistence requirements.

Fly-by:

- during active gameplay, occasionally spawn a fly-by enemy crossing the top lane
- never allow more than one fly-by enemy at once
- player bullets can destroy it

When destroyed, uniformly randomly select exactly one reward:

1. Rapid Fire
   - lasts 8 active-simulation seconds
   - firing cooldown becomes 150 ms

2. Shield
   - lasts 8 active-simulation seconds
   - blocks all bomb damage
   - bomb hits do NOT consume the shield

3. Bonus
   - immediately awards 500 points

Display the reward name when received.
For Rapid Fire and Shield, visibly display remaining duration.

Audio:
Add lightweight distinct sound effects for:

- player firing
- enemy bomb dropping
- enemy destruction
- player death

Avoid external audio assets if simple Web Audio generated effects are sufficient.

Mute:

- existing mute button must immediately affect all effects
- persist mute state in localStorage
- storage errors must never prevent gameplay

Score:

- score/high score are non-negative integers
- cap at 999999
- always display exactly six digits
- persist valid high score locally
- safely handle invalid/corrupt values and localStorage failures

Keep implementation pragmatic and appropriate for the remaining time.
