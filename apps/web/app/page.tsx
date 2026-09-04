import { revalidatePath } from "next/cache";

type Project = { id: string; name: string; description: string; status: string; progress: number };
type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
type Task = { id: string; projectId: string; title: string; description: string; status: TaskStatus; priority: "low" | "medium" | "high" | "urgent" };
type ActivityEvent = { id: string; projectId: string; actorId: string; type: "project.created" | "task.created" | "task.updated" | "task.completed"; message: string; createdAt: string };

const demoProjects: Project[] = [
  { id: "demo-website", name: "Website relaunch", progress: 72, description: "18 tasks in the current delivery cycle.", status: "On track" },
  { id: "demo-mobile", name: "Mobile onboarding", progress: 46, description: "11 tasks in the current delivery cycle.", status: "Needs attention" },
  { id: "demo-analytics", name: "Analytics rollout", progress: 88, description: "9 tasks in the current delivery cycle.", status: "On track" },
];
const demoTaskMetrics = { open: 21, inProgress: 7, completed: 16 };
const statuses: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" }, { value: "todo", label: "To do" }, { value: "in_progress", label: "In progress" }, { value: "review", label: "Review" }, { value: "done", label: "Done" },
];

function getApiUrl() { return process.env.PULSEBOARD_API_URL ?? "http://localhost:4000"; }
async function loadProjects() { const response = await fetch(`${getApiUrl()}/projects`, { cache: "no-store" }); if (!response.ok) throw new Error("Unable to load projects"); return response.json() as Promise<Project[]>; }
async function loadTasks() { const response = await fetch(`${getApiUrl()}/tasks`, { cache: "no-store" }); if (!response.ok) throw new Error("Unable to load tasks"); return response.json() as Promise<Task[]>; }
async function loadActivity() { const response = await fetch(`${getApiUrl()}/activity?limit=8`, { cache: "no-store" }); if (!response.ok) throw new Error("Unable to load activity"); return response.json() as Promise<ActivityEvent[]>; }

