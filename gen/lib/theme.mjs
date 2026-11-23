// Single source of truth for colours, type and motion. Mirrors docs/DESIGN.md.
export const palette = {
  void: '#06070F',
  mask: '#2A1B5C',
  copper: '#E0893C',
  gold: '#F4C454',
  phosphor: '#46F5E0',
  glitch: '#FF2E88',
  silk: '#ECE8F7',
  dim: '#8C86A8',
};

export const font = {
  mono: "ui-monospace, 'Cascadia Code', 'JetBrains Mono', Menlo, Consolas, monospace",
  size: { small: 13, body: 15, title: 22, big: 34 },
};

export const motion = {
  arrive: 'cubic-bezier(.2,.8,.2,1)',
  reducedMotionCss: '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }',
};

export const layout = { width: 1000, radius: 14 };

// Shared glow filter, coloured by the element's own stroke/fill.
export const glowFilter = `<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
