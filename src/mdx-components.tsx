import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// How markdown elements in the guides are rendered. Links to pages on this
// site use the router; links elsewhere are plain anchors.
const components: MDXComponents = {
  a: ({ href = "", children, ...rest }) =>
    href.startsWith("/") ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} rel="noopener" {...rest}>
        {children}
      </a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
