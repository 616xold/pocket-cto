import {
  CodexAppServerClient,
  type CodexRuntimeClientOptions,
} from "@pocket-cto/codex-runtime";

export type RuntimeCodexClientFactory = {
  createClient(): CodexAppServerClient;
};

export class RuntimeCodexAdapter implements RuntimeCodexClientFactory {
  constructor(private readonly clientOptions: CodexRuntimeClientOptions) {}

  createClient() {
    return new CodexAppServerClient(this.clientOptions);
  }
}
