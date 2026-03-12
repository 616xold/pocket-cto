import process from "node:process";
import readline from "node:readline";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";

const { mode, threadId: seedThreadId } = readFlags(process.argv.slice(2));

let sawInitialize = false;
let sawInitialized = false;
let activeThreadId = seedThreadId;
let activeTurn = null;
let sawDirectTurnMissing = false;
let sawResumeGap = false;
let threadStartCount = 0;
const loadedThreadIds = new Set();
let pendingServerRequest = null;

const readlineInterface = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

process.stderr.write("fake-app-server booted\n");

readlineInterface.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }

  let message;

  try {
    message = JSON.parse(trimmed);
  } catch (error) {
    writeError(null, -32700, `Invalid JSON: ${String(error)}`);
    return;
  }

  if (!message.method && message.id !== undefined) {
    void handleServerRequestResponse(message);
    return;
  }

  if (message.method === "initialize") {
    sawInitialize = true;
    process.stderr.write("initialize received\n");
    write({
      id: message.id,
      result: {
        userAgent: "fake-codex-app-server/1.0.0",
      },
    });
    return;
  }

  if (message.method === "initialized") {
    sawInitialized = true;
    process.stderr.write("initialized received\n");
    return;
  }

  if (message.method === "thread/start") {
    if (!sawInitialize || !sawInitialized) {
      writeError(
        message.id,
        -32000,
        "initialize handshake incomplete before thread/start",
      );
      return;
    }

    if (mode === "thread-start-error") {
      writeError(message.id, -32001, "simulated thread/start failure");
      return;
    }

    threadStartCount += 1;

    const cwd = message.params?.cwd ?? process.cwd();
    const approvalPolicy = message.params?.approvalPolicy ?? "untrusted";
    const sandboxMode = message.params?.sandbox ?? "workspace-write";
    activeThreadId = buildStartedThreadId({
      seed: seedThreadId,
      count: threadStartCount,
      replacement: sawResumeGap || sawDirectTurnMissing,
    });
    loadedThreadIds.add(activeThreadId);

    const thread = buildThread(activeThreadId, cwd);

    write({
      id: message.id,
      result: {
        thread,
        model: message.params?.model ?? "gpt-5.2-codex",
        modelProvider: message.params?.modelProvider ?? "openai",
        serviceTier: null,
        cwd,
        approvalPolicy,
        sandbox: buildSandboxPolicy(sandboxMode, cwd),
        reasoningEffort: null,
      },
    });

    write({
      method: "thread/started",
      params: {
        thread,
      },
    });
    return;
  }

  if (message.method === "thread/resume") {
    if (!sawInitialize || !sawInitialized) {
      writeError(
        message.id,
        -32000,
        "initialize handshake incomplete before thread/resume",
      );
      return;
    }

    const resumedThreadId = message.params?.threadId ?? activeThreadId;

    if (isResumeGapMode(mode)) {
      sawResumeGap = true;
      writeError(
        message.id,
        -32600,
        `no rollout found for thread id ${resumedThreadId}`,
      );
      return;
    }

    const cwd = message.params?.cwd ?? process.cwd();
    const approvalPolicy = message.params?.approvalPolicy ?? "untrusted";
    const sandboxMode = message.params?.sandbox ?? "workspace-write";
    const thread = buildThread(resumedThreadId, cwd);
    activeThreadId = resumedThreadId;
    loadedThreadIds.add(resumedThreadId);

    write({
      id: message.id,
      result: {
        thread,
        model: message.params?.model ?? "gpt-5.2-codex",
        modelProvider: message.params?.modelProvider ?? "openai",
        serviceTier: null,
        cwd,
        approvalPolicy,
        sandbox: buildSandboxPolicy(sandboxMode, cwd),
        reasoningEffort: null,
      },
    });
    return;
  }

  if (message.method === "turn/start") {
    if (!sawInitialize || !sawInitialized) {
      writeError(
        message.id,
        -32000,
        "initialize handshake incomplete before turn/start",
      );
      return;
    }

    if (mode === "turn-start-error") {
      writeError(message.id, -32002, "simulated turn/start failure");
      return;
    }

    const targetThreadId = message.params?.threadId ?? activeThreadId;

    if (
      mode === "resume-gap-direct-turn-failed" &&
      !loadedThreadIds.has(targetThreadId)
    ) {
      sawDirectTurnMissing = true;
      writeError(message.id, -32600, `thread not found: ${targetThreadId}`);
      return;
    }

    if (
      mode === "resume-gap-direct-turn-success" &&
      targetThreadId !== seedThreadId &&
      !loadedThreadIds.has(targetThreadId)
    ) {
      writeError(message.id, -32600, `thread not found: ${targetThreadId}`);
      return;
    }

    const turn = buildTurn("turn_fake_123", "inProgress", null);
    const lifecycle = buildLifecycle(mode);
    const turnApprovalPolicy = message.params?.approvalPolicy ?? "untrusted";
    const turnSandboxPolicy = message.params?.sandboxPolicy ?? null;
    const turnCwd = message.params?.cwd ?? process.cwd();
    activeTurn = {
      cwd: turnCwd,
      threadId: targetThreadId,
      turnId: turn.id,
    };

    write({
      id: message.id,
      result: {
        turn,
      },
    });

    queueNotification({
      method: "turn/started",
      params: {
        threadId: targetThreadId,
        turn,
      },
    });

    if (
      mode === "file-change-approval" &&
      allowsInteractiveApproval({
        approvalPolicy: turnApprovalPolicy,
        sandboxPolicy: turnSandboxPolicy,
      })
    ) {
      const approvalRequest = buildFileChangeApprovalRequest({
        cwd: turnCwd,
        threadId: targetThreadId,
        turnId: turn.id,
      });
      pendingServerRequest = {
        acceptedLifecycle: buildFileChangeApprovalLifecycle("accept"),
        cwd: turnCwd,
        id: approvalRequest.id,
        method: approvalRequest.method,
        rejectedLifecycle: buildFileChangeApprovalLifecycle("decline"),
        threadId: targetThreadId,
        turnId: turn.id,
      };
      queueServerRequest(approvalRequest);
      return;
    }

    if (
      mode === "command-approval" &&
      allowsInteractiveApproval({
        approvalPolicy: turnApprovalPolicy,
        sandboxPolicy: turnSandboxPolicy,
      })
    ) {
      const approvalRequest = buildCommandApprovalRequest({
        cwd: turnCwd,
        threadId: targetThreadId,
        turnId: turn.id,
      });
      pendingServerRequest = {
        acceptedLifecycle: buildCommandApprovalLifecycle("accept"),
        cwd: turnCwd,
        id: approvalRequest.id,
        method: approvalRequest.method,
        rejectedLifecycle: buildCommandApprovalLifecycle("decline"),
        threadId: targetThreadId,
        turnId: turn.id,
      };
      queueServerRequest(approvalRequest);
      return;
    }

    if (mode === "interruptible-turn") {
      queueNotification({
        method: "item/started",
        params: {
            item: {
              type: "commandExecution",
              id: "item_command_1",
              command: "pnpm test",
              cwd: turnCwd,
              processId: "pty_1",
              status: "inProgress",
              commandActions: [],
          },
          threadId: targetThreadId,
          turnId: turn.id,
        },
      });
      return;
    }

    for (const item of lifecycle.items) {
      queueNotification({
        method: "item/started",
        params: {
          item,
          threadId: targetThreadId,
          turnId: turn.id,
        },
      });
      queueNotification({
        method: "item/completed",
        params: {
          item,
          threadId: targetThreadId,
          turnId: turn.id,
        },
      });
    }

    if (lifecycle.terminalInteraction) {
      queueNotification({
        method: "item/commandExecution/terminalInteraction",
        params: {
          threadId: targetThreadId,
          turnId: turn.id,
          itemId: lifecycle.terminalInteraction.itemId,
          processId: lifecycle.terminalInteraction.processId,
          stdin: lifecycle.terminalInteraction.stdin,
        },
      });
    }

    queueNotification({
      method: "turn/completed",
      params: {
        threadId: targetThreadId,
        turn: buildTurn(
          turn.id,
          lifecycle.status,
          lifecycle.status === "failed"
            ? {
                message: "simulated turn failure",
                codexErrorInfo: null,
                additionalDetails: "fake app server failure mode",
              }
            : null,
        ),
      },
    });
    return;
  }

  if (message.method === "turn/interrupt") {
    write({
      id: message.id,
      result: {},
    });

    if (
      activeTurn &&
      message.params?.threadId === activeTurn.threadId &&
      message.params?.turnId === activeTurn.turnId
    ) {
      queueNotification({
        method: "turn/completed",
        params: {
          threadId: activeTurn.threadId,
          turn: buildTurn(activeTurn.turnId, "interrupted", null),
        },
      });
      activeTurn = null;
      pendingServerRequest = null;
    }

    return;
  }

  writeError(message.id ?? null, -32601, `Method not found: ${message.method}`);
});

