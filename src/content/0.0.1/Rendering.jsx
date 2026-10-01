import { ApiTable, ChapterIntro, CodeBlock, Lead, Note, Section, Subheading } from './Shared.jsx'

export function RenderingOverview() {
  return (
    <>
      <ChapterIntro eyebrow="From world to pixels" title="Rendering">
        The renderer accepts explicit meshes, transforms, materials and UI commands. Native applications use Metal;
        browser builds use equivalent WebGL shaders through Engine WebAssembly.
      </ChapterIntro>
      <CodeBlock title="A rotating mesh">{`var app = appInit("Rendering", 1280, 720)
fin cube = app.meshCube(1.0)
var camera = cameraDefault()

while app.frame() {
    camera.pos = Vec3(0.0, 2.4, 5.5)
    app.applyCamera(camera)

    fin model = mat4RotationY(app.timeNow() * 0.8)
    app.drawMesh(cube, model, 0.22, 0.70, 1.0)
    app.present()
}

app.shutdown()`}</CodeBlock>
    </>
  )
}

export function MeshesMaterialsQueues() {
  return (
    <Section title="Meshes, Materials & Queues">
      <Lead>
        Create reusable GPU meshes outside the hot draw path, combine them with model matrices and materials, then
        submit directly or through a <code>RenderQueue</code>.
      </Lead>
      <ApiTable rows={[
        ['app.meshCube(size)', 'Creates a reusable indexed cube mesh.'],
        ['app.meshCylinder(radius, length, segments)', 'Creates a cylinder suitable for wheels and props.'],
        ['app.meshGrid(extent, divisions)', 'Creates a ground or reference grid.'],
        ['materialColor(color)', 'Creates a simple color material.'],
        ['RenderQueue.add', 'Stores mesh, transform and material submissions in order.'],
        ['app.drawRenderQueue', 'Draws every queued item for the active camera.'],
      ]} />
      <CodeBlock title="Render queue">{`var queue = renderQueueInit()
fin cube = app.meshCube(1.0)
fin blue = materialColor(colorRgb(0.25, 0.62, 0.96))

queue.add(
    cube,
    transformAt(Vec3(-1.2, 0.5, 0.0)),
    blue
)
queue.add(
    cube,
    transformAt(Vec3(1.2, 0.5, 0.0)),
    materialColor(colorRgb(0.95, 0.42, 0.32))
)

app.drawRenderQueue(queue)
queue.clear()`}</CodeBlock>
      <Note tone="yellow">
        Mesh allocation belongs in startup or asset-loading code. Recreating a mesh every frame causes avoidable GPU
        allocations and prevents batching by resource identity.
      </Note>
    </Section>
  )
}

export function CamerasAndMath() {
  return (
    <Section title="Cameras, Transforms & Math">
      <Lead>
        Cameras and transforms are plain values. Model matrices are composed explicitly, making coordinate spaces and
        update order visible in game code.
      </Lead>
      <CodeBlock title="Transform composition">{`fin position = mat4Translation(2.0, 1.0, -3.0)
fin rotation = mat4Mul(
    mat4RotationY(yaw),
    mat4RotationX(pitch)
)
fin scale = mat4Scale(1.2, 1.2, 1.2)
fin model = mat4Mul(position, mat4Mul(rotation, scale))

app.drawMesh(mesh, model, 0.8, 0.5, 0.2)`}</CodeBlock>
      <ApiTable rows={[
        ['Vec2 / Vec3', 'Vector arithmetic, dot and cross products, length and normalization.'],
        ['Mat4', 'Column-major 4x4 transform and projection matrices.'],
        ['Camera.forward()', 'World-space view direction derived from yaw and pitch.'],
        ['Camera.right()', 'World-space horizontal right direction.'],
        ['Camera.viewProj(aspect)', 'Combined view and perspective projection matrix.'],
        ['Camera.update(app, dt, moveSpeed, lookSpeed)', 'Applies keyboard and pointer input to a fly camera.'],
      ]} />
      <CodeBlock title="Camera movement">{`var camera = cameraDefault()

while app.frame() {
    camera.update(app, app.deltaTime(), 5.0, 1.8)
    app.applyCamera(camera)

    drawWorld(app)
    app.present()
}`}</CodeBlock>
    </Section>
  )
}

export function TwoDimensionalRendering() {
  return (
    <Section title="2D, Textures & Sprites">
      <Lead>
        2D commands use window coordinates with the origin at the top-left. Images and sprite regions are submitted as
        textured quads while UI geometry uses the same active frame.
      </Lead>
      <CodeBlock title="2D overlay">{`fin width = app.width() as Double
fin height = app.height() as Double

app.uiRect(16.0, 16.0, 260.0, 72.0, 0.03, 0.05, 0.08, 0.88)
app.uiTextColored("Health 84", 32.0, 30.0, 20.0, 0.92, 0.96, 1.0)

fin cursorX = app.mouseX() - 8.0
fin cursorY = app.mouseY() - 8.0
app.uiRect(cursorX, cursorY, 16.0, 16.0, 0.82, 0.31, 0.92, 0.7)`}</CodeBlock>
      <ApiTable rows={[
        ['app.newTexture', 'Uploads pixel memory into a GPU texture.'],
        ['app.updateTexture', 'Replaces texture contents without changing its handle.'],
        ['app.drawSprite', 'Draws an entire texture into a destination rectangle.'],
        ['app.drawSpriteRegion', 'Draws a UV sub-rectangle from an atlas.'],
        ['app.drawSpriteRegionFlipped', 'Draws an atlas region with horizontal or vertical mirroring.'],
        ['app.releaseTexture', 'Releases the GPU texture when its owner is disposed.'],
      ]} />
      <Note>
        Keep texture ownership explicit. An atlas, image cache or asset resource should release each GPU handle once,
        after no queued draw command can reference it.
      </Note>
    </Section>
  )
}

