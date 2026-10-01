'use client';

import { useEffect, useRef } from 'react';

const SVG = 'http://www.w3.org/2000/svg';

// The name is drawn stroke by stroke, letter after letter: an SVG copy of each glyph traces its outline, then
// the first name fills in while the last name keeps only the line. The HTML letters stay underneath for layout,
// search engines and screen readers; they are revealed by CSS if the script never runs.
export function DrawnName({ name }: { name: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const words = name.includes(' ') ? [name.split(' ').slice(0, -1).join(' '), name.split(' ').at(-1)!] : [name, '.'];

  useEffect(() => {
    const h1 = heading.current;
    if (!h1 || matchMedia('(prefers-reduced-motion: reduce)').matches) { h1?.setAttribute('data-static', ''); return; }
    let svg: SVGSVGElement | null = null;
    let animate = true;

    const draw = () => {
      svg?.remove();
      const box = h1.getBoundingClientRect();
      const size = parseFloat(getComputedStyle(h1).fontSize);
      // One dash longer than any glyph outline: offsetting it by its own length hides the stroke, zero shows it whole.
      const dash = Math.round(size * 9);
      svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'drawn-name');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', String(box.width));
      svg.setAttribute('height', String(box.height));
      let order = 0;
      h1.querySelectorAll<HTMLElement>('.name-word').forEach((word, wordIndex) => {
        const baseline = word.querySelector<HTMLElement>('.name-baseline')!.getBoundingClientRect().top - box.top;
        word.querySelectorAll<HTMLElement>('.name-letter').forEach(letter => {
          const text = document.createElementNS(SVG, 'text');
          text.textContent = letter.textContent;
          text.setAttribute('x', String(letter.getBoundingClientRect().left - box.left));
          text.setAttribute('y', String(baseline));
          text.setAttribute('class', wordIndex === 0 ? 'is-solid' : 'is-line');
          text.style.setProperty('--dash', `${dash}px`);
          text.style.setProperty('--i', String(order++));
          svg!.append(text);
        });
      });
      svg.classList.toggle('is-animated', animate);
      h1.append(svg);
      h1.setAttribute('data-drawn', '');
    };

    const ready = document.fonts?.ready ?? Promise.resolve();
    let alive = true;
    ready.then(() => {
      if (!alive) return;
      draw();
      // Later redraws (resize, late font swap) jump straight to the finished state.
      animate = false;
    });
    // Only a real size change redraws: the observer's first report must not cut the running animation short.
    const observer = new ResizeObserver(() => {
      if (svg && Math.abs(Number(svg.getAttribute('width')) - h1.getBoundingClientRect().width) > 1) draw();
    });
    observer.observe(h1);
    return () => { alive = false; observer.disconnect(); svg?.remove(); h1.removeAttribute('data-drawn'); };
  }, [name]);

  return <h1 ref={heading} className="drawn-heading">
    <span className="sr-only">{words.join(' ')}</span>
    {words.map((word, index) => <span key={index} className="name-word" aria-hidden="true">
      {[...word].map((char, i) => <span key={i} className="name-letter">{char}</span>)}
      <i className="name-baseline"/>
    </span>)}
  </h1>;
}
