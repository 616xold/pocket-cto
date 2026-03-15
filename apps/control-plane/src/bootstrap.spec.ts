import { loadEnv } from "@pocket-cto/config";
import { describe, expect, it, vi } from "vitest";
import type { AppContainer, EmbeddedWorkerContainer } from "./lib/types";
import { createServerContainer, resolveServerControlMode } from "./bootstrap";
import { createRawEnv } from "./test/env";

describe("server control mode", () => {
  it("parses CONTROL_PLANE_EMBEDDED_WORKER and defaults it to false", () => {
    expect(loadEnv(createRawEnv()).CONTROL_PLANE_EMBEDDED_WORKER).toBe(false);
    expect(
      loadEnv(
        createRawEnv({
          CONTROL_PLANE_EMBEDDED_WORKER: "true",
        }),
      ).CONTROL_PLANE_EMBEDDED_WORKER,
    ).toBe(true);
  });

  it("keeps the server in api_only mode when the flag is unset", () => {
    const env = loadEnv(createRawEnv());

    expect(resolveServerControlMode(env)).toBe("api_only");
  });

  it("selects the api-only container when embedded mode is disabled", async () => {
    const createApiOnlyContainer = vi.fn(async () => createAppContainer("api_only"));
    const createEmbeddedWorkerContainer = vi.fn(
      async () => createEmbeddedAppContainer(),
    );

    const container = await createServerContainer({
      env: {
        CONTROL_PLANE_EMBEDDED_WORKER: false,
      },
      factories: {
        createApiOnlyContainer,
        createEmbeddedWorkerContainer,
      },
    });

    expect(createApiOnlyContainer).toHaveBeenCalledOnce();
    expect(createEmbeddedWorkerContainer).not.toHaveBeenCalled();
    expect(container.operatorControl.liveControl.mode).toBe("api_only");
  });

  it("selects the embedded worker container when embedded mode is enabled", async () => {
    const createApiOnlyContainer = vi.fn(async () => createAppContainer("api_only"));
    const createEmbeddedWorkerContainer = vi.fn(
      async () => createEmbeddedAppContainer(),
    );

    const container = await createServerContainer({
      env: {
        CONTROL_PLANE_EMBEDDED_WORKER: true,
      },
      factories: {
        createApiOnlyContainer,
        createEmbeddedWorkerContainer,
      },
    });

    expect(createApiOnlyContainer).not.toHaveBeenCalled();
    expect(createEmbeddedWorkerContainer).toHaveBeenCalledOnce();
    expect(container.operatorControl.liveControl.mode).toBe("embedded_worker");
    expect("worker" in container).toBe(true);
  });
});

function createAppContainer(
  mode: AppContainer["operatorControl"]["liveControl"]["mode"],
): AppContainer {
  return {
    githubAppService: {
      async listInstallations() {
        return [];
      },
      async syncInstallations() {
        return {
          installations: [],
          syncedAt: "2026-03-15T00:00:00.000Z",
          syncedCount: 0,
        };
      },
    } as AppContainer["githubAppService"],
    githubWebhookService: {
      async ingest() {
        return {
          accepted: true,
          duplicate: false,
          deliveryId: "delivery-test",
          eventName: "installation",
          action: "created",
          handledAs: "installation_state_updated",
          persistedAt: "2026-03-15T00:00:00.000Z",
        };
      },
    } as AppContainer["githubWebhookService"],
    missionService: {
      async createFromText() {
        throw new Error("createFromText should not be called in this test");
      },
      async getMissionDetail() {
        throw new Error("getMissionDetail should not be called in this test");
      },
    } as AppContainer["missionService"],
    operatorControl: {
      approvalService: {
        async listMissionApprovals() {
          return [];
        },
        async resolveApproval() {
          throw new Error("resolveApproval should not be called in this test");
        },
      } as AppContainer["operatorControl"]["approvalService"],
      liveControl: {
        enabled: mode === "embedded_worker",
        limitation: "single_process_only",
        mode,
      },
      runtimeControlService: {
        async interruptActiveTurn() {
          throw new Error(
            "interruptActiveTurn should not be called in this test",
          );
        },
      } as AppContainer["operatorControl"]["runtimeControlService"],
    },
    replayService: {
      async getMissionEvents() {
        return [];
      },
    } as AppContainer["replayService"],
  };
}

function createEmbeddedAppContainer(): EmbeddedWorkerContainer {
  return {
    ...createAppContainer("embedded_worker"),
    worker: {} as EmbeddedWorkerContainer["worker"],
  };
}
