import React from 'react';
// Runs one branching case. All content arrives pre-rendered (HTML) from the
// build step; this component only handles the decision flow and scoring.
// Nothing is stored or sent anywhere.
import { useMemo, useState, useRef, useEffect } from 'react';
import GuideLink from './GuideLink.jsx';

const RATING = {
  best: { label: 'Best answer', points: 2, cls: 'r-best' },
  acceptable: { label: 'Acceptable', points: 1, cls: 'r-ok' },
  poor: { label: 'Not the best choice', points: 0, cls: 'r-poor' },
  unsafe: { label: 'Unsafe', points: 0, cls: 'r-unsafe' },
};

const Html = ({ html, as: Tag = 'div', ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;

export default function CaseRunner({ caseData }) {
  const { stages, teachingPointsHtml, references } = caseData;
  const byId = useMemo(() => Object.fromEntries(stages.map((s, i) => [s.id, i])), [stages]);
  const [path, setPath] = useState([0]); // indices of stages visited
  const [answers, setAnswers] = useState({}); // stageId -> option index
  const [showAll, setShowAll] = useState({});
  const [done, setDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [path.length, done]);

  const current = stages[path[path.length - 1]];
  const maxPoints = path.reduce((n, i) => n + (stages[i].options.length ? 2 : 0), 0);
  const points = path.reduce((n, i) => {
    const s = stages[i];
    const a = answers[s.id];
    return n + (a === undefined ? 0 : RATING[s.options[a].rating]?.points ?? 0);
  }, 0);

  function choose(stage, idx) {
    if (answers[stage.id] !== undefined) return;
    setAnswers({ ...answers, [stage.id]: idx });
  }

  function advance(stage) {
    const a = answers[stage.id];
    const nextId = (a !== undefined && stage.options[a].next) || stage.next;
    const nextIdx = nextId ? byId[nextId] : path[path.length - 1] + 1;
    if (nextIdx === undefined || nextIdx >= stages.length || stage.end) setDone(true);
    else setPath([...path, nextIdx]);
  }

  function restart() {
    setPath([0]);
    setAnswers({});
    setShowAll({});
    setDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="case-runner">
      {path.map((stageIdx, i) => {
        const s = stages[stageIdx];
        const a = answers[s.id];
        const answered = a !== undefined || !s.options.length;
        const isLast = i === path.length - 1;
        return (
          <section key={s.id} className="stage" ref={isLast ? endRef : null}>
            <header className="stage-head">
              <span className="stage-num">Step {i + 1}</span>
              <h3>{s.title}</h3>
            </header>
            <Html html={s.bodyHtml} className="prose" />

            {s.options.length > 0 && (
              <fieldset className="mcq">
                <legend>
                  <Html as="span" html={s.questionHtml} />
                </legend>
                {s.options.map((o, oi) => {
                  const chosen = a === oi;
                  const reveal = answered && (chosen || showAll[s.id]);
                  const r = RATING[o.rating] || RATING.poor;
                  return (
                    <div key={oi} className={`option ${reveal ? r.cls : ''} ${chosen ? 'chosen' : ''}`}>
                      <button type="button" disabled={answered} onClick={() => choose(s, oi)} aria-pressed={chosen}>
                        <span className="opt-letter">{String.fromCharCode(65 + oi)}</span>
                        <Html as="span" html={o.textHtml} />
                      </button>
                      {reveal && (
                        <div className="feedback">
                          <strong className="rating">{r.label}</strong>
                          <Html html={o.feedbackHtml} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {answered && !showAll[s.id] && (
                  <button type="button" className="link-btn" onClick={() => setShowAll({ ...showAll, [s.id]: true })}>
                    Show feedback for all options
                  </button>
                )}
              </fieldset>
            )}

            {answered && s.pearlHtml && (
              <aside className="pearl">
                <span className="pearl-label">Clinical pearl</span>
                <Html html={s.pearlHtml} />
              </aside>
            )}

            {answered && s.guide.length > 0 && (
              <p className="guide-refs">
                <span>In the guide: </span>
                {s.guide.map((g, gi) => (
                  <GuideLink key={gi} {...g} />
                ))}
              </p>
            )}

            {answered && isLast && !done && (
              <button type="button" className="primary" onClick={() => advance(s)}>
                {s.end ? 'Finish case' : 'Continue'} →
              </button>
            )}
          </section>
        );
      })}

      {done && (
        <section className="stage debrief" ref={endRef}>
          <header className="stage-head">
            <span className="stage-num">Debrief</span>
            <h3>Teaching points</h3>
          </header>
          <p className="score">
            Decision score: <strong>{points}</strong> / {maxPoints}
            <span className="muted"> (2 for the best answer, 1 for an acceptable one)</span>
          </p>
          <ol className="teaching">
            {teachingPointsHtml.map((t, i) => (
              <Html as="li" key={i} html={t} />
            ))}
          </ol>
          {references.length > 0 && (
            <>
              <h4>References</h4>
              <ol className="refs">
                {references.map((r) => (
                  <Html as="li" key={r.key} html={r.html} />
                ))}
              </ol>
            </>
          )}
          <button type="button" className="secondary" onClick={restart}>
            Restart case
          </button>
        </section>
      )}
    </div>
  );
}
