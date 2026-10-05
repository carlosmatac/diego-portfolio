import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/source-serif-4/wght.css';
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { Feature, GeometryObject, LineString, MultiLineString } from 'geojson';
import { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import countries50 from 'world-atlas/countries-50m.json';
import { OUTRO, legs, stops } from './data';

const INK = '#1a1917';
const MUTED = '#57534c';
const DISPLAY = "'Archivo Variable', 'Archivo', sans-serif";
const TEXT = "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif";

const topo = countries50 as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
const land = feature(topo, topo.objects.land) as unknown as Feature<GeometryObject>;
const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b) as MultiLineString;
const graticule = geoGraticule10();

type View = { center: [number, number]; radius: number };

/** Camera per stop, radius in units of the frame's short side. */
const views: View[] = [
  { center: [-3.4, 39.0], radius: 5.2 },
  { center: [-3.9, 40.6], radius: 4.2 },
  { center: [-118, 38.5], radius: 1.7 },
  { center: [4, 43], radius: 2.6 },
  { center: [0, 46], radius: 2.3 },
  { center: [-70, 42.6], radius: 1.9 },
];
const overview = (landscape: boolean): View =>
  landscape ? { center: [-50, 44], radius: 0.62 } : { center: [-46, 42], radius: 0.5 };
/** How far each leg pulls back mid-flight (fraction of the radius). */
const dips = [0, 0.86, 0.8, 0.2, 0.66];

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const logLerp = (a: number, b: number, t: number) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);

function camera(frame: number, landscape: boolean): View {
  let view = views[0];
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (frame < leg.move) break;
    const from = views[leg.to - 1];
    const to = views[leg.to];
    const t = ease(interpolate(frame, [leg.move, leg.arrive + 24], [0, 1], clamp));
    const radius = logLerp(from.radius, to.radius, t) * (1 - dips[i] * Math.sin(Math.PI * t));
    view = { center: geoInterpolate(from.center, to.center)(t) as [number, number], radius };
  }
  if (frame >= OUTRO) {
    const t = ease(interpolate(frame, [OUTRO, OUTRO + 90], [0, 1], clamp));
    const o = overview(landscape);
    view = { center: geoInterpolate(view.center, o.center)(t) as [number, number], radius: logLerp(view.radius, o.radius, t) };
  }
  return view;
}

/** Fraction of each leg's line drawn at this frame. */
const drawn = (frame: number) => legs.map((leg) => ease(interpolate(frame, [leg.draw, leg.arrive], [0, 1], clamp)));

/** Index of the stop whose caption is showing. */
function current(frame: number) {
  let i = 0;
  for (const leg of legs) if (frame >= leg.arrive) i = leg.to;
  return i;
}

