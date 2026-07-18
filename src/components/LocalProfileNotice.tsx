import { ShieldCheck } from "lucide-react";

import { de } from "../i18n/de";
import { useProfile } from "../contexts/ProfileContext";

export function LocalProfileNotice() {
  const { acknowledgeNotice, profile } = useProfile();
  if (profile.localNoticeAcknowledged) {
    return null;
  }

  return (
    <aside className="local-notice">
      <ShieldCheck aria-hidden="true" size={22} />
      <p>{de.localNotice}</p>
      <button className="button secondary" type="button" onClick={acknowledgeNotice}>
        {de.actions.understand}
      </button>
    </aside>
  );
}
