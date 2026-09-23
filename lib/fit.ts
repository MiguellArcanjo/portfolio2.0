// Keeps card text from being clipped: a card whose content overflows its height first switches to a
// denser layout (data-fit="dense") and, only if it still overflows, becomes scrollable (data-fit="scroll").

// Only in-flow content counts: decorative absolutely-positioned pieces (like the big background number)
// deliberately bleed past the card edge and must not trigger the dense layout.
function overflows(card: HTMLElement) {
  const content = Array.from(card.children).filter(child => getComputedStyle(child).position !== 'absolute') as HTMLElement[];
  const last = content[content.length - 1];
  if (!last) return false;
  const bottom = last.offsetTop + last.offsetHeight;
  return bottom > card.clientHeight - parseFloat(getComputedStyle(card).paddingBottom) + 1;
}

export function fitCard(card: HTMLElement) {
  delete card.dataset.fit;
  if (!overflows(card)) return;
  card.dataset.fit = 'dense';
  if (!overflows(card)) return;
  card.dataset.fit = 'scroll';
}

// Re-fits on resize and whenever fonts finish loading (text metrics change).
export function watchFit(cards: HTMLElement[]) {
  const fitAll = () => cards.forEach(fitCard);
  const observer = new ResizeObserver(fitAll);
  cards.forEach(card => observer.observe(card));
  document.fonts?.ready.then(fitAll);
  fitAll();
  return () => observer.disconnect();
}
