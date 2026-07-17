import { Link } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <EmptyState
        title="Seite nicht gefunden"
        body="Diese Ansicht gibt es im Checker Guide nicht."
      />
      <Link className="button primary" to="/">
        Zur Startseite
      </Link>
    </div>
  );
}
