import React from 'react';
// Link to a section of the differential guide, with a hover/focus preview
// of the section summary so learners do not lose their place in a case.
import { useState, useId } from 'react';

export default function GuideLink({ href, title, summary }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="guide-link"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener"
        aria-describedby={summary ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true">§ </span>
        {title}
      </a>
      {summary && open && (
        <span role="tooltip" id={id} className="guide-tip">
          {summary}
        </span>
      )}
    </span>
  );
}
