"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchSite } from "@/lib/search";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Compute search results instantly in-memory
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return searchSite(trimmed, 12);
  }, [query]);

  // Global keyboard shortcut to open search (Cmd+K, Ctrl+K, or /)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            setQuery("");
            setSelectedIndex(0);
            return false;
          }
          return true;
        });
      } else if (
        event.key === "/" &&
        !isOpen &&
        !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }

  function selectResult(url: string) {
    closeSearch();
    router.push(url);
  }

  // Keyboard navigation within the dialog
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const currentItem = results[selectedIndex] ?? results[0];
      if (currentItem) {
        selectResult(currentItem.url);
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, results.length]);

  return (
    <>
      {/* Search trigger button in header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search site (Press ⌘K or /)"
        className="flex items-center gap-2 rounded-sm border border-line bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:border-ink hover:text-ink focus:border-accent focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Search site…</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden font-mono text-[10px] text-muted sm:inline-block">⌘K</kbd>
      </button>

      {/* Modal dialog */}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search ClearedStack"
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={closeSearch}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-sm border border-line bg-paper shadow-2xl">
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-line px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 text-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search tools, apps, guides, regulations, CLINs…"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-ink hover:text-ink"
              >
                ESC
              </button>
            </div>

            {/* Results or Empty State */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() === "" ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  <p className="font-medium text-ink">Instant, client-side site search</p>
                  <p className="mt-1 text-xs">
                    Type a keyword, CLIN number (e.g. <span className="font-mono text-accent">0001</span>), regulation (e.g. <span className="font-mono text-accent">FAR 15</span>, <span className="font-mono text-accent">DFARS 7012</span>), or topic (<span className="font-mono text-accent">wrap rate</span>, <span className="font-mono text-accent">CMMC</span>, <span className="font-mono text-accent">Shipkeeper</span>, <span className="font-mono text-accent">k3s</span>).
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No matching tools, apps, guides, or sections for &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <ul ref={listRef} role="listbox" className="flex flex-col gap-1">
                  {results.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <li
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => selectResult(item.url)}
                        className={`group flex cursor-pointer flex-col rounded-sm px-3.5 py-2.5 text-sm transition-colors ${
                          isSelected ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-medium text-ink">
                            <span
                              className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                                item.type === "tool" || item.type === "app"
                                  ? "bg-accent text-accent-ink"
                                  : item.type === "guide"
                                  ? "border border-accent text-accent"
                                  : item.type === "page"
                                  ? "bg-ink text-paper"
                                  : "border border-line text-muted"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="group-hover:text-accent">{item.title}</span>
                          </span>
                          <span className="font-mono text-[11px] text-muted">{item.badge}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2">
                          {item.summary}
                        </p>
                        <span className="mt-1 font-mono text-[10px] text-muted/70">
                          {item.subtitle}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer with keyboard hints */}
            <div className="flex items-center justify-between border-t border-line bg-surface/50 px-4 py-2 text-[11px] text-muted">
              <span>
                {results.length > 0 ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Search ClearedStack"}
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>esc Close</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
