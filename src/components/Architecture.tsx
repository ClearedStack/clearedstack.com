import Link from "next/link";
import lifecycle from "@/data/lifecycle.json";
import openQuestions from "@/data/open-questions.json";
import walkthrough from "@/data/walkthrough.json";
import { components, externals, nameOf, stageLabel, type Edge, type PlatformComponent } from "@/data/platform";
import { States } from "@/components/Diagram";

/**
 * Diagrams drawn from the platform's data, not typed into pages:
 * the repo map and the walk-through from src/data/registry.json, the item
 * states from src/data/lifecycle.json. Like Diagram.tsx they are plain HTML
 * rendered at build time, with no client-side JavaScript. Anything listed in
 * src/data/open-questions.json is flagged where it applies.
 */

const questions = new Map(openQuestions.questions.map((q) => [q.key, q.question]));
const stateLabel = new Map(lifecycle.states.map((s) => [s.id, s.label]));
const move = new Map(lifecycle.transitions.map((t) => [`${t.from}>${t.to}`, t]));

function edgeQuestion(from: string, edge: Edge): string | undefined {
  return questions.get(`reach:${from}>${edge.to}`) ?? questions.get(`external:${edge.to}:${edge.kind}`);
}

function Figure({ caption, kind, children }: { caption: string; kind: string; children: React.ReactNode }) {
  return (
    <figure className={`diagram diagram-${kind}`}>
      {children}
      <figcaption className="diagram-caption">
        <span className="diagram-caption-label">Figure</span> {caption}
      </figcaption>
    </figure>
  );
}

function Edges({ from, edges }: { from: PlatformComponent; edges: Edge[]; }) {
  if (edges.length === 0) return null;
  return (
    <ul className="dg-edges">
      {edges.map((edge, i) => {
        const question = edgeQuestion(from.slug, edge);
        return (
          <li key={i} className={question ? "dg-flag" : undefined}>
            <span className="dg-edge-kind">{edge.kind}</span> {nameOf(edge.to)}
            {question ? <span className="dg-flag-note">Open question: {question}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

const layers: [PlatformComponent["layer"], string][] = [
  ["public", "Public site"],
  ["record", "The record"],
  ["code", "Code path"],
  ["worker", "Pipeline workers"],
];

/** Every component, grouped, with each connection it makes. */
export function RepoMap({ caption = "The platform’s components and every connection each one makes" }: { caption?: string }) {
  return (
    <Figure caption={caption} kind="map">
      <div className="dg-map">
        {layers.map(([layer, title]) => (
          <section key={layer} className="dg-map-group" aria-label={title}>
            <p className="dg-map-head">{title}</p>
            <ol className="dg-map-boxes">
              {components
                .filter((c) => c.layer === layer)
                .map((c) => (
                  <li key={c.slug}>
                    <div className="dg-box">
                      <span className="dg-tag">{stageLabel(c) ?? `Repository ${c.repository}`}</span>
                      <Link href={`/platform/${c.slug}/`} className="dg-label">
                        {c.name}
                      </Link>
                      <span className="dg-detail">{c.responsibility}</span>
                      {c.leases ? (
                        <p className="dg-leases">
                          Takes items in:{" "}
                          {c.leases.map((state, i) => {
                            const question = questions.get(`state:${c.slug}:${state}`);
                            return (
                              <span key={state} className={question ? "dg-flag" : undefined}>
                                {i > 0 ? ", " : ""}
                                {stateLabel.get(state) ?? state}
                                {question ? <span className="dg-flag-note">Open question: {question}</span> : null}
                              </span>
                            );
                          })}
                        </p>
                      ) : null}
                      <Edges from={c} edges={c.edges} />
                    </div>
                  </li>
                ))}
            </ol>
          </section>
        ))}
        <section className="dg-map-group" aria-label="Outside the platform">
          <p className="dg-map-head">Outside the platform</p>
          <ol className="dg-map-boxes">
            {Object.entries(externals).map(([id, ext]) => (
              <li key={id}>
                <div className="dg-box dg-box-outside">
                  <span className="dg-label">{ext.name}</span>
                  <span className="dg-detail">{ext.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Figure>
  );
}

const everyone = [...components.map((c) => c.slug), ...Object.keys(externals)];

function involved(actors: string[]): Set<string> {
  const ids = new Set(actors);
  for (const actor of actors) {
    for (const edge of components.find((c) => c.slug === actor)?.edges ?? []) ids.add(edge.to);
  }
  return ids;
}

function Move({ id }: { id: string }) {
  const t = move.get(id)!;
  return (
    <>
      {stateLabel.get(t.from)} <span className="dg-arrow">→</span> <strong>{stateLabel.get(t.to)}</strong>
      <span className="dg-when-inline"> when {t.when}</span>
    </>
  );
}

/** One idea followed through the platform, step by step, then the loops that keep it current. */
export function Walkthrough({ caption = "One idea followed through the platform, then the three loops" }: { caption?: string }) {
  let step = 0;
  return (
    <Figure caption={caption} kind="walk">
      <ol className="dg-walk">
        {walkthrough.steps.map((s) => {
          const ids = involved(s.actors);
          const actorComponents = components.filter((c) => s.actors.includes(c.slug));
          return (
            <li key={s.id} id={`step-${s.id}`} className="dg-walk-step">
              <div className={s.loop ? "dg-box dg-box-loop" : "dg-box"}>
                <span className="dg-tag">{s.loop ? "↺ Loop" : `Step ${++step}`}</span>
                <span className="dg-label">{s.title}</span>
                <p className="sr-only">Involved: {everyone.filter((id) => ids.has(id)).map(nameOf).join(", ")}.</p>
                <ul className="dg-chips" aria-hidden="true">
                  {everyone.map((id) => (
                    <li key={id} className={ids.has(id) ? "dg-chip dg-chip-on" : "dg-chip"}>
                      {nameOf(id)}
                    </li>
                  ))}
                </ul>
                {s.transitions.length > 0 ? (
                  <ul className="dg-transitions">
                    {s.transitions.map((id) => (
                      <li key={id}>
                        <Move id={id} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="dg-detail">{s.text}</p>
                {actorComponents.map((c) => (
                  <div key={c.slug} className="dg-walk-edges">
                    <p className="dg-map-head">{c.name} connects to</p>
                    <ul className="dg-edges">
                      {c.edges.map((edge, i) => {
                        const question = edgeQuestion(c.slug, edge);
                        return (
                          <li key={i} className={question ? "dg-flag" : undefined}>
                            <span className="dg-edge-kind">{edge.kind}</span> {nameOf(edge.to)}: {edge.note}
                            {question ? <span className="dg-flag-note">Open question: {question}</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {s.offRamps.length > 0 ? (
                  <div className="dg-walk-edges">
                    <p className="dg-map-head">Other ways out</p>
                    <ul className="dg-transitions">
                      {s.offRamps.map((id) => (
                        <li key={id}>
                          <Move id={id} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Figure>
  );
}

/** The item states and their moves, from src/data/lifecycle.json. */
export function ItemStates({ caption }: { caption: string }) {
  return (
    <States
      caption={caption}
      states={lifecycle.states.map((s) => {
        const to = lifecycle.transitions.filter((t) => t.from === s.id).map((t) => ({ id: t.to, when: t.when }));
        return { ...s, to: to.length > 0 ? to : undefined };
      })}
    />
  );
}
