import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function BackLink() {
  return (
    <Link className="back-link" to="/">
      <ArrowLeft size={16} aria-hidden="true" />
      Anaplian.io
    </Link>
  );
}
