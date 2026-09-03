type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
};

const demoProjects = [
  { name: "Website relaunch", progress: 72, description: "18 tasks in the current delivery cycle.", status: "On track" },
  { name: "Mobile onboarding", progress: 46, description: "11 tasks in the current delivery cycle.", status: "Needs attention" },
  { name: "Analytics rollout", progress: 88, description: "9 tasks in the current delivery cycle.", status: "On track" },
];

async function loadProjects() {
  const apiUrl = process.env.PULSEBOARD_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${apiUrl}/projects`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load projects");
  return response.json() as Promise<Project[]>;
}

export default async function HomePage() {
  let projects = demoProjects;
  let sourceLabel = "Demo workspace";

  try {
    const apiProjects = await loadProjects();
    if (apiProjects.length > 0) {
      projects = apiProjects.map((project) => ({
        name: project.name,
        progress: project.progress,
        description: project.description,
        status: project.status,
      }));
      sourceLabel = "Live API data";
    }
  } catch {
    sourceLabel = "API offline - showing demo data";
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">PulseBoard</p>
          <h1>Team execution at a glance.</h1>
          <p className="lede">A collaborative workspace for projects, task ownership, live activity, and delivery analytics.</p>
        </div>
        <button type="button">New project</button>
      </header>

      <section className="metrics" aria-label="Workspace metrics">
        <article><strong>{projects.length}</strong><span>Visible projects</span></article>
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
          <span>{sourceLabel}</span>
        </div>

        <div className="projectGrid">
          {projects.map((project) => (
            <article className="projectCard" key={project.name}>
              <div className="projectMeta">
                <span>{project.status}</span>
                <strong>{project.progress}%</strong>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
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
