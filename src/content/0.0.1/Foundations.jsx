import { ApiTable, ChapterIntro, CodeBlock, Lead, Note, Section, Steps, Subheading } from './Shared.jsx'

const firstWindow = `module game

import engine

func main() {
    var app = appInit("First Azora Game", 1280, 720)
    if !app.ok {
        return
    }

    app.setClearColor(0.035, 0.045, 0.065)

    while app.frame() {
        app.uiTitle("Hello, Azora Engine", 28.0, 28.0)

        if app.keyPressed(KEY_ESCAPE) {
            app.quit()
        }
        app.present()
    }

    app.shutdown()
}`

export function Welcome() {
  return (
    <>
      <ChapterIntro eyebrow="Azora Engine 0.0.1" title="Build the whole world">
        Azora Engine is a native application and game framework written in Azora. This book moves from the first
        window to data-oriented worlds, GPU rendering, input, audio, reactive UI, physics, animation and tilemaps.
      </ChapterIntro>
      <Note tone="green">
        Examples use Azora Lang 0.1.0-dev syntax. The facade import <code>import engine</code> exposes the public engine
        packages, while focused imports such as <code>import engine.ecs</code> keep dependency closures small.
      </Note>
      <Subheading>What the engine optimizes for</Subheading>
      <ul>
        <li>Engine and game logic remain Azora code across native LLVM and browser WebAssembly targets.</li>
        <li>State lives in explicit packs, ECS storages and resources rather than hidden object graphs.</li>
        <li>Rendering, UI and gameplay share one frame lifecycle and one observable revision model.</li>
        <li>Platform integrations stay behind small, typed modules instead of leaking into game code.</li>
      </ul>
      <CodeBlock title="src/main.az">{firstWindow}</CodeBlock>
    </>
  )
}

export function Architecture() {
  return (
    <Section title="Architecture">
      <Lead>
        The engine joins a Bevy-style ECS and schedule with Azora&apos;s reactive functions. A world contains data,
        systems transform it, and rendering derives commands from the resulting state.
      </Lead>
      <ApiTable rows={[
        ['World', 'Owns entity identity, hierarchy, resource markers and the world revision.'],
        ['Storage<T>', 'Dense typed component data with added and changed tracking.'],
        ['Schedule', 'Orders systems by phase and exposes access conflicts for parallel execution.'],
        ['App', 'Owns a platform window, GPU context, input snapshot and frame clock.'],
        ['Engine', 'Combines App, World, Time and Schedule into a complete application host.'],
        ['Signal<T>', 'Versioned observable value used by reactive resources and UI owners.'],
      ]} />
      <Subheading>One frame, one direction of data</Subheading>
      <CodeBlock title="Frame pipeline">{`Input snapshot
    -> PreUpdate
    -> Update
    -> PostUpdate
    -> FixedUpdate (zero or more times)
    -> Render
    -> Present
    -> Last`}</CodeBlock>
      <p>
        This order prevents simulation from depending on presentation. Input is sampled first, deterministic work is
        drained at the fixed timestep, and render systems only observe the completed state for that frame.
      </p>
      <Note>
        The native platform layer, Metal renderer, ECS and gameplay-facing APIs are Azora source. The tiny native ABI
        shim exists only for calling conventions that require exact C signatures.
      </Note>
    </Section>
  )
}

export function Installation() {
  return (
    <Section title="Installation & Projects">
      <Lead>
        Azora Engine is a workspace of packages. Install the engine library bundle, create a project from a template,
        and let <code>azpm</code> resolve only the packages imported by that project.
      </Lead>
      <Steps>
        <li>Install Azora Lang 0.1.0-dev and verify the compiler is available.</li>
        <li>Build or download the Azora Engine library bundle.</li>
        <li>Install the bundle in Azora Studio or under the local Azora libraries directory.</li>
        <li>Create an App, Game, ECS, 2D side-scroller or other engine template.</li>
      </Steps>
      <CodeBlock title="Build the engine library" language="bash">{`tools/package.sh
# dist/azora-engine-<version>/
# dist/azora-engine-<version>.azlib`}</CodeBlock>
      <CodeBlock title="Resolve a project" language="bash">{`tools/azpm.py graph
tools/azpm.py resolve templates/game
tools/build.sh templates/game`}</CodeBlock>
      <Subheading>Project manifest</Subheading>
      <CodeBlock title="package.azon">{`package: {
    name: "starfield"
    version: "0.1.0"
    module: "game"
    kind: "exe"
    entry: "src/main.az"
}

dependencies: {
    azora-engine: { path: "../../packages/azora-engine" }
}`}</CodeBlock>
    </Section>
  )
}

