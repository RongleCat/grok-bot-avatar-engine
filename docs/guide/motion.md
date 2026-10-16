# Motion

`poseAt(state, timeSeconds, { compact })` returns the sampled pose. `renderAvatarSvg` uses it when you pass `state` and `time`. `reducedMotion: true` forces time 0.

Scale in the clips rests at 0.6. The SVG player divides by 0.6, so idle starts at scale 1 and breathes to about 1.067 near 1.6 seconds, then back. A yaw becomes `scaleX`, clamped so the body never gets thinner than 0.72. A roll (`rotation.z`) rotates the SVG. Position is in clip units times 8 inside the 60 viewBox.

A blink key is a 0.16 second pulse, not a held shut eye. A `lids` track from 0 to 1 closes the eyes the same way. Face names on a state, or on a clip expression, change the capsule: happy is shorter, sleepy is nearly shut, surprised is taller. `inspect` maps to the inspecting face.

## States

`STATES` is the 0.70.2 list.

| State | Clips | Notes |
|---|---|---|
| idle | Idle_B, Idle_B, Idle_D, Idle_B, Idle_A | compact: Idle_B only |
| listening | Idle_D | face calm |
| thinking | Idle_B | morph thinking |
| streaming | Streaming_A, Streaming_B, Streaming_C | |
| searching | Idle_B | morph radar |
| reading, working, coding, running, computing, controlling | Working_A through Working_F | |
| waiting | Idle_B | morph orbit |
| blocked | Blocked_A | after 120 seconds, drowsy |
| finished | Done_B, Done_A | face happy, then idle |
| failed | Blocked_B | then idle |
| sleeping | Idle_B | face sleepy |
| waking | Idle_B | face surprised, then idle after 1.6 seconds |
| curious | Working_B | face inspecting |
| celebrate | Rotation_A | face happy |
| approving | Rotation_C | then idle |
| logo | Logo_A, Logo_B | |
| showcase | Marketing_A through Marketing_D | |
| turntable | Rotation_B | |

`loading` uses the `progress` morph. `orbit`, `radar`, `progress`, `spawning`, `dictating`, `sending`, `receiving`, `uploading`, `writing`, `alerting`, `bouncing`, and `powering-down` each play Idle_B with a morph of the same name. The SVG renderer records the morph on the pose and does not draw a second prop. Squash, travel, and face still play.

An unknown state name falls back to idle.

`CLIP_NAMES` lists the 28 clips: Blocked_A/B/C, Bodymoves_A, Done_A/B/C, Idle_A/B/D, Logo_A/B, Marketing_A through D, Rotation_A/B/C, Streaming_A/B/C, Working_A through F.
