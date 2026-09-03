const projects = [
  { name: "Website relaunch", progress: 72, tasks: 18, status: "On track" },
  { name: "Mobile onboarding", progress: 46, tasks: 11, status: "Needs attention" },
  { name: "Analytics rollout", progress: 88, tasks: 9, status: "On track" },
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">PulseBoard</p>
          <h1>Team execution at a glance.</h1>
          <p className="lede">
            A collaborative workspace for projects, task ownership, live activity, and delivery analytics.
          </p>
        </div>
        <button type="button">New project</button>
      </header>

      <section className="metrics" aria-label="Workspace metrics">
        <article><strong>3</strong><span>Active projects</span></article>
        <article><strong>21</strong><span>Open tasks</span></article>
        <article><strong>7</strong><span>In progress</span></article>
        <article><strong>84%</strong><span>On-time rate</span></article>
      </section>

      <section>
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>Project pulse</h2>
          </div>
          <span>Live collaboration foundation</span>
        </div>

        <div className="projectGrid">
          {projects.map((project) => (
            <article className="projectCard" key={project.name}>
              <div className="projectMeta">
                <span>{project.status}</span>
                <strong>{project.progress}%</strong>
              </div>
              <h3>{project.name}</h3>
              <p>{project.tasks} tasks in the current delivery cycle.</p>
              <div className="progressTrack" aria-label={`${project.progress}% complete`}>
                <span style={{ width: `${project.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
