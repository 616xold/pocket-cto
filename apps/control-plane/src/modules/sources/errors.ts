export class SourceNotFoundError extends Error {
  constructor(readonly sourceId: string) {
    super("Source not found");
    this.name = "SourceNotFoundError";
  }
}

export class SourceFileNotFoundError extends Error {
  constructor(readonly sourceFileId: string) {
    super("Source file not found");
    this.name = "SourceFileNotFoundError";
  }
}

export class SourceFilePayloadParseError extends Error {
  constructor() {
    super("Source file upload body must be raw binary data");
    this.name = "SourceFilePayloadParseError";
  }
}