/** Hand-drawn feel: the pencil filter's noise changes on fours, like the drawn animation at the top of the site. */
const PencilFilter: React.FC<{ seed: number }> = ({ seed }) => (
  <defs>
    <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="wobble" />
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale={3.2} xChannelSelector="R" yChannelSelector="G" result="moved" />
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={seed + 7} result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.25" result="mask" />
      <feComposite in="moved" in2="mask" operator="in" />
    </filter>
    <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

const Caption: React.FC<{ index: number; frame: number; short: number; landscape: boolean }> = ({ index, frame, short, landscape }) => {
  const stop = stops[index];
  const start = index === 0 ? 14 : legs[index - 1].arrive;
  const end = index === stops.length - 1 ? OUTRO + 40 : legs[index].move + 8;
  const rise = ease(interpolate(frame, [start, start + 22], [0, 1], clamp));
  const leave = ease(interpolate(frame, [end - 4, end + 14], [0, 1], clamp));
  if (rise <= 0 || leave >= 1) return null;
  const size = short * (landscape ? 0.2 : 0.19);
  const y = (1 - rise) * 135 - leave * 135;
  const sub = interpolate(frame, [start + 10, start + 30], [0, 1], clamp) * (1 - leave);
  return (
    <div style={{ position: 'absolute', left: short * 0.075, bottom: short * (landscape ? 0.07 : 0.075), right: short * 0.075 }}>
      <div style={{ overflow: 'hidden', paddingBottom: size * 0.24, marginBottom: -size * 0.18 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 780,
            fontStretch: '112%',
            fontSize: size,
            letterSpacing: '-0.055em',
            lineHeight: 0.86,
            color: INK,
            transform: `translateY(${y}%)`,
            marginLeft: '-0.04em',
          }}
        >
          {stop.name}
        </div>
      </div>
      <div style={{ fontFamily: TEXT, fontSize: short * 0.034, lineHeight: 1.3, color: MUTED, opacity: sub, marginTop: short * 0.018 }}>
        {stop.line}
        {stop.year ? `, ${stop.year}` : ''}
      </div>
    </div>
  );
};

export const Route: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`780 100px 'Archivo Variable'`),
      document.fonts.load(`600 40px 'Archivo Variable'`),
      document.fonts.load(`400 40px 'Source Serif 4 Variable'`),
    ]).then(() => continueRender(handle));
  }, [handle]);

  const landscape = width > height;
  const short = Math.min(width, height);
  const focus: [number, number] = landscape ? [width * 0.6, height * 0.46] : [width * 0.5, height * 0.4];
  const view = camera(frame, landscape);
  const projection = useMemo(() => geoOrthographic().clipAngle(90).precision(0.3), []);
  projection
    .rotate([-view.center[0], -view.center[1]])
    .scale(view.radius * short)
    .translate(focus);
  const path = geoPath(projection);
  const parts = drawn(frame);
  const at = current(frame);
  const seed = Math.floor(frame / 4) % 12;

  const intro = interpolate(frame, [0, 26], [0, 1], clamp);
  const sphere = path({ type: 'Sphere' }) ?? '';
  const visible = (p: [number, number]) => geoDistance(p, view.center) < Math.PI / 2 - 0.02;

  const routeLines: LineString[] = legs.map((leg, i) => {
    const a = stops[leg.to - 1].lonLat;
    const b = stops[leg.to].lonLat;
    const head = geoInterpolate(a, b)(Math.max(parts[i], 0.0001)) as [number, number];
    return { type: 'LineString', coordinates: [a, head] };
  });
  const headIndex = parts.findIndex((p) => p > 0 && p < 1);
  const head = headIndex >= 0 ? (routeLines[headIndex].coordinates[1] as [number, number]) : undefined;
  const labelsOn = frame >= OUTRO + 60;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: intro }}>
        <PencilFilter seed={seed} />
        <g filter="url(#wobble)">
          <path d={sphere} fill="#f6f5f2" />
          <path d={path(graticule) ?? ''} fill="none" stroke={INK} strokeOpacity={0.07} strokeWidth={1} />
          <path d={path(land) ?? ''} fill="#e9e7e2" stroke={INK} strokeOpacity={0.55} strokeWidth={1.3} strokeLinejoin="round" />
          <path d={path(borders) ?? ''} fill="none" stroke={INK} strokeOpacity={0.2} strokeWidth={0.9} strokeDasharray="5 5" />
          <path d={sphere} fill="none" stroke={INK} strokeOpacity={0.5} strokeWidth={1.6} />
        </g>
        <g filter="url(#pencil)">
          {routeLines.map((l, i) =>
            parts[i] > 0 ? (
              <path key={i} d={path(l) ?? ''} fill="none" stroke={INK} strokeWidth={short * 0.0042} strokeLinecap="round" />
            ) : null,
          )}
        </g>
        {stops.map((s, i) => {
          const shownAt = i === 0 ? 18 : legs[i - 1].arrive;
          if (frame < shownAt || !visible(s.lonLat)) return null;
          const [x, y] = projection(s.lonLat) as [number, number];
          const pop = ease(interpolate(frame, [shownAt, shownAt + 12], [0, 1], clamp));
          const ring = interpolate(frame, [shownAt, shownAt + 34], [0, 1], clamp);
          const labelOpacity = labelsOn ? interpolate(frame, [OUTRO + 60, OUTRO + 84], [0, 1], clamp) : i === at ? 0 : 0.85;
          const fs = short * 0.026;
          return (
            <g key={s.id}>
              <circle cx={x} cy={y} r={short * 0.011 * (1 + ring * 2.4)} fill="none" stroke={INK} strokeOpacity={(1 - ring) * 0.6} strokeWidth={1.5} />
              <circle cx={x} cy={y} r={short * 0.0072 * pop} fill={INK} />
              <text
                x={x + (s.side === 'right' ? 1 : -1) * short * 0.02}
                y={y + fs * 0.35}
                textAnchor={s.side === 'right' ? 'start' : 'end'}
                fontFamily={DISPLAY}
                fontWeight={620}
                fontSize={fs}
                fill={INK}
                opacity={labelOpacity * pop}
              >
                {s.name}
              </text>
            </g>
          );
        })}
        {head && visible(head) && (() => {
          const [x, y] = projection(head) as [number, number];
          return <circle cx={x} cy={y} r={short * 0.0048} fill={INK} />;
        })()}
      </svg>
      {stops.map((_, i) => (
        <Caption key={i} index={i} frame={frame} short={short} landscape={landscape} />
      ))}
      <Outro frame={frame} short={short} landscape={landscape} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ frame: number; short: number; landscape: boolean }> = ({ frame, short, landscape }) => {
  const t = ease(interpolate(frame, [OUTRO + 54, OUTRO + 80], [0, 1], clamp));
  if (t <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: short * 0.075,
        bottom: short * (landscape ? 0.075 : 0.08),
        fontFamily: TEXT,
        fontSize: short * 0.034,
        color: MUTED,
        opacity: t,
        transform: `translateY(${(1 - t) * 12}px)`,
      }}
    >
      Granada, Madrid, Berkeley, Bologna, Bruges, Boston
    </div>
  );
};

