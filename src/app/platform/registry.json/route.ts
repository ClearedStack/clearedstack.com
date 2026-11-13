import registry from "@/data/registry.json";

// The naming registry as a plain file, for manifests, pipelines and other
// repositories to read. Written once at build time.
export const dynamic = "force-static";

export function GET() {
  return Response.json(registry);
}