export function FirstApplication() {
  return (
    <Section title="Your First Application">
      <Lead>
        The explicit frame loop is the clearest starting point. It gives your code direct ownership of update,
        drawing and shutdown, and is ideal for small games, tools and experiments.
      </Lead>
      <CodeBlock title="src/main.az">{firstWindow}</CodeBlock>
      <Subheading>The lifecycle contract</Subheading>
      <ApiTable rows={[
        ['appInit(title, width, height)', 'Creates the resizable window, input state and GPU renderer.'],
        ['app.frame()', 'Pumps events, snapshots input, updates delta time and begins a render pass.'],
        ['app.present()', 'Ends and submits the current render pass. Call once for each successful frame.'],
        ['app.quit()', 'Requests a clean exit; the next frame boundary stops the loop.'],
        ['app.shutdown()', 'Releases platform, input and GPU resources.'],
      ]} />
      <Note tone="yellow">
        Check <code>app.ok</code> before entering the loop. Do not draw before <code>frame()</code> or after{' '}
        <code>present()</code>.
      </Note>
    </Section>
  )
}

export function ApplicationHost() {
  return (
    <Section title="The Engine Host">
      <Lead>
        For larger projects, <code>Engine</code> owns the application, world, clock and schedule. Register scheduled
        systems or stateful <code>GameSystem</code> values, then call <code>run()</code>.
      </Lead>
      <CodeBlock title="Scheduled host">{`module game

import engine

pack Scene {
    var cube: Mesh
    var ready: Bool
}

impl GameSystem for Scene {
    func run(app: App!) { self! ->
        if !self.ready {
            self.cube = app.meshCube(1.0)
            self.ready = true
        }

        fin model = mat4RotationY(app.timeNow())
        app.drawMesh(self.cube, model, 0.30, 0.72, 1.0)
    }
}

func main() {
    var host = engine("Scheduled Game", 1280, 720)
    host.setClearColor(0.025, 0.035, 0.055)
    host.addUpdateSystem(Scene(Mesh(0L, 0), false) as GameSystem)
    host.run()
}`}</CodeBlock>
      <p>
        Use a <code>GameSystem</code> when the callback naturally owns local state. Use{' '}
        <code>ScheduledSystem</code> when behavior should be ordered by phase and described through ECS access.
      </p>
    </Section>
  )
}

export function Packages() {
  return (
    <Section title="Packages & Imports">
      <Lead>
        Each subsystem is an Azora package with a <code>package.azon</code> manifest. Imports determine the transitive
        package closure and native frameworks linked into the final executable.
      </Lead>
      <ApiTable rows={[
        ['import engine', 'Imports the facade and every public engine subsystem.'],
        ['import engine.ecs', 'Worlds, entities, component storage, queries, resources and schedules.'],
        ['import engine.render', 'Cameras, materials, transforms and render queues.'],
        ['import engine.physics.d2', '2D rigid bodies, swept collisions and character movement.'],
        ['import engine.tilemap', 'Layered square, isometric and hex maps with culling and collision.'],
        ['import engine.ui', 'Immediate UI, reactive resources, DOM views and navigation.'],
      ]} />
      <CodeBlock title="Focused simulation module">{`module server.simulation

import engine.core
import engine.ecs
import engine.physics.d2

// No renderer or platform package is pulled into this module.`}</CodeBlock>
      <p>
        Focused imports are especially useful for headless tests, simulation tools and servers. The facade remains the
        ergonomic default for games that use most of the engine.
      </p>
    </Section>
  )
}
