Build the first playable version of "Space Attack" in this existing Vite + TypeScript project.

This is a 2-hour time-boxed coding task, so keep the implementation simple, clean, modular, and practical. Do not overengineer or spend excessive time on visual polish.

Use this project structure:

src/
├── main.ts
├── game.ts
├── player.ts
├── enemy.ts
├── projectile.ts
├── waves.ts
├── collision.ts
├── ui.ts
├── audio.ts
├── sprites.ts
└── style.css

Keep responsibilities separated across these modules. Do not implement the entire game in one or two large files. At the same time, avoid unnecessary classes, abstractions, patterns, or additional files.

VISUAL DIRECTION

Use a simple retro arcade / Space Invaders-inspired presentation.

- black playfield/background
- small, sparse stars in the background
- simple white/limited-color retro UI
- crisp pixelated appearance
- no gradients, complex animations, image assets, textures, or elaborate effects
- keep visual effects extremely lightweight

Create the player and three enemy types as very simple inline SVG sprites in sprites.ts.

The SVGs should:

- look like basic pixel-art spacecraft/aliens
- use very few shapes/rectangles
- be intentionally simple and retro
- require no external assets
- avoid detailed SVG paths or artwork

Use a fixed logical game coordinate system and aspect ratio. Browser resizing and high-DPI displays should only scale presentation and must not affect gameplay coordinates or speeds.

IMPLEMENT THE CORE GAME:

Start screen:

- "SPACE ATTACK" title
- display all 3 enemy sprites with their values: 30, 20, 10
- Play button
- mute control

Gameplay HUD:

- six-digit score at top-left
- six-digit high score at top-right
- 3 life indicators at the bottom
- current wave at the bottom
- mute control positioned so it does not obstruct gameplay

Player:

- starts bottom-center
- ArrowLeft / ArrowRight movement
- stays inside playfield
- Space fires upward
- use the simple spacecraft SVG sprite

Tutorial:

- show ArrowLeft / ArrowRight movement and Space firing instructions
- keep tutorial visible until the first recognized gameplay key is pressed
- that key must still perform its gameplay action
- then dismiss the tutorial

Enemy formation:

- exactly 5 rows
- use the 3 enemy types
- top enemy type = 30 points
- middle enemy type = 20 points
- bottom enemy type = 10 points
- formation moves horizontally as one swarm
- reverses direction and descends at horizontal boundaries
- removing enemies must not collapse or alter formation spacing

Player bullets:

- move upward
- destroy exactly one enemy on collision
- award that enemy's score once
- remove the bullet after the hit
- show a very brief/simple retro destruction effect

Set up a straightforward update/render/state structure that we can extend with bombs, lives, fly-by rewards, waves, audio, pause handling, and persistence in later prompts.

Do not implement unnecessary features yet.

Prioritize:

1. Correct playable mechanics
2. Clean modular TypeScript
3. Requirement compliance
4. Simple retro presentation
5. Minor polish

Before finishing, run the available TypeScript/build check and fix obvious errors.
