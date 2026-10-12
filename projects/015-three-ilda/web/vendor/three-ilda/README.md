# three-ilda

**ILDA laser shows for Three.js — a galvanometer simulation, additive projection with soft projector beams and a post-processing pipeline, shipped as two full versions: WebGPU / TSL and WebGL 2**

![three-ilda demo](./docs/three-ilda.gif)

Load `.ild` files, replay them through a scanner model that behaves like real mirrors, and draw the result as light: a persistent trail, bloom, beam sheets that fade in haze and are cut by scene geometry. The same API is available for `THREE.WebGPURenderer` with node materials (TSL) and for `THREE.WebGLRenderer` with GLSL, and the two versions are measured against each other for parity.

Examples: `npm run dev` serves the gallery showcase plus a minimal setup and a render validation page per version, each in its own file (see [Examples](#examples)).

---

## Why it looks like a laser

Drawing an ILDA point list as a polyline looks wrong: hard corners, visible clusters of repeated points, no persistence, no light in the air. `three-ilda` treats the file as **commands for a physical scanner**:

| What you see | What's happening under the hood |
| --- | --- |
| Rounded corners and bright knots where strokes pause | A second-order mirror model per axis (`v = (v + (target − x) · gain) · dampening`) replays the points at a fixed sample rate; dwell points pile samples up in one place |
| A fading trail instead of a static drawing | Samples live in a ring buffer with birth times; brightness decays as `lightDecay ^ (age · 60)`, independent of the display frame rate |
| Clean blanked jumps, no tails | The blank flag is read a few points behind the command (`blankingOffset`), where the lagging mirror actually is |
| Soft beams from the projector to the drawing | One additive triangle per drawn segment, apex at the projector aperture, faded at both ends and modulated by 3D noise |
| Beams that stop at walls and people | The beam pass samples the scene depth and fades sheets that lie behind opaque geometry |
| Glow without washing out the lines | Bloom on the drawing, then haze compressed with `1 − exp(−x)` and suppressed where the image is already bright |

All of it runs identically in the **WebGPU / TSL version** (`three-ilda`: `WebGPURenderer`, node materials, `RenderPipeline`) and in the **WebGL 2 version** (`three-ilda/webgl`: `WebGLRenderer`, `ShaderMaterial`, render targets).

---

## Two versions, one API

| | WebGPU / TSL version | WebGL 2 version |
| --- | --- | --- |
| Import | `three-ilda` | `three-ilda/webgl` |
| Renderer | `THREE.WebGPURenderer` (WebGPU) | `THREE.WebGLRenderer` (WebGL 2) |
| Materials | `LineBasicNodeMaterial`, `MeshBasicNodeMaterial` with TSL nodes | `ShaderMaterial` with GLSL, same math |
| Post-processing | `RenderPipeline` + `PassNode`, `bloom()`, `gaussianBlur()` | `WebGLRenderTarget` + `DepthTexture`, `UnrealBloomPass`, custom blur and composite quads |
| Bloom control | `pipeline.glow.strength.value`, `radius.value`, `threshold.value` (uniform nodes) | `pipeline.glow.strength`, `radius`, `threshold` (numbers) |
| Extras | `inspect: true` labels the passes for the r185 Inspector | — |
| Shared code | `ILDALoader`, `LaserScanner`, `LaserShowBase` (playback, buffers, public API) | the same files |

Parity is measured, not assumed: `examples/validation-webgpu.html` and `examples/validation-webgl.html` run the same checks per version and read the composite back from a render target. Mean brightness is 30.43 vs 30.52 at bloom strength 15 and 0.98 vs 0.98 without bloom; beam coverage, occlusion and background handling match. Each pipeline refuses a show built for the other version, so mixing them fails loudly instead of rendering nothing.

---

## Stack

- **Three.js r185** — `three`, `three/webgpu`, `three/tsl`, `three/addons` (peer dependency `^0.185.0`)
- Plain **JavaScript ES modules**, no build step required: package exports point at `src/`
- **Vite** for the example site
- **node:test** for the parser, scanner and ownership tests (no GPU needed); GPU behaviour is validated in the browser
- Type declarations generated from the JSDoc with `tsc` (`npm run types`, runs automatically on `npm pack`)

WebGPU / TSL version: a browser with WebGPU. WebGL 2 version: any WebGL 2 browser with float colour buffers (`EXT_color_buffer_float` / `EXT_color_buffer_half_float`, available on current GPUs).

---

## Advanced techniques

### 1. Galvanometer simulation

Per sample and per axis the scanner integrates

```
v = (v + (target − x) · gain) · dampening
x = x + v
```

- `gain` is the spring; `dampening` is the fraction of velocity kept per sample, so larger means *less* damping (the name follows the reference notebook).
- On the error `e = x − target` one step is the linear map `[[1 − g·d, d], [−g·d, d]]` with trace `1 + d − g·d` and determinant `d`: the mirror converges iff `0 < d < 1` and `g < 2(1 + d) / d`. The setter ranges (`gain` ≤ 2, `dampening` ≤ 1) can never diverge; `dampening = 1` rings forever and `0` freezes the mirror.
- With the defaults `gain 0.51`, `dampening 0.39` the eigenvalues are complex with magnitude √0.39 ≈ 0.62 per sample: a step settles within 1 % in 7 samples with 0.8 % overshoot and rings with a period of ≈ 20 samples (≈ 390 Hz at 8,000 points per second). Corners round over the next 5–7 points and dwell points collapse into bright knots, as on hardware.
- Two independent axes, no torque limit, no separate position and velocity loops: deliberately minimal, so the notebook's tuned defaults carry over unchanged.

### 2. Frame-rate independent sample clock

```
requested = fraction + dt · rate;  steps = ⌊requested⌋;  fraction = requested − steps
```

- Every sample receives a `born` time exactly `1/rate` apart; 30, 60 and 120 Hz produce identical trails (covered by a test).
- IDTF stores no timing, so the animation rate is a consequence of the scan rate: `rate / pointsPerFrame` (an 800-point frame at 8,000 points per second plays at 10 fps).
- `dt ≤ 0` is ignored; clamping large gaps such as a hidden tab is the application's decision, the library never rewrites time.

### 3. Trail persistence

- Samples go into a fixed ring of `capacity` entries (default 2048) stored as flat typed arrays; nothing is allocated per frame.
- `snapshot()` unrolls the ring oldest → newest and fades each sample with `blank ? 0 : lightDecay ^ (age · 60)`. The exponent counts 60ths of a second because the reference multiplied colours by 0.95 once per 60 Hz frame; `lightDecay = 0` shows only the last 1/60 s.
- `capacity / rate` bounds visible history (256 ms at the defaults). At `lightDecay 0.95` a sample still has 45 % brightness when it leaves the ring, at 0.9 about 20 %, at 0.8 about 3 % — raise `capacity` when a long afterglow has to fade out rather than end.
- `seekFrame(i)` resets and scans exactly one frame, so a paused show is drawn immediately and parameter changes while paused re-scan the current frame instead of showing a stale trail.

### 4. Blanking offset

- The sample heading for point `i` takes the blank flag of point `i + blankingOffset`, wrapping across frame boundaries in both directions.
- The mirror trails the command by a few samples; the default −3 switches the laser where the mirror physically is, which removes the tails that appear when the beam stays on into a blanked jump or lights before the mirror has arrived.
- Blanked points keep their colour in the parsed data for exactly this reason: the standard suggests zeroing them at read time, here blanking is a scanner concern.

### 5. Projection and beam geometry

- Scanner coordinates stay normalised in [−1, 1); the vertex shader multiplies them by the uniform `(width · zoom / 2, height · zoom / 2, 0)`, so size and zoom never touch buffers.
- The drawing is `LineSegments`, not a strip: each update compacts the snapshot into `DynamicDrawUsage` attributes, keeps only segments whose two samples are unblanked and brighter than 0.001, and limits draw and update ranges to the written prefix. Additive blending without depth write: strokes and dwell knots add like light.
- Each drawn segment yields one triangle apex → a → b. The apex is uploaded as `(0, 0, 0)`; a `beamAlong` attribute (0 at the apex, 1 at the ends) lets the shader compute `mix(origin, position · scale, beamAlong)` with `origin` a uniform copied from `projector.position` — moving the projector or zooming re-uploads nothing.
- Sheet colour is `mean(colour a, colour b) · envelope · haze · beamIntensity` with `envelope = smoothstep(0, 0.025, t) · (1 − smoothstep(0.78, 1, t))` (no hot spot at the aperture, no doubling where sheets land on the drawing) and `haze = 0.7 + 0.3 · noise(1.4 · worldPosition + drift(time))` (MaterialX noise in TSL, a 3D gradient noise in GLSL).
- `DoubleSide` with `forceSinglePass`, additive, no depth write, no frustum culling. `beamMode = 'Disabled'` hides the mesh and skips beam uploads entirely.

### 6. Depth-faded beam pass and haze compositing

- The scene renders without `beamLayer` (default 31) into a half-float target with MSAA and depth. Beams render alone at half resolution, cleared to transparent black so no background is doubled, then get a separable Gaussian blur (σ 3 texels).
- Registered beam materials read the scene depth and apply `opacity = 1 − smoothstep(0.002, 0.015, sceneViewZ − viewZ)`. View z is negative, so the difference is positive exactly where a sheet lies behind an opaque surface; the band gives a soft edge instead of aliasing. Transparent objects do not occlude.
- Composite: `protect = 1 − smoothstep(0.025, 0.3, max(rgb))` and `output = projectionOutput + (1 − exp(−blurredBeams)) · 0.14 · protect`. `1 − exp(−x)` saturates stacked sheets so `beamIntensity` behaves like fog density; `protect` keeps haze off the lines and their bloom.
- Bloom (`strength 15`, `radius 1`, `threshold 0`) applies to the whole scene image because the glow of thin lines has to come from the final image; raise `threshold` in scenes with other bright content.
- While no registered show has visible beams, the WebGPU / TSL version drops the beam pass, blur and haze from the node graph (one rebuild per toggle) and the WebGL 2 version skips those passes.

### 7. Bloom parity between the versions

- TSL `bloom()` and `UnrealBloomPass` share their lineage but not their scale: `UnrealBloomPass` multiplies its composite by `3.0 · bloomStrength` "for backwards compatibility". The WebGL 2 pipeline strips that factor from the composite shader (and leaves the shader alone if a future release removes it), so `glow.strength` means the same thing in both versions.
- Measured with the validation pages: mean brightness 30.43 (WebGPU / TSL) vs 30.52 (WebGL 2) at strength 15, 11.06 vs 11.09 at strength 5, 26.24 vs 26.24 at radius 0.

### 8. Performance knobs that actually matter

- `capacity` (constructor) — trail length in samples and the size of every CPU and GPU buffer; 2048 by default, up to 65,536.
- `pointRate` — samples per second, i.e. CPU work per frame; also the animation speed.
- `beamMode = 'Disabled'` — removes the beam pass, blur and haze, not just the geometry.
- `samples` (pipeline option) — MSAA of the scene pass; the beam pass is always half resolution without MSAA.
- `zoom`, `intensity`, `beamIntensity` and `projector.position` are uniforms and free to animate; `gain`, `dampening`, `blankingOffset`, `lightDecay` and `beamMode` rebuild the buffers on the next `update()`.

---

## Quick start

Install the package next to Three.js r185:

```bash
npm install three-ilda three@^0.185.0
```

Then import from `three-ilda` (WebGPU / TSL version) or `three-ilda/webgl` (WebGL 2 version), see [Using the library](#using-the-library). Nothing needs to be built: the exports resolve to plain ES modules in `src/`, and type declarations are generated from the JSDoc.

To run the examples from a clone (Node.js 22+):

```bash
npm ci
npm run dev       # gallery, minimal examples and validation pages on http://127.0.0.1:5181
npm test          # parser, scanner, ownership, blanking, pipeline registration — both versions
npm run build     # static example site in dist-examples/
```

---

## Using the library

### WebGPU / TSL version

```js
import * as THREE from 'three/webgpu'
import { ILDALoader, LaserShow, LaserShowPipeline } from 'three-ilda'

const renderer = new THREE.WebGPURenderer({ antialias: false })
await renderer.init()

const asset = await new ILDALoader().loadAsync('/shows/example.ild')
const show = new LaserShow(asset, { track: 0, width: 4.8, height: 3.2 })
show.beamMode = 'Front'
scene.add(show)

const pipeline = new LaserShowPipeline(renderer, scene, camera) // optional: bloom, beams, haze
pipeline.add(show)
pipeline.glow.strength.value = 15

const timer = new THREE.Timer(); timer.connect(document)
renderer.setAnimationLoop(() => {
  timer.update()
  show.update(timer.getDelta()) // seconds; update(0) applies parameter changes while paused
  pipeline.render()             // or renderer.render(scene, camera) without the pipeline
})
```

### WebGL 2 version

```js
import * as THREE from 'three'
import { ILDALoader, LaserShow, LaserShowPipeline } from 'three-ilda/webgl'

const renderer = new THREE.WebGLRenderer({ antialias: false })

const asset = await new ILDALoader().loadAsync('/shows/example.ild')
const show = new LaserShow(asset, { track: 0, width: 4.8, height: 3.2 })
show.beamMode = 'Front'
scene.add(show)

const pipeline = new LaserShowPipeline(renderer, scene, camera)
pipeline.add(show)
pipeline.glow.strength = 15

const timer = new THREE.Timer(); timer.connect(document)
renderer.setAnimationLoop(() => {
  timer.update()
  show.update(timer.getDelta())
  pipeline.render()
})
```

What happens in both:

1. `ILDALoader` parses the file into frames grouped by projector track (`asset.tracks`), with positions normalised to [−1, 1), colours in [0, 1] and blank flags.
2. `LaserShow` builds a `LaserScanner` for one track and owns its GPU buffers; several shows may share one asset.
3. `LaserShowPipeline.add(show)` moves the beam mesh to the reserved layer and installs the depth fade; `remove(show)` restores it.
4. `show.update(dt)` advances the scanner and uploads the compacted segments; `pipeline.render()` draws the scene, bloom, beams and haze.

Teardown: `pipeline.dispose(); scene.remove(show); show.dispose()`. The asset stays valid for other shows.

```ts
ILDAAsset {
  frames: ILDAFrame[]                 // file order; palette records excluded
  tracks: Map<number, ILDAFrame[]>    // the same objects grouped by projector, keys in order of first appearance
  totalPoints, blanked, paletteFallbacks: number
  eof: boolean                        // explicit end-of-file record seen
  bytes, parseTimeMs: number
}
ILDAFrame { number, name, projector, count, position: Float32Array, color: Float32Array, blank: Uint8Array }
```

---

## Parameters

Defaults come from the reference notebook; ranges are enforced by the setters (`RangeError` outside them).

### Playback and scanner (`LaserShow`)

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `playing` | `boolean` | `true` | — | Advance the scanner and the fade clock in `update()` |
| `pointRate` | `number` | `8000` | `1` – `100000` | Scanner samples per second; the animation rate is `pointRate / pointsPerFrame` |
| `gain` | `number` | `0.51` | `0.001` – `2` | Mirror spring constant |
| `dampening` | `number` | `0.39` | `0` – `1` | Velocity kept per sample; larger = less damping, `0` freezes, `1` rings forever |
| `blankingOffset` | `number` (int) | `-3` | `-100` – `100` | Which point's blank flag applies to the current sample, in points |
| `lightDecay` | `number` | `0.95` | `0` – `1` | Afterglow factor per 1/60 s; `0` shows only the last 1/60 s |

### Projection and beams (`LaserShow`)

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `zoom` | `number` | `1` | `0` – `4` | Multiplies the projection size (uniform, free to animate) |
| `intensity` | `number` | `1` | `0` – `100` | Line colour multiplier (uniform) |
| `beamMode` | `'Disabled' \| 'Front' \| 'Back'` | `'Disabled'` | — | Beam sheets on the local +Z or −Z side of the image plane; `Disabled` also skips the beam passes |
| `beamIntensity` | `number` | `0.5` | `0` – `2` | Sheet colour multiplier, acts like fog density through the haze compression |
| `projector.position` | `Vector3` | `(-2.2, -1.4, 3)` | — | Beam origin in the show's local units; `Front` / `Back` flip the sign of `z`, keeping it ≥ 0.1 from the plane |
| `setProjectionSize(width, height)` | method | `4.8 × 3.2` | `0.001` – `10000` | Full image size in local units at `zoom = 1` |

### Constructor and lifecycle (`LaserShow`)

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `new LaserShow(asset, { track, capacity, width, height })` | constructor | first track, `2048`, `4.8`, `3.2` | `capacity` is the trail length in samples (`2` – `65536`) and fixes every buffer size |
| `update(deltaSeconds)` | method | — | Call once per frame; `update(0)` applies pending changes while paused |
| `setData(asset, track?)` / `setTrack(id)` | methods | — | Replace the show or switch projector track; a fresh scanner, immediate upload |
| `seekFrame(index)` / `reset()` | methods | — | Seek (re-scans one frame) or clear the trail; `playing` is untouched |
| `frame`, `frameCount`, `trackIds`, `time`, `projectionSize`, `asset`, `track`, `scanner` | read-only | — | Playback information |
| `clone()` | method | — | Shares the asset, copies scanner state including the ring, allocates new GPU resources |
| `dispose()` | method | — | Frees this instance's geometry and materials and emits `dispose`; the asset stays usable |

### Pipeline (`LaserShowPipeline`)

| Option / member | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `beamLayer` | `number` (int) | `31` | `1` – `31` | Layer reserved for registered beam meshes |
| `strength` | `number` | `15` | — | Bloom strength; later via `glow.strength.value` (WebGPU / TSL) or `glow.strength` (WebGL 2) |
| `radius` | `number` | `1` | `0` – `1` | Bloom radius, weights the larger mips |
| `threshold` | `number` | `0` | — | Bloom luminance threshold; raise it in scenes with other bright content |
| `samples` | `number` (int) | `4` | — | MSAA sample count of the scene pass |
| `inspect` | `boolean` | `false` | — | WebGPU / TSL version only: `toInspector()` labels for the scene, bloom and beam textures |
| `add(show)` / `remove(show)` | methods | — | — | Register a show (one pipeline per show at a time); `remove` restores layers and material state |
| `render()` | method | — | — | Render the host scene and camera through the pipeline into the current render target |
| `dispose()` | method | — | — | Free passes, targets and nodes; nothing of the application's |

### Loader (`ILDALoader`)

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `load(url, onLoad, onProgress?, onError?)` / `loadAsync(url)` | methods | — | Standard `THREE.Loader` API through `FileLoader`; parse errors reach `onError` and the `LoadingManager` |
| `parse(arrayBuffer)` | method | — | Synchronous; formats 0, 1, 2, 4, 5; limits 32 MiB and 2,000,000 points |
| `setFallbackPalette(triplets \| null)` | method | `ILDA_DEFAULT_PALETTE` | 1–256 `[r, g, b]` byte triplets for indexed frames whose projector has no palette record; `null` restores the 64-entry Appendix A palette |
| `paletteFallbacks` (result) | `number` | — | Indices outside the palette became white and were counted instead of throwing |

---

## Architecture (source map)

```
src/
  index.js                              # WebGPU / TSL version entry
  webgl.js                              # WebGL 2 version entry
  loaders/ILDALoader.js                 # IDTF formats 0/1/2/4/5 → typed arrays (shared)
  core/LaserScanner.js                  # mirror model, sample clock, ring buffer (shared)
  core/LaserShowBase.js                 # scene graph, compaction, uploads, public API (shared)
  objects/LaserShow.js                  # TSL materials (WebGPU / TSL version)
  postprocessing/LaserShowPipeline.js   # RenderPipeline: scene pass, bloom(), beam pass, blur, haze
  webgl/LaserShow.js                    # GLSL ShaderMaterials (WebGL 2 version)
  webgl/LaserShowPipeline.js            # render targets, DepthTexture, UnrealBloomPass, blur, composite

examples/                               # gallery showcase, *-webgpu.html and *-webgl.html pages per version, ILDA collection
test/                                   # node:test suites, run for both versions
types/                                  # .d.ts generated from the JSDoc by npm run types, not committed
```

### Key exports for reuse

| Export | From | Role |
| --- | --- | --- |
| `ILDALoader`, `ILDA_DEFAULT_PALETTE` | `three-ilda`, `three-ilda/webgl` | Parse `.ild` files; no renderer dependency |
| `LaserScanner`, `SCANNER_DEFAULTS`, `TRAIL_POINTS` | `three-ilda`, `three-ilda/webgl` | The scanner alone, for workers or other renderers |
| `LaserShow` | `three-ilda` / `three-ilda/webgl` | The playable object for the respective renderer |
| `LaserShowPipeline` | `three-ilda` / `three-ilda/webgl` | Optional bloom, beams and haze for the respective renderer |
| `LaserShowBase` | `three-ilda/core/LaserShowBase.js` | Bring your own materials: implement `_createMaterials()` for another renderer |

---

## Examples

| Page | Version | What it shows |
| --- | --- | --- |
| `index.html` | WebGPU / TSL | The gallery showcase: the ILDA collection with live previews, one `LaserShow` and one pipeline, every parameter in the Inspector |
| `minimal-webgpu.html` | WebGPU / TSL | The smallest complete setup: renderer, one show, the pipeline and the loop, about 40 lines |
| `minimal-webgl.html` | WebGL 2 | The same setup on `WebGLRenderer` through `three-ilda/webgl` |
| `validation-webgpu.html` | WebGPU / TSL | Render checks by render-target readback: beams on both sides, complete occlusion by an opaque wall, no doubled background, exact restore on `Disabled`, mean brightness with and without bloom |
| `validation-webgl.html` | WebGL 2 | The same checks for the WebGL 2 version, so the two reports can be compared line by line |

Each page imports exactly one version. Details in [examples/README.md](./examples/README.md).

---

## Browser / renderer notes

- WebGPU / TSL version: create `THREE.WebGPURenderer` and `await renderer.init()` before the first frame. It needs a browser with WebGPU; for WebGL 2 browsers use the WebGL 2 version.
- WebGL 2 version: the pipeline allocates half-float targets and a `DepthTexture`, sizes them from the drawing buffer on each `render()` and composites into whatever render target is current, so it can feed a further pass.
- One pipeline per camera view. It renders the host's scene and camera and reserves `beamLayer`; XR and multi-view rendering need their own integration.
- Both pipelines assume a dark scene: `protect` and bloom read the whole image, so a bright background suppresses haze and blooms itself.
- The library owns no clock. `THREE.Timer.connect(document)` avoids catch-up after a hidden tab; the examples also clamp `dt` to 0.1 s.
- The examples render with `LinearSRGBColorSpace` output and no tone mapping so the default `intensity` and bloom values look the same in both versions; with sRGB output or tone mapping expect brighter, softer lines.
- Toggling beams rebuilds the node graph once in the WebGPU / TSL version (a short hitch on first use); the WebGL 2 version just skips passes.

---

## Credits

- The scanner algorithm follows [Tom Larkworthy's ILDA laser show player](https://observablehq.com/@tomlarkworthy/ilda-laser-show-player).
- File parsing follows [ILDA IDTF revision 011](https://www.ilda.com/resources/StandardsDocs/ILDA_IDTF14_rev011.pdf).
- The ILDA collection and further notices are listed in [CREDITS.md](./CREDITS.md).

---

## License

MIT © Artem Korenevych. See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).