function write(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function queueNotification(payload) {
  globalThis.setTimeout(() => write(payload), 5);
}

function queueServerRequest(payload) {
  globalThis.setTimeout(() => write(payload), 5);
}

function writeError(id, code, message) {
  write({
    id,
    error: {
      code,
      message,
    },
  });
}

function buildThread(id, cwd) {
  const timestamp = Math.floor(Date.now() / 1_000);

  return {
    id,
    preview: "Pocket CTO bootstrap thread",
    ephemeral: false,
    modelProvider: "openai",
    createdAt: timestamp,
    updatedAt: timestamp,
    status: {
      type: "idle",
    },
    path: `${cwd}/.codex/threads/${id}.json`,
    cwd,
    cliVersion: "0.0.0-fake",
    source: "appServer",
    agentNickname: null,
    agentRole: null,
    gitInfo: {
      sha: null,
      branch: null,
      originUrl: null,
    },
    name: "Pocket CTO bootstrap",
    turns: [],
  };
}

function buildSandboxPolicy(sandboxMode, cwd) {
  if (sandboxMode === "danger-full-access") {
    return {
      type: "dangerFullAccess",
    };
  }

  if (sandboxMode === "read-only") {
    return {
      type: "readOnly",
      access: {
        type: "fullAccess",
      },
      networkAccess: false,
    };
  }

  return {
    type: "workspaceWrite",
    writableRoots: [cwd],
    readOnlyAccess: {
      type: "fullAccess",
    },
    networkAccess: false,
    excludeTmpdirEnvVar: false,
    excludeSlashTmp: false,
  };
}

function buildTurn(id, status, error) {
  return {
    id,
    items: [],
    status,
    error,
  };
}

function buildLifecycle(currentMode) {
  if (currentMode === "turn-completed-failed") {
    return {
      status: "failed",
      items: [
        {
          type: "commandExecution",
          id: "item_command_1",
          command: "git status --short",
          cwd: process.cwd(),
          processId: "pty_1",
          status: "completed",
          commandActions: [],
          aggregatedOutput: "M README.md",
          exitCode: 0,
          durationMs: 3,
        },
      ],
      terminalInteraction: {
        itemId: "item_command_1",
        processId: "pty_1",
        stdin: "q",
      },
    };
  }

  if (currentMode === "plan-only") {
    return {
      status: "completed",
      items: [
        {
          type: "plan",
          id: "item_plan_1",
          text: buildPlanOnlyText(),
        },
      ],
      terminalInteraction: null,
    };
  }

  if (currentMode === "multi-text") {
    return {
      status: "completed",
      items: [
        {
          type: "plan",
          id: "item_plan_1",
          text: buildMultiTextPlanBlock(),
        },
        {
          type: "plan",
          id: "item_plan_2",
          text: buildMultiTextPlanBlock(),
        },
        {
          type: "agentMessage",
          id: "item_agent_1",
          text: buildPlannerAgentMessageText(),
          phase: null,
        },
        {
          type: "agentMessage",
          id: "item_agent_2",
          text: buildPlannerAgentMessageText(),
          phase: null,
        },
      ],
      terminalInteraction: null,
    };
  }

  return {
    status: "completed",
    items: [
      {
        type: "plan",
        id: "item_plan_1",
        text: "Inspect repository state and propose next steps without changing files.",
      },
      {
        type: "agentMessage",
        id: "item_agent_1",
        text: buildPlannerAgentMessageText(),
        phase: null,
      },
    ],
    terminalInteraction: null,
  };
}

function buildFileChangeApprovalRequest(input) {
  return {
    method: "item/fileChange/requestApproval",
    id: "approval_file_change_1",
    params: {
      threadId: input.threadId,
      turnId: input.turnId,
      itemId: "item_file_change_1",
      reason: "Requesting extra write access for the planned file edits.",
      grantRoot: `${input.cwd}/src`,
    },
  };
}

function buildCommandApprovalRequest(input) {
  return {
    method: "item/commandExecution/requestApproval",
    id: "approval_command_1",
    params: {
      threadId: input.threadId,
      turnId: input.turnId,
      itemId: "item_command_approval_1",
      approvalId: "approval_subcommand_1",
      reason: "Network access is required to fetch dependency metadata.",
      command: "pnpm view pocket-cto version",
      cwd: input.cwd,
      commandActions: [],
      networkApprovalContext: {
        host: "registry.npmjs.org",
      },
      availableDecisions: [
        "accept",
        "acceptForSession",
        "decline",
        "cancel",
      ],
    },
  };
}

function buildFileChangeApprovalLifecycle(decision) {
  if (decision === "accept") {
    return {
      status: "completed",
      items: [
        {
          type: "fileChange",
          id: "item_file_change_1",
          changes: [
            {
              type: "write",
              path: "README.md",
            },
          ],
          status: "completed",
        },
      ],
      terminalInteraction: null,
    };
  }

  return {
    status: "failed",
    items: [],
    terminalInteraction: null,
  };
}

function buildCommandApprovalLifecycle(decision) {
  if (decision === "accept") {
    return {
      status: "completed",
      items: [
        {
          type: "commandExecution",
          id: "item_command_approval_1",
          command: "pnpm view pocket-cto version",
          cwd: process.cwd(),
          processId: "pty_approval_1",
          status: "completed",
          commandActions: [],
          aggregatedOutput: "1.0.0",
          exitCode: 0,
          durationMs: 2,
        },
      ],
      terminalInteraction: null,
    };
  }

  return {
    status: "failed",
    items: [],
    terminalInteraction: null,
  };
}

function buildPlanOnlyText() {
  return [
    "## Objective understanding",
    "Plan the passkey rollout without changing files and preserve the existing email-login path.",
    "",
    "## Relevant context",
    "- The repo already separates planner and executor responsibilities.",
    "",
    "## Risks and unknowns",
    "- Auth storage, browser support, and recovery flows still need confirmation.",
    "",
    "## Proposed steps",
    "1. Inspect auth entrypoints and passkey-related domain models.",
    "2. Map UI and API touchpoints before any executor mutation.",
    "3. Define the smallest safe validation set for login continuity.",
    "",
    "## Validation plan",
    "- Keep later executor validation focused on auth and sign-in regression coverage.",
    "",
    "## Handoff notes",
    "- Leave implementation changes to the later executor turn.",
  ].join("\n");
}

function buildMultiTextPlanBlock() {
  return [
    "Repository scan complete.",
    "- auth and web sign-in paths look like the likely passkey touchpoints.",
    "- executor work should stay bounded to authentication flows.",
  ].join("\n");
}

function buildPlannerAgentMessageText() {
  return [
    "## Objective understanding",
    "Plan the passkey work without changing files and preserve the existing email-login path.",
    "",
    "## Relevant context",
    "- The repo already has planner and executor tasks.",
    "- WORKFLOW.md requires explicit validation before completion.",
    "",
    "## Risks and unknowns",
    "- Auth touchpoints and test ownership still need confirmation.",
    "",
    "## Proposed steps",
    "1. Inspect the auth entrypoints and existing sign-in flows.",
    "2. Map passkey data and UI changes before any executor mutation.",
    "3. Identify the minimum regression tests needed for email-login continuity.",
    "",
    "## Validation plan",
    "- Run targeted auth and web tests after the later executor turn.",
    "",
    "## Handoff notes",
    "- Keep the later executor constrained to auth and web paths only.",
  ].join("\n");
}

function buildStartedThreadId(input) {
  if (input.count === 1 && !input.replacement) {
    return input.seed;
  }

  if (input.replacement) {
    return `${input.seed}_replacement_${input.count}`;
  }

  if (input.count === 1) {
    return input.seed;
  }

  return `${input.seed}_replacement_${input.count - 1}`;
}

function isResumeGapMode(currentMode) {
  return [
    "resume-gap-direct-turn-success",
    "resume-gap-direct-turn-failed",
  ].includes(currentMode);
}

function allowsInteractiveApproval(input) {
  if (input.approvalPolicy === "never") {
    return false;
  }

  return (
    input.sandboxPolicy?.type === "workspaceWrite" ||
    input.sandboxPolicy?.type === "dangerFullAccess"
  );
}

async function handleServerRequestResponse(message) {
  if (!pendingServerRequest || message.id !== pendingServerRequest.id) {
    return;
  }

  const decision = message.result?.decision;
  const accepted =
    decision === "accept" || decision === "acceptForSession";
  const lifecycle = accepted
    ? pendingServerRequest.acceptedLifecycle
    : pendingServerRequest.rejectedLifecycle;

  if (accepted && pendingServerRequest.method === "item/fileChange/requestApproval") {
    await appendFile(
      join(pendingServerRequest.cwd, "README.md"),
      "\nexecutor change via approval fixture\n",
    );
  }

  queueNotification({
    method: "serverRequest/resolved",
    params: {
      threadId: pendingServerRequest.threadId,
      requestId: pendingServerRequest.id,
    },
  });

  for (const item of lifecycle.items) {
    queueNotification({
      method: "item/started",
      params: {
        item,
        threadId: pendingServerRequest.threadId,
        turnId: pendingServerRequest.turnId,
      },
    });
    queueNotification({
      method: "item/completed",
      params: {
        item,
        threadId: pendingServerRequest.threadId,
        turnId: pendingServerRequest.turnId,
      },
    });
  }

  queueNotification({
    method: "turn/completed",
    params: {
      threadId: pendingServerRequest.threadId,
      turn: buildTurn(
        pendingServerRequest.turnId,
        lifecycle.status,
        lifecycle.status === "failed"
          ? {
              message: "simulated approval rejection",
              codexErrorInfo: null,
              additionalDetails: "fake approval rejection path",
            }
          : null,
      ),
    },
  });

  activeTurn = null;
  pendingServerRequest = null;
}

function readFlags(argv) {
  let mode = process.env.FAKE_CODEX_APP_SERVER_MODE ?? "success";
  let threadId =
    process.env.FAKE_CODEX_APP_SERVER_THREAD_ID ?? "thread_fake_123";

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextValue = argv[index + 1];

    if (token === "--mode" && nextValue) {
      mode = nextValue;
      index += 1;
      continue;
    }

    if (token === "--thread-id" && nextValue) {
      threadId = nextValue;
      index += 1;
    }
  }

  return { mode, threadId };
}
