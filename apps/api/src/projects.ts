import type { Project } from "@pulseboard/shared";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(500),
});

const projects: Project[] = [];

export function listProjects(): Project[] {
  return [...projects];
}

export function createProject(input: z.infer<typeof createProjectSchema>): Project {
  const project: Project = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    status: "planning",
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  projects.unshift(project);
  return project;
}
