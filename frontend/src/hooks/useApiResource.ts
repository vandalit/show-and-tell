import { useCallback, useEffect, useState } from "react";

type ResourceState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

interface ResourceRecord<T> {
  key: string | undefined;
  attempt: number;
  state: ResourceState<T>;
}

export default function useApiResource<T>(
  key: string | undefined,
  request: (signal: AbortSignal) => Promise<T>,
  missingResourceMessage = "Falta el identificador del contenido.",
) {
  const [attempt, setAttempt] = useState(0);
  const [record, setRecord] = useState<ResourceRecord<T>>();

  useEffect(() => {
    if (!key) {
      setRecord({
        key,
        attempt,
        state: { status: "error", error: missingResourceMessage },
      });
      return;
    }

    const controller = new AbortController();
    void Promise.resolve()
      .then(() => request(controller.signal))
      .then((data) => {
        if (!controller.signal.aborted) {
          setRecord({ key, attempt, state: { status: "success", data } });
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const error =
          cause instanceof Error && cause.message
            ? cause.message
            : "Ocurrió un error inesperado.";
        setRecord({ key, attempt, state: { status: "error", error } });
      });

    return () => controller.abort();
  }, [attempt, key, missingResourceMessage, request]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const state =
    record && record.key === key && record.attempt === attempt
      ? record.state
      : { status: "loading" as const };

  return { state, retry };
}
