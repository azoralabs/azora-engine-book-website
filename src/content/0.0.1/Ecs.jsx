import { ApiTable, ChapterIntro, CodeBlock, Lead, Note, Section, Subheading } from './Shared.jsx'

export function EcsOverview() {
  return (
    <>
      <ChapterIntro eyebrow="Data-oriented gameplay" title="Entity Component System">
        Entities are stable identities, components are plain Azora values, and systems are functions over matching
        data. The result is explicit ownership, predictable memory access and gameplay that can be scheduled safely.
      </ChapterIntro>
      <CodeBlock title="Component vocabulary">{`@Component
pack Position {
    var value: Vec3
}

@Component
pack Velocity {
    var value: Vec3
}

@Component
pack Player

@Resource
pack MovementSettings {
    var speed: Double
}`}</CodeBlock>
      <Note>
        Decorators describe engine meaning without changing the pack into a hidden runtime object. A component remains
        ordinary Azora data that can be inspected, tested and stored densely.
      </Note>
    </>
  )
}

export function EntitiesAndStorage() {
  return (
    <Section title="Entities, Components & Storage">
      <Lead>
        An <code>Entity</code> contains an id and generation. The generation prevents a stale handle from referring to
        a different entity after an id is reused.
      </Lead>
      <CodeBlock title="Spawning and storing components">{`var world = worldInit()
var positions = storageInit<Position>(Position(Vector3::Zero))
var velocities = storageInit<Velocity>(Velocity(Vector3::Zero))

fin ship = world.spawnNamed("player")
storageInsert(positions, ship, Position(Vec3(0.0, 1.0, 0.0)))
storageInsert(velocities, ship, Velocity(Vec3(4.0, 0.0, 0.0)))

if storageHas(positions, ship) {
    fin position = storageGet(positions, ship)
    trace .Debug { "Player x = ${position.value.x}" }
}`}</CodeBlock>
      <ApiTable rows={[
        ['world.spawn()', 'Creates a live generational entity.'],
        ['world.spawnNamed(name)', 'Creates an entity and records a searchable name.'],
        ['world.despawn(entity)', 'Invalidates the entity and advances its generation.'],
        ['storageInsert(store, entity, value)', 'Adds or replaces a component and advances storage revision.'],
        ['storageRemove(store, entity)', 'Removes a component while preserving other entity data.'],
        ['storageWasAdded / storageWasChanged', 'Reads per-frame change tracking for reactive systems.'],
      ]} />
      <Subheading>Hierarchy and identity</Subheading>
      <CodeBlock>{`fin root = world.spawnNamed("scene")
fin camera = world.spawnNamed("camera")
world.setParent(camera, root)

fin found = world.lookup("camera")
assert found.isValid() { "camera must exist" }`}</CodeBlock>
      <p>
        Hierarchy is metadata on the world, not ownership. Despawning a parent does not silently decide the lifetime
        policy of every child; game code remains responsible for explicit scene teardown.
      </p>
    </Section>
  )
}

export function QueriesAndSystems() {
  return (
    <Section title="Queries & Systems">
      <Lead>
        Queries select entities by component presence and change state. System access descriptions let the scheduler
        determine which systems can run together without racing.
      </Lead>
      <CodeBlock title="Query construction">{`var query = queryFromStorage(world, positions, false)
queryWith(query, velocities)
queryWithout(query, frozen)

query.reset()
while query.hasNext() {
    fin entity = query.next()
    fin position = storageGet(positions, entity)
    fin velocity = storageGet(velocities, entity)
    storageInsert(
        positions,
        entity,
        Position(position.value + velocity.value * dt)
    )
}`}</CodeBlock>
      <ApiTable rows={[
        ['queryFromStorage', 'Starts with entities in one typed storage.'],
        ['queryWith / queryWithout', 'Requires or excludes another component storage.'],
        ['queryAdded / queryChanged', 'Restricts selection using component change tracking.'],
        ['queryScene', 'Selects live non-resource scene entities.'],
        ['queryResources', 'Selects resource entities for a storage.'],
        ['QueryAccess', 'Declares read, write and filtering sets for scheduler conflict checks.'],
      ]} />
      <CodeBlock title="Access model">{`var movementAccess = queryAccessInit("movement")
queryAccessRead(movementAccess, "Velocity")
queryAccessWrite(movementAccess, "Position")
queryAccessWith(movementAccess, "Player")

var cameraAccess = queryAccessInit("camera")
queryAccessRead(cameraAccess, "CameraTarget")
queryAccessWrite(cameraAccess, "Camera")

fin parallel = queryAccessDisjoint(movementAccess, cameraAccess)`}</CodeBlock>
      <Note tone="yellow">
        A broad query intentionally conflicts with more systems. Keep access descriptions precise so independent work
        can be scheduled in parallel.
      </Note>
    </Section>
  )
}

