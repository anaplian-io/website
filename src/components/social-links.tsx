import { SocialIcon } from "./social-icon.tsx";

const profiles = [
  { label: "GitHub", href: "https://github.com/efortner", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ethan-fortner-95566682",
    icon: "linkedin",
  },
] as const;

export function SocialLinks() {
  return (
    <nav className="social-links" aria-label="Social profiles">
      {profiles.map(({ label, href, icon }) => (
        <a key={label} href={href} aria-label={label} title={label}>
          <SocialIcon name={icon} />
        </a>
      ))}
    </nav>
  );
}
