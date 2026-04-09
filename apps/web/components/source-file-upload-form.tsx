import React from "react";
import { submitSourceFileUpload } from "../app/sources/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

type SourceFileUploadFormProps = {
  sourceId: string;
};

export function SourceFileUploadForm({
  sourceId,
}: SourceFileUploadFormProps) {
  const operatorIdentity = getWebOperatorIdentity();

  return (
    <form action={submitSourceFileUpload} className="source-form">
      <label className="field-label" htmlFor="source-file">
        Upload raw file
      </label>
      <input
        className="field-control"
        id="source-file"
        name="file"
        required
        type="file"
      />

      <label className="field-label" htmlFor="upload-captured-at">
        Captured at (optional ISO timestamp)
      </label>
      <input
        className="field-control"
        id="upload-captured-at"
        name="capturedAt"
        placeholder="2026-04-09T11:00:00.000Z"
      />

      <input type="hidden" name="createdBy" value={operatorIdentity} />
      <input type="hidden" name="sourceId" value={sourceId} />

      <p className="muted" style={{ marginBottom: 0 }}>
        Uploaded as <code>{operatorIdentity}</code>. This stores raw bytes
        immutably and creates the next snapshot version before any ingest run.
      </p>

      <div className="button-row" style={{ marginTop: 16 }}>
        <button className="button primary" type="submit">
          Upload file
        </button>
      </div>
    </form>
  );
}
