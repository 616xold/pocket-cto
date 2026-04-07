export class SourceNotFoundError extends Error {
  constructor(readonly sourceId: string) {
    super("Source not found");
    this.name = "SourceNotFoundError";
  }
}
