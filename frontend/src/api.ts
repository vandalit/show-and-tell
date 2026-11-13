import type {
  Course,
  Item,
  ItemSummary,
  LearningSession,
  Project,
  ProjectSummary,
} from "./types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { signal });
  } catch (cause) {
    if (cause instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Revisa la conexión e inténtalo nuevamente.",
      );
    }
    throw cause;
  }

  if (!response.ok) {
    const message =
      response.status === 404
        ? "El contenido solicitado no está disponible."
        : response.status >= 500
          ? "El servidor tuvo un problema al procesar la solicitud."
          : "No se pudo completar la solicitud.";
    throw new Error(`${message} (HTTP ${response.status}).`);
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      throw new Error("El servidor devolvió una respuesta que no se pudo leer.");
    }
    throw cause;
  }
}

export function getProjects(signal?: AbortSignal): Promise<ProjectSummary[]> {
  return getJson("/api/projects", signal);
}

export function getItems(signal?: AbortSignal): Promise<ItemSummary[]> {
  return getJson("/api/items", signal);
}

export function getItem(itemId: string, signal?: AbortSignal): Promise<Item> {
  return getJson(`/api/items/${itemId}`, signal);
}

export function getProject(
  projectId: string,
  signal?: AbortSignal,
): Promise<Project> {
  return getJson(`/api/projects/${projectId}`, signal);
}

export function getCourse(courseId: string, signal?: AbortSignal): Promise<Course> {
  return getJson(`/api/courses/${courseId}`, signal);
}

export function getSession(
  sessionId: string,
  signal?: AbortSignal,
): Promise<LearningSession> {
  return getJson(`/api/sessions/${sessionId}`, signal);
}
