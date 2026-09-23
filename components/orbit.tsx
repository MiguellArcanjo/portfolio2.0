'use client';

import { useEffect, useRef } from 'react';
import land from '@/lib/globe-land.json';

type Vector = [number, number, number];
const radians = Math.PI / 180;
const sphere = (longitude: number, latitude: number): Vector => [
  Math.cos(latitude * radians) * Math.sin(longitude * radians),
  -Math.sin(latitude * radians),
  Math.cos(latitude * radians) * Math.cos(longitude * radians),
];
const continents = land.map(([longitude, latitude]) => sphere(longitude, latitude));
const cities = [[-46.63, -23.55], [-74, 40.71], [-.12, 51.5], [13.4, 52.52], [139.69, 35.68], [103.82, 1.35], [18.42, -33.92]].map(([lon, lat]) => sphere(lon, lat));
const routes = [[0, 1], [0, 2], [0, 6], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]].map(([from, to]) => {
  const a = cities[from], b = cities[to];
  const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, value, i) => sum + value * b[i], 0))));
  return Array.from({ length: 65 }, (_, i): Vector => {
    const t = i / 64, height = 1 + Math.sin(t * Math.PI) * .19;
    return a.map((v, axis) => (v * Math.sin((1 - t) * angle) + b[axis] * Math.sin(t * angle)) / Math.sin(angle) * height) as Vector;
  });
});
const graticule: Vector[][] = [];
for (let lat = -60; lat <= 60; lat += 20) graticule.push(Array.from({ length: 121 }, (_, i) => sphere(i * 3 - 180, lat)));
for (let lon = -180; lon < 180; lon += 20) graticule.push(Array.from({ length: 61 }, (_, i) => sphere(lon, i * 3 - 90)));

export function Orbit() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, previous = 0, elapsed = 0;
    let visible = true, disposed = false, mx = 0, my = 0, tx = 0, ty = 0;
    const draw = () => {
      const radius = Math.min(width, height) * .345;
      if (!radius) return;
      const cx = width * .5, cy = height * .5;
      const rotation = .48 + elapsed * .115 + mx, tilt = -.13 + my;
      const project = ([x, y, z]: Vector): Vector => {
        const rx = x * Math.cos(rotation) + z * Math.sin(rotation);
        const rz = z * Math.cos(rotation) - x * Math.sin(rotation);
        return [cx + rx * radius, cy + (y * Math.cos(tilt) - rz * Math.sin(tilt)) * radius, y * Math.sin(tilt) + rz * Math.cos(tilt)];
      };
      ctx.clearRect(0, 0, width, height);
      const atmosphere = ctx.createRadialGradient(cx, cy, radius * .85, cx, cy, radius * 1.4);
      atmosphere.addColorStop(0, '#218bff00'); atmosphere.addColorStop(.3, '#168aff24');
      atmosphere.addColorStop(.56, '#176eff0b'); atmosphere.addColorStop(1, '#176eff00');
      ctx.fillStyle = atmosphere; ctx.fillRect(0, 0, width, height);
      const core = ctx.createRadialGradient(cx - radius * .4, cy - radius * .4, 0, cx, cy, radius);
      core.addColorStop(0, '#10273d'); core.addColorStop(.7, '#091626'); core.addColorStop(1, '#07111e');
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = core; ctx.fill();
      const line = (points: Vector[], color: string, lineWidth: number) => {
        ctx.beginPath(); let connected = false;
        for (const point of points) {
          const p = project(point);
          if (p[2] < .015) { connected = false; continue; }
          if (connected) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
          connected = true;
        }
        ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
      };
      graticule.forEach(points => line(points, '#368edb30', .65));
      // Equal-distance land dots from Natural Earth's public-domain geography.
      // Dots are batched by depth: one fill per bucket instead of one per dot.
      const buckets: number[][] = Array.from({ length: 5 }, () => []);
      for (const point of continents) {
        const [x, y, depth] = project(point);
        if (depth > 0) buckets[Math.min(4, Math.floor(depth * 5))].push(x, y);
      }
      const dotScale = Math.min(width / 500, 1.15);
      buckets.forEach((dots, bucket) => {
        const depth = (bucket + .5) / 5, size = (.65 + depth * .65) * dotScale * 1.8;
        ctx.beginPath();
        for (let i = 0; i < dots.length; i += 2) ctx.rect(dots[i] - size / 2, dots[i + 1] - size / 2, size, size);
        ctx.fillStyle = `rgba(85, 202, 255, ${.22 + depth * .72})`; ctx.fill();
      });
      // A wide translucent stroke under each route replaces the costly shadowBlur glow.
      routes.forEach((points, index) => {
        line(points, index % 3 === 0 ? '#9094ff1f' : '#46cfff1f', 4);
        line(points, index % 3 === 0 ? '#9094ff80' : '#46cfff80', 1);
        const [x, y, z] = project(points[Math.floor(((elapsed * .15 + index * .137) % 1) * 64)]);
        if (z > 0) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#d1f6ff'; ctx.fill(); }
      });
      cities.forEach((point, index) => {
        const [x, y, depth] = project(point);
        if (depth < .05) return;
        const pulse = reduced.matches ? .5 : (elapsed * .45 + index * .21) % 1;
        ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94, 207, 255, ${(1 - pulse) * .45})`; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fillStyle = '#c0f3ff'; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#56caff22'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = '#56caff8a'; ctx.lineWidth = 1; ctx.stroke();
    };
    const tick = (timestamp: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden) { previous = 0; return; }
      const dt = previous ? Math.min((timestamp - previous) / 1000, .05) : 0;
      previous = timestamp;
      if (!reduced.matches) { elapsed += dt; const ease = 1 - Math.exp(-dt * 3); mx += (tx - mx) * ease; my += (ty - my) * ease; }
      draw();
      if (!reduced.matches) frame = requestAnimationFrame(tick);
    };
    const resume = () => { if (!frame && !disposed) frame = requestAnimationFrame(tick); };
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); resume();
    };
    const pointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      tx = (event.clientX / innerWidth - .5) * .3; ty = (event.clientY / innerHeight - .5) * .15;
    };
    const motion = () => { previous = 0; mx = 0; my = 0; resume(); };
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); });
    visibilityObserver.observe(canvas);
    window.addEventListener('pointermove', pointer, { passive: true }); document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', motion);
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(frame); sizeObserver.disconnect(); visibilityObserver.disconnect();
      window.removeEventListener('pointermove', pointer); document.removeEventListener('visibilitychange', resume); reduced.removeEventListener('change', motion);
    };
  }, []);
  return <canvas ref={ref} className="orbit-canvas" aria-label="Globo terrestre neon azul girando, com continentes pontilhados e conexões luminosas entre cidades" role="img" />;
}
