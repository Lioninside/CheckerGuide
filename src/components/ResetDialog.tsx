import { RotateCcw, X } from "lucide-react";
import { useId } from "react";

import { useProfile } from "../contexts/ProfileContext";
import { de } from "../i18n/de";

interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ResetDialog({ open, onClose }: ResetDialogProps) {
  const titleId = useId();
  const { reset } = useProfile();

  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dialog-heading">
          <h2 id={titleId}>{de.profile.resetTitle}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label={de.actions.closeDialog}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <p>{de.profile.resetBody}</p>
        <div className="actions">
          <button className="button secondary" type="button" onClick={onClose}>
            {de.actions.cancel}
          </button>
          <button
            className="button danger"
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            <RotateCcw aria-hidden="true" size={18} />
            {de.actions.reset}
          </button>
        </div>
      </section>
    </div>
  );
}
