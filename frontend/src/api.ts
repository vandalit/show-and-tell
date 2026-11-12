import type { CourseGroup, LearningSession } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`La API respondió con ${response.status} (${response.statusText}).`);
  }
  return response.json() as Promise<T>;
}

export function getDashboard(): Promise<CourseGroup[]> {
  return getJson("/api/dashboard");
}

export function getSession(sessionId: string): Promise<LearningSession> {
  return getJson(`/api/sessions/${sessionId}`);
}
