import process from "node:process";
import readline from "node:readline";

const { mode, threadId } = readFlags(process.argv.slice(2));

let sawInitialize = false;
let sawInitialized = false;

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

    const cwd = message.params?.cwd ?? process.cwd();
    const approvalPolicy = message.params?.approvalPolicy ?? "untrusted";
    const sandboxMode = message.params?.sandbox ?? "workspace-write";
    const thread = buildThread(threadId, cwd);

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

  writeError(message.id ?? null, -32601, `Method not found: ${message.method}`);
});

function write(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
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
