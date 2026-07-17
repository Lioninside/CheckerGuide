import { RotateCcw, X } from "lucide-react";
import { useId } from "react";

import { useProfile } from "../contexts/ProfileContext";

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
          <h2 id={titleId}>Profil zuruecksetzen</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Dialog schliessen"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <p>Gesehene Folgen, Merkliste und Kennzahlen werden aus diesem Browser entfernt.</p>
        <div className="actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Abbrechen
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
            Zuruecksetzen
          </button>
        </div>
      </section>
    </div>
  );
}
