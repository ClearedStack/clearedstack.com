import type { ReactNode } from "react";

/**
 * Diagrams for pages and guides.
 *
 * Every diagram is plain HTML and CSS, rendered when the site is built. There
 * is no diagram library, no client-side JavaScript and nothing loaded from
 * another server, so the content security policy is untouched. Because the
 * boxes are real text in ordered lists, a screen reader, a text browser and a
 * printout all get the same information as the picture. Arrows are drawn with
 * CSS and hidden from assistive technology.
 *
 * All of them are available in MDX without an import:
 *
 *   <Flow caption="How a tool gets listed" steps={[
 *     { label: "Suggest", detail: "Open an issue." },
 *     { label: "Review", detail: "Checked against the five conditions." },
 *   ]} />
 *
 *   <Branch caption="..." question="Is it free?" options={[
 *     { when: "Yes", then: "Keep going" },
 *     { when: "No", then: "Not listed" },
 *   ]} />
 *
 *   <Layers caption="..." layers={[{ label: "Fee" }, { label: "G&A" }]} />
 *
 *   <Lanes caption="..." lanes={["Owner", "AI agent"]} steps={[
 *     { lane: 1, label: "Drafts the change" },
 *     { lane: 0, label: "Reviews and merges" },
 *   ]} />
 *
 *   <States caption="..." states={[
 *     { id: "new", label: "New", to: [{ id: "observed", when: "Public pages read" }] },
 *     { id: "observed", label: "Observed" },
 *   ]} />
 */

export type Step = {
  /** Short name of the step, two to four words. */
  label: string;
  /** One sentence describing it. */
  detail?: string;
  /** A small mono tag above the label, such as a stage number or an owner. */
  tag?: string;
};

function Figure({
  caption,
  kind,
  children,
}: {
  caption: string;
  kind: string;
  children: ReactNode;
}) {
  return (
    <figure className={`diagram diagram-${kind}`}>
      {children}
      <figcaption className="diagram-caption">
        <span className="diagram-caption-label">Figure</span> {caption}
      </figcaption>
    </figure>
  );
}

function Box({ step, accent }: { step: Step; accent?: boolean }) {
  return (
    <div className={accent ? "dg-box dg-box-accent" : "dg-box"}>
      {step.tag ? <span className="dg-tag">{step.tag}</span> : null}
      <span className="dg-label">{step.label}</span>
      {step.detail ? <span className="dg-detail">{step.detail}</span> : null}
    </div>
  );
}

/**
 * A sequence of steps joined by arrows. `direction="across"` lays the steps
 * out in a row on wide screens; on narrow screens every flow runs down.
 * `loop` adds a note that the last step leads back to the first.
 */
export function Flow({
  caption,
  steps,
  direction = "down",
  loop,
  highlight,
}: {
  caption: string;
  steps: Step[];
  direction?: "down" | "across";
  /** Label for the return path from the last step to the first. */
  loop?: string;
  /** Zero-based index of a step to draw in the accent colour. */
  highlight?: number;
}) {
  return (
    <Figure caption={caption} kind="flow">
      <ol className={`dg-flow dg-flow-${direction}`}>
        {steps.map((step, i) => (
          <li key={i} className="dg-flow-item">
            <Box step={step} accent={i === highlight} />
          </li>
        ))}
      </ol>
      {loop ? (
        <p className="dg-loop">
          <span aria-hidden="true">↺ </span>
          {loop}
        </p>
      ) : null}
    </Figure>
  );
}

/** A decision: one question and the outcome of each answer. */
export function Branch({
  caption,
  question,
  options,
}: {
  caption: string;
  question: string;
  options: { when: string; then: string; detail?: string }[];
}) {
  return (
    <Figure caption={caption} kind="branch">
      <div className="dg-question">
        <span className="dg-tag">Decision</span>
        <span className="dg-label">{question}</span>
      </div>
      <ul className="dg-options">
        {options.map((option, i) => (
          <li key={i} className="dg-option">
            <span className="dg-when">{option.when}</span>
            <Box step={{ label: option.then, detail: option.detail }} />
          </li>
        ))}
      </ul>
    </Figure>
  );
}

/**
 * A stack, drawn top to bottom: each layer sits on the one below it. Use it
 * for build-ups (a rate built from its parts) and for boundaries (what runs
 * where).
 */
export function Layers({
  caption,
  layers,
  highlight,
}: {
  caption: string;
  layers: Step[];
  highlight?: number;
}) {
  return (
    <Figure caption={caption} kind="layers">
      <ol className="dg-layers">
        {layers.map((layer, i) => (
          <li key={i}>
            <Box step={layer} accent={i === highlight} />
          </li>
        ))}
      </ol>
    </Figure>
  );
}

/**
 * Swimlanes: who does each step, in order. Each step names its lane by index
 * into `lanes`. On narrow screens the lane name is shown on the step instead.
 */
export function Lanes({
  caption,
  lanes,
  steps,
}: {
  caption: string;
  lanes: string[];
  steps: (Step & { lane: number })[];
}) {
  const columns = { gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` };
  return (
    <Figure caption={caption} kind="lanes">
      <div className="dg-lane-heads" style={columns} aria-hidden="true">
        {lanes.map((lane) => (
          <span key={lane} className="dg-lane-head">
            {lane}
          </span>
        ))}
      </div>
      <ol className="dg-lane-steps">
        {steps.map((step, i) => (
          <li key={i} className="dg-lane-row" style={columns}>
            <div style={{ gridColumn: step.lane + 1 }}>
              <Box step={{ ...step, tag: `${i + 1} · ${lanes[step.lane]}` }} />
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

/**
 * A state machine drawn as cards. Each state lists the states it can move to
 * and what makes it move. Terminal states have no `to`.
 */
export function States({
  caption,
  states,
}: {
  caption: string;
  states: (Step & { id: string; to?: { id: string; when: string }[] })[];
}) {
  const name = (id: string) => states.find((s) => s.id === id)?.label ?? id;
  return (
    <Figure caption={caption} kind="states">
      <ol className="dg-states">
        {states.map((state) => (
          <li key={state.id} id={`state-${state.id}`} className="dg-state">
            <Box step={state} accent={!state.to || state.to.length === 0} />
            {state.to && state.to.length > 0 ? (
              <ul className="dg-transitions">
                {state.to.map((t, i) => (
                  <li key={i}>
                    <span className="dg-arrow" aria-hidden="true">
                      →{" "}
                    </span>
                    <span className="sr-only">Moves to </span>
                    <strong>{name(t.id)}</strong>
                    <span className="dg-when-inline"> when {t.when}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dg-terminal">End state</p>
            )}
          </li>
        ))}
      </ol>
    </Figure>
  );
}
