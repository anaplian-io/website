import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

interface AppCardProps {
  title: string;
  description: string;
  href: string;
  status?: string;
}

export function AppCard({ title, description, href, status }: AppCardProps) {
  return (
    <Link className="app-card" to={href}>
      <div className="app-card-heading">
        <h3>{title}</h3>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>
      <p>{description}</p>
      {status && <span className="status">{status}</span>}
    </Link>
  );
}
