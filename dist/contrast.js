(function (root) {
  'use strict';
  // This parser intentionally supports a small, explicit sRGB subset, not all CSS colors.
  const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  function channel(value, max) {
    const percent = value.endsWith('%');
    const raw = percent ? value.slice(0, -1) : value;
    if (!number.test(raw)) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > (percent ? 100 : max)) return null;
    return percent ? n * max / 100 : n;
  }
  function parse(value) {
    if (typeof value !== 'string' || value.length > 128) return null;
    const s = value.trim().toLowerCase();
    if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(s)) {
      const hex = s.length <= 5 ? s.slice(1).split('').map(c => c + c).join('') : s.slice(1);
      return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1 };
    }
    const match = /^rgba?\(([^()]*)\)$/.exec(s);
    if (!match) return null;
    let rgb, alpha = '1';
    if (match[1].includes(',')) {
      if (match[1].includes('/')) return null;
      const parts = match[1].split(',').map(x => x.trim());
      if (parts.length !== 3 && parts.length !== 4) return null;
      rgb = parts.slice(0, 3); alpha = parts[3] ?? '1';
      // Legacy comma syntax cannot mix percentages and numeric channels.
      if (rgb.some(x => x.endsWith('%')) && !rgb.every(x => x.endsWith('%'))) return null;
    } else {
      const parts = match[1].split('/');
      if (parts.length > 2) return null;
      rgb = parts[0].trim().split(/\s+/); alpha = (parts[1] ?? '1').trim();
      if (rgb.length !== 3) return null;
    }
    const values = rgb.map(x => channel(x, 255)); const a = channel(alpha, 1);
    if (values.includes(null) || a === null) return null;
    return { r: values[0], g: values[1], b: values[2], a };
  }
  function valid(c) { return c && ['r','g','b','a'].every(k => Number.isFinite(c[k])) && ['r','g','b'].every(k => c[k] >= 0 && c[k] <= 255) && c.a >= 0 && c.a <= 1; }
  function color(value) { const c = typeof value === 'string' ? parse(value) : value; if (!valid(c)) throw new Error('Unsupported or invalid sRGB color'); return c; }
  function composite(front, back) {
    const f = color(front), b = color(back), a = f.a + b.a * (1 - f.a);
    if (a === 0) return { r:0, g:0, b:0, a:0 };
    return { r:(f.r*f.a + b.r*b.a*(1-f.a))/a, g:(f.g*f.a + b.g*b.a*(1-f.a))/a, b:(f.b*f.a + b.b*b.a*(1-f.a))/a, a };
  }
  function normalize(hex) { if (typeof hex !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null; return (hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c + c).join('') : hex).toUpperCase(); }
  function luminance(value) { const c = color(value); if (c.a !== 1) throw new Error('Resolve transparency on an opaque backdrop first'); const v = [c.r,c.g,c.b].map(x => x/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4); return .2126*v[0]+.7152*v[1]+.0722*v[2]; }
  function ratio(a,b) { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  function evaluate(foreground, background, backdrop) { const canvas=color(backdrop); if (canvas.a !== 1) throw new Error('An explicit opaque backdrop is required'); const bg=composite(background,canvas), fg=composite(foreground,bg); return {ratio:ratio(fg,bg),foreground:fg,background:bg}; }
  function toHex(value) { const c=color(value); return '#'+[c.r,c.g,c.b].map(x => Math.round(x).toString(16).padStart(2,'0')).join('').toUpperCase(); }
  function toCss(value) { const c=color(value); return `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`; }
  const api={parse,normalize,composite,luminance,ratio,evaluate,toHex,toCss,passes:(value,minimum)=>Number.isFinite(value)&&value>=minimum};
  root.Contrast=api; if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
