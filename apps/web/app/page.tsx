import { revalidatePath } from "next/cache";

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

function getApiUrl() {
  return process.env.PULSEBOARD_API_URL ?? "http://localhost:4000";
}

async function loadProjects() {
  const response = await fetch(`${getApiUrl()}/projects`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load projects");
  return response.json() as Promise<Project[]>;
}

async function createProject(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length < 3 || description.length < 10) return;

  const response = await fetch(`${getApiUrl()}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) throw new Error("Unable to create project");
  revalidatePath("/");
}

export default async function HomePage() {
  let projects = demoProjects;
  let sourceLabel = "Demo workspace";
  let apiAvailable = false;

  try {
    const apiProjects = await loadProjects();
    apiAvailable = true;
    if (apiProjects.length > 0) {
      projects = apiProjects.map((project) => ({
        name: project.name,
        progress: project.progress,
        description: project.description,
        status: project.status,
      }));
      sourceLabel = "Live API data";
    } else {
      projects = [];
      sourceLabel = "Live workspace - no projects yet";
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
      </header>

      {apiAvailable && (
        <section aria-labelledby="create-project-heading" style={{ marginBottom: "2.5rem" }}>
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Quick create</p>
              <h2 id="create-project-heading">Start a new project</h2>
            </div>
          </div>
          <form action={createProject} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.8fr) minmax(260px, 1.5fr) auto", gap: "0.75rem" }}>
            <input name="name" minLength={3} maxLength={80} required placeholder="Project name" style={{ borderRadius: 12, border: "1px solid rgba(148,163,184,.25)", background: "rgba(15,23,42,.72)", color: "inherit", padding: "0.85rem 1rem" }} />
            <input name="description" minLength={10} maxLength={500} required placeholder="What is this project delivering?" style={{ borderRadius: 12, border: "1px solid rgba(148,163,184,.25)", background: "rgba(15,23,42,.72)", color: "inherit", padding: "0.85rem 1rem" }} />
            <button type="submit">Create project</button>
          </form>
        </section>
      )}

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
