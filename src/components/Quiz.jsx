import React from 'react';
// Core-knowledge quiz, usable as a pre-test and post-test.
// Scoring happens in the browser only. For a research pilot, learners copy
// their result code into the study's own (ethics-approved) data form;
// this site never collects or stores responses.
import { useState } from 'react';

const Html = ({ html, as: Tag = 'div', ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;

export default function Quiz({ quiz }) {
  const [mode, setMode] = useState(null); // 'pre' | 'post'
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = quiz.items.length;
  const answeredCount = Object.keys(answers).length;
  const score = quiz.items.reduce((n, it) => n + (answers[it.id] === it.options.findIndex((o) => o.correct) ? 1 : 0), 0);
  const code = `${quiz.version}-${mode}-${score}of${total}-` + quiz.items.map((it) => (answers[it.id] ?? 'x')).join('');

  if (!mode) {
    return (
      <div className="quiz-start">
        <p>{total} single-best-answer questions. Take it once before working through the cases and once after.</p>
        <div className="btn-row">
          <button className="primary" onClick={() => setMode('pre')}>Start pre-test</button>
          <button className="secondary" onClick={() => setMode('post')}>Start post-test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <p className="muted">Mode: {mode === 'pre' ? 'pre-test' : 'post-test'}</p>
      {quiz.items.map((it, i) => {
        const correctIdx = it.options.findIndex((o) => o.correct);
        return (
          <fieldset key={it.id} className="mcq">
            <legend>
              <span className="q-num">{i + 1}.</span> <Html as="span" html={it.stemHtml} />
            </legend>
            {it.options.map((o, oi) => {
              const chosen = answers[it.id] === oi;
              const cls = submitted ? (oi === correctIdx ? 'r-best' : chosen ? 'r-unsafe' : '') : '';
              return (
                <div key={oi} className={`option ${cls} ${chosen ? 'chosen' : ''}`}>
                  <button
                    type="button"
                    disabled={submitted}
                    aria-pressed={chosen}
                    onClick={() => setAnswers({ ...answers, [it.id]: oi })}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + oi)}</span>
                    <Html as="span" html={o.textHtml} />
                  </button>
                </div>
              );
            })}
            {submitted && <Html className="feedback prose" html={it.explanationHtml} />}
          </fieldset>
        );
      })}

      {!submitted ? (
        <button className="primary" disabled={answeredCount < total} onClick={() => setSubmitted(true)}>
          {answeredCount < total ? `Answer all questions (${answeredCount}/${total})` : 'Submit'}
        </button>
      ) : (
        <div className="quiz-result">
          <p className="score">
            Score: <strong>{score}</strong> / {total}
          </p>
          <p>
            Result code (only needed if you are taking part in a study):{' '}
            <code>{code}</code>{' '}
            <button
              className="link-btn"
              onClick={() => navigator.clipboard?.writeText(code).then(() => setCopied(true))}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