export function ShadersAndBackends() {
  return (
    <Section title="Shaders & Render Backends">
      <Lead>
        The engine ships equivalent 2D and 3D shader sources for Metal, Vulkan and WebGL. Gameplay code selects engine
        operations, while the build target selects the backend implementation.
      </Lead>
      <ApiTable rows={[
        ['metalShaderSource()', 'Native Metal shading language used by the current macOS renderer.'],
        ['vulkan3dVertexShaderSource()', 'Vulkan 3D vertex stage counterpart.'],
        ['vulkan3dFragmentShaderSource()', 'Vulkan lit-color fragment stage counterpart.'],
        ['webgl3dVertexShaderSource()', 'WebGL 3D vertex stage used in browser builds.'],
        ['webgl3dFragmentShaderSource()', 'WebGL 3D fragment stage counterpart.'],
        ['webgl2dVertex/FragmentShaderSource()', 'Browser sprite and UI pipeline stages.'],
      ]} />
      <CodeBlock title="Portable browser loop">{`async func main() {
    engine::run3d(960, 540)

    loop {
        fin time = await engine::nextFrame()
        engine::clear(0.025, 0.035, 0.055)
        engine::camera(5.2, 46.0)
        engine::cube(1.8, time * 0.55, time * 0.8, time * 0.2, 0.2, 0.72, 1.0)
        engine::present()
    }
}`}</CodeBlock>
      <p>
        The asynchronous frame boundary keeps the task alive and yields control to the browser between frames. A
        one-shot <code>main</code> that draws once will correctly terminate after its work completes.
      </p>
    </Section>
  )
}

export function Input() {
  return (
    <Section title="Input">
      <Lead>
        Input is normalized into keyboard, mouse, pointer, touch and gamepad views. Read held state for continuous
        motion and edge state for actions that should happen once.
      </Lead>
      <CodeBlock title="Typed input">{`fin keyboard = keyboardInput()
fin pointer = pointerInput()
fin gamepad = gamepadInput(0)

var move = Vector2::Zero
if keyboard.pressed(KeyCode.A) { move.x -= 1.0 }
if keyboard.pressed(KeyCode.D) { move.x += 1.0 }

if keyboard.justPressed(KeyCode.Space) {
    jump()
}

if pointer.pressed {
    orbit(pointer.deltaX, pointer.deltaY)
}

if gamepad.connected {
    move.x += gamepad.axis(GamepadAxis.LeftX)
    if gamepad.justPressed(GamepadButton.South) {
        jump()
    }
}`}</CodeBlock>
      <ApiTable rows={[
        ['pressed', 'True while a key, button or pointer remains down.'],
        ['justPressed', 'True only on the transition from up to down.'],
        ['justReleased', 'True only on the transition from down to up.'],
        ['PointerInput', 'Unified mouse or touch pointer coordinates, deltas and pressure.'],
        ['TouchInput.at(index)', 'Reads a stable touch id, phase, radius, pressure and movement.'],
        ['GamepadInput.rumble', 'Requests low/high-frequency haptics for a duration.'],
      ]} />
      <Note tone="yellow">
        Apply a dead zone to analog axes and multiply movement by delta time. Do not multiply pointer deltas by delta
        time; they already represent motion accumulated since the previous frame.
      </Note>
    </Section>
  )
}

export function Audio() {
  return (
    <Section title="Audio">
      <Lead>
        Sounds are explicit resources. Load once, control playback and volume through the <code>Sound</code> value,
        then release the native player when its owning scene or asset scope ends.
      </Lead>
      <CodeBlock title="Music and effects">{`var music = loadSound("assets/music/theme.wav")
var impact = loadSound("assets/audio/impact.wav")

music.setVolume(0.45)
music.playLooping()

if collisionStrength > 0.3 {
    impact.setVolume(collisionStrength)
    impact.play()
}

// During scene teardown:
music.stop()
music.release()
impact.release()`}</CodeBlock>
      <ApiTable rows={[
        ['loadSound(path)', 'Loads supported audio data into a playable resource.'],
        ['soundFromBytes', 'Creates a sound from an owned memory buffer.'],
        ['play()', 'Starts one-shot playback.'],
        ['playLooping()', 'Starts continuous playback until stopped.'],
        ['setVolume(value)', 'Sets normalized playback volume.'],
        ['isPlaying()', 'Reports the current native playback state.'],
        ['release()', 'Stops playback and releases the native resource.'],
      ]} />
    </Section>
  )
}
