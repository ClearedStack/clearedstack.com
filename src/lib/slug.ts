/**
 * Turns heading text into the id used for its anchor. The guide page builds
 * its table of contents from the .mdx source and the heading component builds
 * the id from what it renders, so both go through this one function.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’'“”"`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
