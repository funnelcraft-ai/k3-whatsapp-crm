/* Lightweight SVG charts (ported, no external libs) */
// @ts-nocheck
/* Lightweight SVG charts (no external libs) — line w/ crosshair, grouped bars w/ hover */

  const NS = 'http://www.w3.org/2000/svg';
  const niceStep = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
  const scale = v => { const step = Math.max(1, niceStep(Math.max(1, v) / 4)); const max = Math.max(step, Math.ceil(v / step) * step); return { max, step, ticks: Math.round(max / step) }; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function frame(el, height) {
    el.innerHTML = '';
    el.classList.add('chart');
    const W = Math.max(280, el.clientWidth || 600);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', height); svg.setAttribute('viewBox', `0 0 ${W} ${height}`);
    el.appendChild(svg);
    const tip = document.createElement('div'); tip.className = 'tip'; el.appendChild(tip);
    return { svg, tip, W };
  }
  const add = (svg, tag, attrs, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; svg.appendChild(n); return n; };

  function showTip(tip, el, x, y, title, rows) {
    tip.innerHTML = `<div class="tt">${esc(title)}</div>` + rows.map(r => `<div class="tr"><span class="sw" style="background:${r.color}"></span>${esc(r.name)}<b>${esc(r.value)}</b></div>`).join('');
    tip.classList.add('show');
    const w = tip.offsetWidth, W = el.clientWidth;
    tip.style.left = Math.min(Math.max(0, x + 14), W - w) + 'px';
    tip.style.top = Math.max(0, y - 10) + 'px';
  }

  /* opts: { labels:[], series:[{name,color,values}], height, fmtLabel, area } */
  function line(el, opts) {
    const H = opts.height || 240, m = { t: 12, r: 12, b: 26, l: 34 };
    const { svg, tip, W } = frame(el, H);
    const n = opts.labels.length; const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const sc = scale(Math.max(1, ...opts.series.flatMap(s => s.values))); const max = sc.max;
    const x = i => m.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw); const y = v => m.t + ih - (v / max) * ih;
    for (let k = 0; k <= sc.ticks; k++) { const v = sc.step * k; add(svg, 'line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: k ? 'gl' : 'base' }); add(svg, 'text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'ax' }, Math.round(v)); }
    const every = Math.max(1, Math.ceil(n / Math.floor(iw / 70)));
    opts.labels.forEach((lb, i) => { if ((i % every === 0 && n - 1 - i >= every * 0.75) || i === n - 1) add(svg, 'text', { x: x(i), y: H - 6, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', class: 'ax' }, opts.fmtLabel ? opts.fmtLabel(lb) : lb); });
    opts.series.forEach((s, si) => {
      const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
      if (opts.area && si === 0) add(svg, 'path', { d: d + `L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`, fill: s.color, opacity: .08 });
      add(svg, 'path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    });
    const cross = add(svg, 'line', { y1: m.t, y2: m.t + ih, stroke: '#9aa0a6', 'stroke-dasharray': '3 3', opacity: 0 });
    const dots = opts.series.map(s => add(svg, 'circle', { r: 4.5, fill: s.color, stroke: '#fff', 'stroke-width': 2, opacity: 0 }));
    const hit = add(svg, 'rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' });
    hit.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect(); const px = e.clientX - r.left;
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - m.l) / iw) * (n - 1))));
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
      dots.forEach((d, si) => { d.setAttribute('cx', x(i)); d.setAttribute('cy', y(opts.series[si].values[i])); d.setAttribute('opacity', 1); });
      showTip(tip, el, x(i), e.clientY - r.top, opts.fmtLabel ? opts.fmtLabel(opts.labels[i], true) : opts.labels[i], opts.series.map(s => ({ name: s.name, color: s.color, value: s.values[i] })));
    });
    hit.addEventListener('mouseleave', () => { tip.classList.remove('show'); cross.setAttribute('opacity', 0); dots.forEach(d => d.setAttribute('opacity', 0)); });
  }

  /* opts: { categories:[], series:[{name,color,values}], height, fmt } */
  function bars(el, opts) {
    const H = opts.height || 240, m = { t: 12, r: 8, b: 40, l: 38 };
    const { svg, tip, W } = frame(el, H);
    const n = opts.categories.length, k = opts.series.length; const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const sc = scale(Math.max(1, ...opts.series.flatMap(s => s.values))); const max = sc.max;
    const y = v => m.t + ih - (v / max) * ih; const band = iw / n; const gap = 2;
    const bw = Math.min(28, (band * 0.62 - gap * (k - 1)) / k);
    for (let t = 0; t <= sc.ticks; t++) { const v = sc.step * t; add(svg, 'line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: t ? 'gl' : 'base' }); add(svg, 'text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'ax' }, opts.fmt ? opts.fmt(v) : Math.round(v)); }
    opts.categories.forEach((c, i) => {
      const cx = m.l + band * i + band / 2; const gw = bw * k + gap * (k - 1);
      const label = c.length > 12 && band < 90 ? c.slice(0, 10) + '…' : c;
      add(svg, 'text', { x: cx, y: H - 22, 'text-anchor': 'middle', class: 'ax' }, label);
      opts.series.forEach((s, si) => {
        const v = s.values[i]; const x0 = cx - gw / 2 + si * (bw + gap); const h = Math.max(v ? 2 : 0, ih - (y(v) - m.t));
        const r = Math.min(4, bw / 2, h);
        // rounded top only, anchored to baseline
        const yb = m.t + ih, yt = yb - h;
        add(svg, 'path', { d: `M${x0},${yb}V${yt + r}Q${x0},${yt} ${x0 + r},${yt}H${x0 + bw - r}Q${x0 + bw},${yt} ${x0 + bw},${yt + r}V${yb}Z`, fill: s.color });
      });
      const hit = add(svg, 'rect', { x: m.l + band * i, y: m.t, width: band, height: ih, fill: 'transparent' });
      hit.addEventListener('mousemove', e => { const r = svg.getBoundingClientRect(); hit.setAttribute('fill', 'rgba(60,64,67,.05)'); showTip(tip, el, e.clientX - r.left, e.clientY - r.top, c, opts.series.map(s => ({ name: s.name, color: s.color, value: opts.fmt ? opts.fmt(s.values[i]) : s.values[i] }))); });
      hit.addEventListener('mouseleave', () => { hit.setAttribute('fill', 'transparent'); tip.classList.remove('show'); });
    });
  }

  function legend(series) { return `<div class="legend">${series.map(s => `<span><i class="sw" style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`; }
  
export const Charts = { line, bars };