async function createProject(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim(); const description = String(formData.get("description") ?? "").trim();
  if (name.length < 3 || description.length < 10) return;
  const response = await fetch(`${getApiUrl()}/projects`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
  if (!response.ok) throw new Error("Unable to create project"); revalidatePath("/");
}

async function createTask(formData: FormData) {
  "use server";
  const projectId = String(formData.get("projectId") ?? "").trim(); const title = String(formData.get("title") ?? "").trim(); const description = String(formData.get("description") ?? "").trim(); const priority = String(formData.get("priority") ?? "medium"); const dueDateInput = String(formData.get("dueDate") ?? "").trim();
  if (!projectId || title.length < 3 || description.length < 5 || !["low", "medium", "high", "urgent"].includes(priority)) return;
  const response = await fetch(`${getApiUrl()}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, title, description, priority, dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null }) });
  if (!response.ok) throw new Error("Unable to create task"); revalidatePath("/");
}

async function updateTaskStatus(formData: FormData) {
  "use server";
  const taskId = String(formData.get("taskId") ?? "").trim(); const status = String(formData.get("status") ?? "") as TaskStatus;
  if (!taskId || !statuses.some((option) => option.value === status)) return;
  const response = await fetch(`${getApiUrl()}/tasks/${encodeURIComponent(taskId)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error("Unable to update task status"); revalidatePath("/");
}

const fieldStyle = { borderRadius: 12, border: "1px solid rgba(148,163,184,.25)", background: "rgba(15,23,42,.72)", color: "inherit", padding: "0.85rem 1rem" };

export default async function HomePage() {
  let projects = demoProjects; let sourceLabel = "Demo workspace"; let apiAvailable = false; let taskMetrics = demoTaskMetrics; let recentTasks: Task[] = []; let recentActivity: ActivityEvent[] = [];
  try {
    const [apiProjects, apiTasks, apiActivity] = await Promise.all([loadProjects(), loadTasks(), loadActivity()]); apiAvailable = true; projects = apiProjects; sourceLabel = apiProjects.length > 0 ? "Live API data" : "Live workspace - no projects yet";
    const completed = apiTasks.filter((task) => task.status === "done").length; const inProgress = apiTasks.filter((task) => task.status === "in_progress" || task.status === "review").length;
    taskMetrics = { open: apiTasks.length - completed, inProgress, completed }; recentTasks = apiTasks.slice(0, 5); recentActivity = apiActivity;
  } catch { sourceLabel = "API offline - showing demo data"; }

  return <main className="shell">
    <header className="hero"><div><p className="eyebrow">PulseBoard</p><h1>Team execution at a glance.</h1><p className="lede">A collaborative workspace for projects, task ownership, live activity, and delivery analytics.</p></div></header>
    {apiAvailable && <section aria-labelledby="create-project-heading" style={{ marginBottom: "2.5rem" }}><div className="sectionHeading"><div><p className="eyebrow">Quick create</p><h2 id="create-project-heading">Start a new project</h2></div></div><form action={createProject} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.8fr) minmax(260px, 1.5fr) auto", gap: "0.75rem" }}><input name="name" minLength={3} maxLength={80} required placeholder="Project name" style={fieldStyle} /><input name="description" minLength={10} maxLength={500} required placeholder="What is this project delivering?" style={fieldStyle} /><button type="submit">Create project</button></form></section>}
    {apiAvailable && projects.length > 0 && <section aria-labelledby="create-task-heading" style={{ marginBottom: "2.5rem" }}><div className="sectionHeading"><div><p className="eyebrow">Add work</p><h2 id="create-task-heading">Create a task</h2></div><span>Assign it to an active project</span></div><form action={createTask} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: "0.75rem" }}><select name="projectId" required defaultValue="" aria-label="Project" style={fieldStyle}><option value="" disabled>Select project</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select><input name="title" minLength={3} maxLength={120} required placeholder="Task title" style={fieldStyle} /><input name="description" minLength={5} maxLength={1000} required placeholder="Task description" style={fieldStyle} /><select name="priority" defaultValue="medium" aria-label="Priority" style={fieldStyle}><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option><option value="urgent">Urgent</option></select><input name="dueDate" type="datetime-local" aria-label="Due date" style={fieldStyle} /><button type="submit">Add task</button></form></section>}
    <section className="metrics" aria-label="Workspace metrics"><article><strong>{projects.length}</strong><span>Visible projects</span></article><article><strong>{taskMetrics.open}</strong><span>Open tasks</span></article><article><strong>{taskMetrics.inProgress}</strong><span>In progress</span></article><article><strong>{taskMetrics.completed}</strong><span>Completed</span></article></section>
    <section><div className="sectionHeading"><div><p className="eyebrow">Workspace</p><h2>Project pulse</h2></div><span>{sourceLabel}</span></div><div className="projectGrid">{projects.map((project) => <article className="projectCard" key={project.id}><div className="projectMeta"><span>{project.status}</span><strong>{project.progress}%</strong></div><h3>{project.name}</h3><p>{project.description}</p><div className="progressTrack" aria-label={`${project.progress}% complete`}><span style={{ width: `${project.progress}%` }} /></div></article>)}</div></section>
    {apiAvailable && recentTasks.length > 0 && <section style={{ marginTop: "2.5rem" }}><div className="sectionHeading"><div><p className="eyebrow">Task flow</p><h2>Recent work</h2></div><span>{recentTasks.length} most recent tasks</span></div><div className="projectGrid">{recentTasks.map((task) => <article className="projectCard" key={task.id}><div className="projectMeta"><span>{task.status.replaceAll("_", " ")}</span><strong>{task.priority}</strong></div><h3>{task.title}</h3><p>{task.description}</p><form action={updateTaskStatus} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}><input type="hidden" name="taskId" value={task.id} /><select name="status" defaultValue={task.status} aria-label={`Status for ${task.title}`} style={{ ...fieldStyle, flex: 1 }}>{statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button type="submit">Update</button></form></article>)}</div></section>}
    {apiAvailable && <section style={{ marginTop: "2.5rem" }} aria-labelledby="activity-heading"><div className="sectionHeading"><div><p className="eyebrow">Activity</p><h2 id="activity-heading">Workspace timeline</h2></div><span>{recentActivity.length > 0 ? `${recentActivity.length} latest events` : "No activity yet"}</span></div>{recentActivity.length > 0 && <div className="projectGrid">{recentActivity.map((event) => { const project = projects.find((item) => item.id === event.projectId); return <article className="projectCard" key={event.id}><div className="projectMeta"><span>{event.type.replaceAll(".", " ")}</span><strong>{project?.name ?? "Workspace"}</strong></div><h3>{event.message}</h3><p>Actor: {event.actorId || "anonymous"}</p><p><time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</time></p></article>; })}</div>}</section>}
  </main>;
}
