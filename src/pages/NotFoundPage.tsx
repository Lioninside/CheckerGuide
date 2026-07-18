import { Link } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { de } from "../i18n/de";

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <EmptyState title={de.notFound.title} body={de.notFound.body} />
      <Link className="button primary" to="/">
        {de.actions.backHome}
      </Link>
    </div>
  );
}
