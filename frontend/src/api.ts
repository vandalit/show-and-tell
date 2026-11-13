import type { Course, LearningSession, Project, ProjectSummary } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`La API respondió con ${response.status} (${response.statusText}).`);
  }
  return response.json() as Promise<T>;
}

export function getProjects(): Promise<ProjectSummary[]> {
  return getJson("/api/projects");
}

export function getProject(projectId: string): Promise<Project> {
  return getJson(`/api/projects/${projectId}`);
}

export function getCourse(courseId: string): Promise<Course> {
  return getJson(`/api/courses/${courseId}`);
}

export function getSession(sessionId: string): Promise<LearningSession> {
  return getJson(`/api/sessions/${sessionId}`);
}
