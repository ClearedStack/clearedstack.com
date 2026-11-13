import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Children, isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/slug";
import { Branch, Flow, Lanes, Layers, States } from "@/components/Diagram";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return Children.toArray(node).map(textOf).join("");
}

const calloutLabel = {
  note: "Note",
  check: "Check this",
  warning: "Careful",
} as const;

/**
 * A boxed aside in a guide:
 *
 *   <Callout kind="warning" title="Optional heading">
 *     Text, written as markdown.
 *   </Callout>
 */
function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: keyof typeof calloutLabel;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`callout callout-${kind}`}>
      <p className="callout-label">
        {calloutLabel[kind]}
        {title ? <span className="callout-title"> · {title}</span> : null}
      </p>
      {children}
    </aside>
  );
}

// How markdown elements in the guides are rendered. Links to pages on this
// site use the router; links elsewhere are plain anchors. Second-level
// headings get an id so the table of contents can link to them.
const components: MDXComponents = {
  a: ({ href = "", children, ...rest }) =>
    href.startsWith("/") ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} rel="noopener" {...rest}>
        {children}
      </a>
    ),
  h2: ({ children }) => {
    const id = slugify(textOf(children));
    return (
      <h2 id={id}>
        {children}
        <a href={`#${id}`} className="heading-anchor" aria-label={`Link to “${textOf(children)}”`}>
          #
        </a>
      </h2>
    );
  },
  // Wide tables scroll inside their own box instead of stretching the page.
  table: (props) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
  Callout,
  Flow,
  Branch,
  Layers,
  Lanes,
  States,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
