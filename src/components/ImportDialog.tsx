import { useId, useState } from "react";
import { FileUp, Merge, Replace, X } from "lucide-react";

import { useCatalog } from "../contexts/CatalogContext";
import { useProfile } from "../contexts/ProfileContext";
import { de } from "../i18n/de";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const titleId = useId();
  const { availableEpisodes } = useCatalog();
  const { mergeImport, previewImport, replaceImport } = useProfile();
  const [rawValue, setRawValue] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const knownEpisodeIds = availableEpisodes.map((episode) => episode.id);
  const preview =
    rawValue === null
      ? null
      : (() => {
          try {
            return previewImport(rawValue, knownEpisodeIds);
          } catch (error) {
            return error instanceof Error ? error.message : de.profile.importInvalid;
          }
        })();

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dialog-heading">
          <h2 id={titleId}>{de.profile.importTitle}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label={de.actions.closeDialog}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <label className="file-picker">
          <FileUp aria-hidden="true" size={18} />
          {de.profile.uploadJson}
          <input
            accept="application/json,.json"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              file
                .text()
                .then((text) => {
                  setRawValue(JSON.parse(text) as unknown);
                  setMessage(null);
                })
                .catch(() => setMessage(de.profile.importInvalid));
            }}
          />
        </label>
        {typeof preview === "string" ? <p className="error-text">{preview}</p> : null}
        {preview && typeof preview !== "string" ? (
          <div className="import-preview">
            <p>{de.profile.importPreview(preview.seenCount, preview.bookmarkedCount)}</p>
            {preview.unknownEpisodeIds.length > 0 ? (
              <p>{de.profile.importUnknown(preview.unknownEpisodeIds.length)}</p>
            ) : null}
          </div>
        ) : null}
        {message ? <p className="error-text">{message}</p> : null}
        <div className="actions">
          <button
            className="button secondary"
            type="button"
            disabled={!rawValue || typeof preview === "string"}
            onClick={() => {
              if (rawValue) {
                mergeImport(rawValue);
                onClose();
              }
            }}
          >
            <Merge aria-hidden="true" size={18} />
            {de.actions.merge}
          </button>
          <button
            className="button danger"
            type="button"
            disabled={!rawValue || typeof preview === "string"}
            onClick={() => {
              if (rawValue) {
                replaceImport(rawValue);
                onClose();
              }
            }}
          >
            <Replace aria-hidden="true" size={18} />
            {de.actions.replace}
          </button>
        </div>
      </section>
    </div>
  );
}
