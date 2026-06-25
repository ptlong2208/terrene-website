// Splits an element's text into visual lines by measuring offsetTop of each
// word, grouping consecutive words within 4px tolerance (matches reference).
// Each line is wrapped in overflow:hidden + will-change:transform span pair so
// GSAP yPercent slides lines up without clipping neighbours.
export function splitIntoLines(
  element: HTMLElement,
  restoreFns: Array<() => void>,
): HTMLElement[] {
  const originalText = element.textContent?.trim().replace(/\s+/g, ' ');
  if (!originalText) return [];

  const originalAriaLabel = element.getAttribute('aria-label');
  element.setAttribute('aria-label', originalText);
  element.textContent = '';

  const wordSpans: HTMLSpanElement[] = originalText.split(' ').map((word) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    return span;
  });

  wordSpans.forEach((span, i) => {
    element.appendChild(span);
    if (i < wordSpans.length - 1) element.appendChild(document.createTextNode(' '));
  });

  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentTop: number | null = null;

  wordSpans.forEach((span) => {
    const top = span.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 4) {
      currentLine.push(span.textContent ?? '');
      if (currentTop === null) currentTop = top;
    } else {
      lines.push(currentLine);
      currentLine = [span.textContent ?? ''];
      currentTop = top;
    }
  });
  if (currentLine.length) lines.push(currentLine);

  element.textContent = '';
  const lineElements: HTMLElement[] = [];

  lines.forEach((lineWords) => {
    const lineWrap = document.createElement('span');
    lineWrap.style.display = 'block';
    lineWrap.style.overflow = 'hidden';
    lineWrap.setAttribute('aria-hidden', 'true');

    const line = document.createElement('span');
    line.style.display = 'block';
    line.style.willChange = 'transform';
    line.textContent = lineWords.join(' ');

    lineWrap.appendChild(line);
    element.appendChild(lineWrap);
    lineElements.push(line);
  });

  restoreFns.push(() => {
    element.textContent = originalText;
    if (originalAriaLabel === null) {
      element.removeAttribute('aria-label');
    } else {
      element.setAttribute('aria-label', originalAriaLabel);
    }
  });

  return lineElements;
}