export function ResourcesEventsCommands() {
  return (
    <Section title="Resources, Events & Commands">
      <Lead>
        Resources hold unique world state, event queues connect producers to consumers, and command buffers postpone
        structural changes until iteration is complete.
      </Lead>
      <Subheading>Typed resources</Subheading>
      <CodeBlock>{`var score = resourceInit<Int>(0)
resourceSet(score, 120)

if resourceExists(score) {
    fin current = resourceGet(score)
}`}</CodeBlock>
      <Subheading>Events</Subheading>
      <CodeBlock>{`@Event
pack DamageEvent {
    fin target: Entity
    fin amount: Int
}

var damage = eventQueueInit<DamageEvent>(
    DamageEvent(entityInvalid(), 0)
)

eventSend(damage, DamageEvent(enemy, 25))

while eventHasNext(damage) {
    fin hit = eventNext(damage)
    applyDamage(hit.target, hit.amount)
}`}</CodeBlock>
      <Subheading>Deferred structural changes</Subheading>
      <CodeBlock>{`var commands = commandBufferInit()

query.reset()
while query.hasNext() {
    fin entity = query.next()
    if shouldRemove(entity) {
        commands.despawn(entity)
    }
}

commands.apply(world)`}</CodeBlock>
      <p>
        Removing entities while a query is walking storage can invalidate indices. A command buffer separates the
        decision from the mutation and applies it at a known synchronization point.
      </p>
    </Section>
  )
}

export function TimeAndScheduling() {
  return (
    <Section title="Time, Phases & Fixed Updates">
      <Lead>
        Render cadence and simulation cadence are different clocks. The engine advances frame time once, then drains
        as many fixed steps as needed to keep simulation deterministic.
      </Lead>
      <ApiTable rows={[
        ['SystemPhase.Startup', 'Runs once before the first frame.'],
        ['PreUpdate', 'Input interpretation and frame preparation.'],
        ['Update', 'Variable-rate gameplay and application behavior.'],
        ['PostUpdate', 'Reconciliation after normal gameplay updates.'],
        ['FixedUpdate', 'Deterministic physics and simulation steps.'],
        ['Render', 'Builds and submits visual work from completed state.'],
        ['Last', 'Cleanup and change-tracking rollover.'],
      ]} />
      <CodeBlock title="Clock setup">{`var time = timeInit()
time.setFixedDelta(1.0 / 60.0)

while app.frame() {
    time.advance(app.deltaTime())
    world.progress(time.deltaSecs)

    schedule.run(SystemPhase.Update, world, time)

    while world.consumeFixedStep() {
        schedule.run(SystemPhase.FixedUpdate, world, time)
    }

    schedule.run(SystemPhase.Render, world, time)
    app.present()
}`}</CodeBlock>
      <Note>
        Clamp unusually large frame deltas and cap simulation substeps in latency-sensitive games. Catching up forever
        after a stall is less deterministic in practice than dropping excess accumulated time under a documented
        policy.
      </Note>
    </Section>
  )
}

export function EcsPatterns() {
  return (
    <Section title="ECS Design Patterns">
      <Lead>
        Good ECS design models facts as components and behavior as systems. Components should be small enough to query
        independently, but coherent enough that every field changes for the same reason.
      </Lead>
      <Subheading>Prefer state transitions over mode flags</Subheading>
      <CodeBlock>{`@Component
enum CharacterState {
    Idle
    Running
    Jumping
    Falling
    Hurt
}

@System(.Update)
func updateAnimation(
    state: CharacterState&,
    sprite: AnimatedSprite!
) {
    when state {
        CharacterState.Running -> { sprite.playNamed("run") }
        CharacterState.Jumping -> { sprite.playNamed("jump") }
        CharacterState.Hurt -> { sprite.playNamed("hurt") }
        else -> { sprite.playNamed("idle") }
    }
}`}</CodeBlock>
      <ul>
        <li>Store reusable configuration in resources; store per-entity state in components.</li>
        <li>Send events for facts that happened once; use components for state that remains true.</li>
        <li>Separate simulation systems from rendering systems so headless execution stays possible.</li>
        <li>Use change filters for expensive derived work, not as a replacement for correct system ordering.</li>
      </ul>
    </Section>
  )
}
