import MiniSearch, { type SearchResult } from "minisearch";
import searchData from "@/data/search-data.json";

export type SearchItem = {
  id: string;
  type: "tool" | "app" | "guide" | "section" | "page";
  title: string;
  subtitle: string;
  summary: string;
  url: string;
  badge: string;
  status?: string;
};

let engine: MiniSearch<SearchItem & { content: string }> | null = null;

function getSearchEngine() {
  if (!engine) {
    engine = new MiniSearch({
      fields: ["title", "subtitle", "summary", "content"],
      storeFields: ["id", "type", "title", "subtitle", "summary", "url", "badge", "status"],
      searchOptions: {
        boost: { title: 4, subtitle: 2, summary: 2, content: 1 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
    engine.addAll(searchData as (SearchItem & { content: string })[]);
  }
  return engine;
}

export function searchSite(query: string, limit = 12): (SearchItem & { score: number })[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const searcher = getSearchEngine();
  const results = searcher.search(trimmed);

  return results.slice(0, limit).map((r: SearchResult) => ({
    id: r.id as string,
    type: r.type as SearchItem["type"],
    title: r.title as string,
    subtitle: r.subtitle as string,
    summary: r.summary as string,
    url: r.url as string,
    badge: r.badge as string,
    status: r.status as string | undefined,
    score: r.score,
  }));
}
