import type {
  RuntimeThreadReplacementReason,
  RuntimeTurnRecoveryStrategy,
  RuntimeTurnTerminalStatus,
} from "@pocket-cto/domain";
import type {
  AskForApproval,
  ClientInfo,
  CommandExecutionRequestApprovalParams,
  CommandExecutionRequestApprovalResponse,
  FileChangeRequestApprovalParams,
  FileChangeRequestApprovalResponse,
  JsonRpcId,
  PermissionsRequestApprovalParams,
  PermissionsRequestApprovalResponse,
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

export type RuntimeCodexCompletedTextOutput = {
  itemId: string;
  itemType: string;
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
  taskId: string;
  threadId?: string | null;
};

export type RuntimeCodexThreadStartedEvent = RuntimeCodexBootstrapResult;

export type RuntimeCodexThreadReplacedEvent = {
  newThreadId: string;
  oldThreadId: string;
  reasonCode: RuntimeThreadReplacementReason;
};

export type RuntimeCodexServerRequestResolvedEvent = {
  requestId: JsonRpcId;
  threadId: string;
};

export type RuntimeCodexFileChangeApprovalRequestEvent =
  FileChangeRequestApprovalParams & {
    requestId: JsonRpcId;
  };

export type RuntimeCodexCommandExecutionApprovalRequestEvent =
  CommandExecutionRequestApprovalParams & {
    requestId: JsonRpcId;
  };

export type RuntimeCodexPermissionsApprovalRequestEvent =
  PermissionsRequestApprovalParams & {
    requestId: JsonRpcId;
  };

export type RuntimeCodexApprovalResponse =
  | {
      method: "item/fileChange/requestApproval";
      response: FileChangeRequestApprovalResponse;
    }
  | {
      method: "item/commandExecution/requestApproval";
      response: CommandExecutionRequestApprovalResponse;
    }
  | {
      method: "item/permissions/requestApproval";
      response: PermissionsRequestApprovalResponse;
    };

export type RuntimeCodexRunTurnObserver = {
  onCommandExecutionApprovalRequest?(
    event: RuntimeCodexCommandExecutionApprovalRequestEvent,
  ):
    | Promise<CommandExecutionRequestApprovalResponse>
    | CommandExecutionRequestApprovalResponse;
  onFileChangeApprovalRequest?(
    event: RuntimeCodexFileChangeApprovalRequestEvent,
  ):
    | Promise<FileChangeRequestApprovalResponse>
    | FileChangeRequestApprovalResponse;
  onThreadReplaced?(
    event: RuntimeCodexThreadReplacedEvent,
  ): Promise<void> | void;
  onThreadStarted?(
    event: RuntimeCodexThreadStartedEvent,
  ): Promise<void> | void;
  onItemCompleted?(event: RuntimeCodexItemLifecycleEvent): Promise<void> | void;
  onItemStarted?(event: RuntimeCodexItemLifecycleEvent): Promise<void> | void;
  onPermissionsApprovalRequest?(
    event: RuntimeCodexPermissionsApprovalRequestEvent,
  ):
    | Promise<PermissionsRequestApprovalResponse>
    | PermissionsRequestApprovalResponse;
  onServerRequestResolved?(
    event: RuntimeCodexServerRequestResolvedEvent,
  ): Promise<void> | void;
  onTurnStarted?(event: RuntimeCodexTurnStartedEvent): Promise<void> | void;
};

export type RuntimeCodexRunTurnResult = {
  completedAgentMessages: RuntimeCodexCompletedAgentMessage[];
  completedTextOutputs: RuntimeCodexCompletedTextOutput[];
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
