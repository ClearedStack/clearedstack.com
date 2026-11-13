import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Logo } from "@/components/Logo";
import { site } from "@/data/site";

const navLink = "rounded-sm px-2 py-1.5 text-muted transition-colors hover:text-ink whitespace-nowrap";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:gap-4">
        <Link href="/" aria-label="ClearedStack Command Portal" className="shrink-0 rounded-sm">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalSearch />
          <nav aria-label="Main" className="flex items-center gap-0.5 overflow-x-auto text-sm sm:gap-1.5">
            <Link href="/" className={navLink}>
              Command
            </Link>
            <Link href="/apps/" className={navLink}>
              Apps
            </Link>
            <Link href="/pipeline/" className={navLink}>
              Pipeline
            </Link>
            <Link href="/decide/" className={navLink}>
              Decide
            </Link>
            <Link href="/tools/" className={navLink}>
              Tools
            </Link>
            <Link href="/guides/" className={navLink}>
              Guides
            </Link>
            <Link href="/about/" className={`${navLink} hidden sm:inline`}>
              About
            </Link>
            <a href={site.github} className={`${navLink} hidden lg:inline`} rel="noopener">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
