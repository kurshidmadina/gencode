# Gencode VR and Immersive Mode

Gencode Immersive Mode is a WebXR-ready learning room for solving technical missions with large readable panels, voice commands, spoken Genie guidance, and a polished browser fallback when no headset is available.

## Routes

- `/vr` opens the featured/default immersive mission.
- `/vr/[challengeSlug]` opens a challenge-specific immersive room.
- `/challenges/[slug]?mode=immersive` redirects to `/vr/[slug]`.

## What Works Today

- React Three Fiber / Three.js fallback 3D coding arena.
- WebXR capability detection through `navigator.xr.isSessionSupported("immersive-vr")`.
- Headset entry through `navigator.xr.requestSession("immersive-vr")` when the browser and device support it.
- Floating challenge board, editor/terminal panel, Genie orb, XP/rank display, streak display, voice status panel, and difficulty portal doors.
- Keyboard/mouse fallback controls for every core action.
- Real safe-judge calls from immersive mode:
  - Run tests
  - Submit answer
  - Request tracked hints
- Genie VR voice integration for short spoken responses, error explanations, and motivation.

## Voice Commands

Supported commands are parsed in `src/lib/voice/commands.ts` and can be tested without a browser.

- “Read the problem”
- “Give me a hint”
- “Explain this error”
- “Run tests”
- “Submit answer”
- “Show my progress”
- “Open next challenge”
- “Switch to dashboard”
- “Exit VR”
- “Stop speaking”
- “Switch to interview/debug/explain/code review/SQL review/Linux coach/motivation/VR mode”

When browser speech recognition is unavailable, the Immersive Control Deck exposes a keyboard command field that uses the same parser.

## Fallback Behavior

Most desktop browsers do not expose WebXR headset sessions. Gencode does not show an error in that case. It uses fallback 3D mode with the same challenge board, answer stream, safe judge controls, Genie panel, voice output, and typed command fallback.

The fallback status is determined by `src/lib/vr/support.ts`.

## Performance

- The heavy React Three Fiber scene is lazy-loaded through `next/dynamic`.
- The main VR control component does not import Canvas directly.
- The 3D canvas uses conservative DPR settings and a compact scene.
- Classic challenge pages link to `/vr/[slug]` instead of embedding the 3D renderer in the normal workspace.

## Security Model

Immersive Mode uses the existing safe challenge APIs. It does not execute arbitrary code in the browser or host process. SQL and Linux answers still go through the safe mock judge and server-side route validation.

## Known Limitations

- Browser SpeechRecognition support varies by browser and OS.
- WebXR headset entry requires HTTPS or localhost, a supported browser, and compatible hardware.
- The fallback 3D room is interactive through surrounding UI controls, not direct in-scene pointer selection yet.
- The current local judge is a safe mock judge, not the future isolated runner service.

## Future Improvements

- Direct gaze/pointer selection inside WebXR panels.
- Spatial audio for Genie.
- Live synchronized editor projection into the 3D panel.
- Controller bindings for run, hint, submit, and next challenge.
- Multiplayer arena spectating or mentor walkthrough rooms.
