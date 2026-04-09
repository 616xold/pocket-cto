import React from "react";
import { submitSourceRegistration } from "../app/sources/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

export function SourceRegistrationForm() {
  const operatorIdentity = getWebOperatorIdentity();

  return (
    <form action={submitSourceRegistration} className="source-form">
      <label className="field-label" htmlFor="source-name">
        Source name
      </label>
      <input
        className="field-control"
        id="source-name"
        name="name"
        placeholder="Board deck archive"
        required
      />

      <label className="field-label" htmlFor="source-kind">
        Source kind
      </label>
      <select className="field-control" id="source-kind" name="kind" defaultValue="document">
        <option value="document">document</option>
        <option value="spreadsheet">spreadsheet</option>
        <option value="dataset">dataset</option>
        <option value="image">image</option>
        <option value="archive">archive</option>
        <option value="other">other</option>
      </select>

      <label className="field-label" htmlFor="source-description">
        Operator note
      </label>
      <textarea
        className="text-area"
        id="source-description"
        name="description"
        placeholder="Monthly finance packet exported from the board portal."
        rows={4}
      />

      <label className="field-label" htmlFor="source-file-name">
        Initial snapshot file name
      </label>
      <input
        className="field-control"
        id="source-file-name"
        name="originalFileName"
        placeholder="board-deck-2026-04.pdf"
        required
      />

      <label className="field-label" htmlFor="source-media-type">
        Media type
      </label>
      <input
        className="field-control"
        id="source-media-type"
        name="mediaType"
        placeholder="application/pdf"
        required
      />

      <label className="field-label" htmlFor="source-size-bytes">
        Size in bytes
      </label>
      <input
        className="field-control"
        id="source-size-bytes"
        min={0}
        name="sizeBytes"
        placeholder="4096"
        required
        type="number"
      />

      <label className="field-label" htmlFor="source-checksum">
        SHA-256 checksum
      </label>
      <input
        className="field-control"
        id="source-checksum"
        name="checksumSha256"
        placeholder="64-character lowercase or uppercase hash"
        required
      />

      <label className="field-label" htmlFor="source-storage-kind">
        Snapshot storage kind
      </label>
      <select
        className="field-control"
        id="source-storage-kind"
        name="storageKind"
        defaultValue="external_url"
      >
        <option value="external_url">external_url</option>
        <option value="local_path">local_path</option>
        <option value="connector_ref">connector_ref</option>
      </select>

      <label className="field-label" htmlFor="source-storage-ref">
        Storage reference
      </label>
      <input
        className="field-control"
        id="source-storage-ref"
        name="storageRef"
        placeholder="https://drive.example.com/board-deck-2026-04.pdf"
        required
      />

      <label className="field-label" htmlFor="source-captured-at">
        Captured at (optional ISO timestamp)
      </label>
      <input
        className="field-control"
        id="source-captured-at"
        name="capturedAt"
        placeholder="2026-04-09T11:00:00.000Z"
      />

      <input type="hidden" name="createdBy" value={operatorIdentity} />

      <p className="muted" style={{ marginBottom: 0 }}>
        Created as <code>{operatorIdentity}</code>. This registers source truth
        metadata first; raw byte uploads happen on the source detail page.
      </p>

      <div className="button-row" style={{ marginTop: 16 }}>
        <button className="button primary" type="submit">
          Register source
        </button>
      </div>
    </form>
  );
}
