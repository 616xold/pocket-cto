import { setTimeout as delay } from "node:timers/promises";

export async function waitForValue<T>(input: {
  description: string;
  inspect?: () => Promise<unknown>;
  intervalMs?: number;
  read: () => Promise<T | null>;
  timeoutMs?: number;
}): Promise<T> {
  const timeoutMs = input.timeoutMs ?? 5_000;
  const intervalMs = input.intervalMs ?? 25;
  const startedAt = Date.now();
  let attempts = 0;

  while (Date.now() - startedAt < timeoutMs) {
    attempts += 1;
    const value = await input.read();

    if (value !== null) {
      return value;
    }

    await delay(intervalMs);
  }

  const inspection = input.inspect
    ? await input.inspect().catch((error) => ({
        inspectionError:
          error instanceof Error ? error.message : "unknown inspection error",
      }))
    : null;
  const inspectionSuffix =
    inspection === null
      ? ""
      : ` Last observation: ${safeStringify(inspection)}`;

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for ${input.description} (${attempts} attempts).${inspectionSuffix}`,
  );
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
