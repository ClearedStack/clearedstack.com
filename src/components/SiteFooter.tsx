import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { disclaimer, site } from "@/data/site";

const footLink = "underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-muted md:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <LogoMark size={24} />
          <p className="mt-4 leading-relaxed">{disclaimer}</p>
          <p className="mt-3">
            <Link href="/about/#disclaimer" className={footLink}>
              Read the full disclaimer
            </Link>
          </p>
          <p className="mt-4 leading-relaxed">
            Built with Claude Code and Antigravity, reviewed by a person. Read{" "}
            <Link href="/guides/built-with-ai/" className={footLink}>
              how AI is used to build this project
            </Link>
            .
          </p>
        </div>
        <ul className="flex flex-col gap-2.5 font-mono text-[13px] md:items-end">
          <li>
            <Link href="/tools/" className={footLink}>
              Tools
            </Link>
          </li>
          <li>
            <Link href="/how-we-decide/" className={footLink}>
              How we decide
            </Link>
          </li>
          <li>
            <Link href="/guides/" className={footLink}>
              Guides
            </Link>
          </li>
          <li>
            <Link href="/about/" className={footLink}>
              About
            </Link>
          </li>
          <li>
            <a href={site.repo} className={footLink} rel="noopener">
              Source code
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className={footLink}>
              {site.email}
            </a>
          </li>
          <li>Revised {site.revised}</li>
          <li>MIT License</li>
        </ul>
      </div>
    </footer>
  );
}
