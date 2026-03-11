import type {
  RuntimeThreadReplacementReason,
  RuntimeTurnRecoveryStrategy,
  RuntimeTurnTerminalStatus,
} from "@pocket-cto/domain";
import type {
  AskForApproval,
  ClientInfo,
  SandboxMode,
  SandboxPolicy,
  Thread,
  UserInput,
} from "@pocket-cto/codex-runtime";

export type RuntimeCodexThreadDefaults = {
  approvalPolicy: AskForApproval;
  clientInfo: ClientInfo;
  cwd: string;
  model: string;
  sandbox: SandboxMode;
  serviceName: string | null;
};

export type RuntimeCodexBootstrapInput = {
  cwd?: string;
  model?: string;
  serviceName?: string | null;
};

export type RuntimeCodexBootstrapResult = {
  approvalPolicy: AskForApproval;
  cwd: string;
  model: string;
  modelProvider: string;
  sandbox: SandboxPolicy;
  serviceName: string | null;
  thread: Thread;
  threadId: string;
  userAgent: string;
};

export type RuntimeCodexTurnStartedEvent = {
  recoveryStrategy: RuntimeTurnRecoveryStrategy;
  threadId: string;
  turnId: string;
};

export type RuntimeCodexItemLifecycleEvent = {
  itemId: string;
  itemType: string;
  phase: "started" | "completed";
  threadId: string;
  turnId: string;
};

export type RuntimeCodexCompletedAgentMessage = {
  itemId: string;
  text: string;
  threadId: string;
  turnId: string;
};

export type RuntimeCodexRunTurnInput = {
  approvalPolicy?: AskForApproval;
  cwd?: string | null;
  hasPriorTurnStarted: boolean;
  input: UserInput[];
  model?: string | null;
  sandboxPolicy?: SandboxPolicy | null;
  threadId?: string | null;
};

export type RuntimeCodexThreadStartedEvent = RuntimeCodexBootstrapResult;

export type RuntimeCodexThreadReplacedEvent = {
  newThreadId: string;
  oldThreadId: string;
  reasonCode: RuntimeThreadReplacementReason;
};

export type RuntimeCodexRunTurnObserver = {
  onThreadReplaced?(
    event: RuntimeCodexThreadReplacedEvent,
  ): Promise<void> | void;
  onThreadStarted?(
    event: RuntimeCodexThreadStartedEvent,
  ): Promise<void> | void;
  onItemCompleted?(event: RuntimeCodexItemLifecycleEvent): Promise<void> | void;
  onItemStarted?(event: RuntimeCodexItemLifecycleEvent): Promise<void> | void;
  onTurnStarted?(event: RuntimeCodexTurnStartedEvent): Promise<void> | void;
};

export type RuntimeCodexRunTurnResult = {
  completedAgentMessages: RuntimeCodexCompletedAgentMessage[];
  finalAgentMessageText: string | null;
  firstItemType: string | null;
  items: RuntimeCodexItemLifecycleEvent[];
  lastItemType: string | null;
  recoveryStrategy: RuntimeTurnRecoveryStrategy;
  status: RuntimeTurnTerminalStatus;
  threadId: string;
  turnId: string;
};

export type {
  RuntimeThreadReplacementReason,
  RuntimeTurnRecoveryStrategy,
} from "@pocket-cto/domain";
