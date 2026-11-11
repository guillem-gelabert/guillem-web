"use client";

import { useEffect, useRef, useState } from "react";
import data from "./players.json";
import type { Stage } from "./avatar-stage";
import styles from "./player-radar.module.css";

type Player = (typeof data.players)[number];

const HEADLINE = [
  { short: "Pace", name: "Pace" },
  { short: "Shooting", name: "Shooting" },
  { short: "Passing", name: "Passing" },
  { short: "Dribbling", name: "Dribbling" },
  { short: "Defending", name: "Defending" },
  { short: "Physical", name: "Physical" },
];

// The 29 search attributes in the CSV's order, which already runs pace,
// shooting, passing, dribbling, defending, physical round the dial.
const DETAILED: Record<string, { short: string; name: string }> = {
  acceleration: { short: "ACC", name: "Acceleration" },
  sprintSpeed: { short: "SPD", name: "Sprint speed" },
  finishing: { short: "FIN", name: "Finishing" },
  shotPower: { short: "SHP", name: "Shot power" },
  longShots: { short: "LSH", name: "Long shots" },
  volleys: { short: "VOL", name: "Volleys" },
  penalties: { short: "PEN", name: "Penalties" },
  positioning: { short: "POS", name: "Positioning" },
  shortPassing: { short: "SPA", name: "Short passing" },
  longPassing: { short: "LPA", name: "Long passing" },
  curve: { short: "CUR", name: "Curve" },
  freeKickAccuracy: { short: "FKA", name: "Free-kick accuracy" },
  crossing: { short: "CRO", name: "Crossing" },
  vision: { short: "VIS", name: "Vision" },
  dribbling: { short: "DRI", name: "Dribbling" },
  ballControl: { short: "BAL", name: "Ball control" },
  agility: { short: "AGI", name: "Agility" },
  balance: { short: "BLN", name: "Balance" },
  reactions: { short: "REA", name: "Reactions" },
  composure: { short: "COM", name: "Composure" },
  interceptions: { short: "INT", name: "Interceptions" },
  defensiveAwareness: { short: "DAW", name: "Defensive awareness" },
  standingTackle: { short: "STA", name: "Standing tackle" },
  slidingTackle: { short: "SLI", name: "Sliding tackle" },
  headingAccuracy: { short: "HEA", name: "Heading accuracy" },
  aggression: { short: "AGG", name: "Aggression" },
  jumping: { short: "JUM", name: "Jumping" },
  stamina: { short: "STM", name: "Stamina" },
  strength: { short: "STR", name: "Strength" },
};
const DETAILED_AXES = data.detailed.map((key) => DETAILED[key]);

// Up to five players. Four shades cannot carry five series by colour, so
// each one gets its own line and its own vertex marker; the legend and the
// table header repeat both.
const SERIES = [
  { stroke: "var(--shade-3)", dash: undefined, width: 2, marker: "circle" },
  { stroke: "var(--shade-3)", dash: "6 3", width: 2, marker: "square" },
  { stroke: "var(--shade-2)", dash: undefined, width: 2, marker: "triangle" },
  { stroke: "var(--shade-3)", dash: "1.5 3", width: 2, marker: "diamond" },
  { stroke: "var(--shade-2)", dash: "6 3", width: 2, marker: "cross" },
] as const;
const MAX = SERIES.length;

const DEFAULTS = ["deu-wirtz", "nld-dijk"];
const ADD_ORDER = ["eng-saka", "esp-olmo", "nor-haaland", "fra-kante", "fra-mbappe"];

const SIZE = 360;
const C = SIZE / 2;
const R = 128;
const RINGS = [20, 40, 60, 80];
const SCALE = 99;

const bySlug = new Map(data.players.map((p) => [p.slug, p]));
const sorted = [...data.players].sort((a, b) => a.name.localeCompare(b.name));
const surname = (p: Player) => (p.name.split(" ").length > 1 ? p.name.split(" ").slice(1).join(" ") : p.name);

function at(i: number, n: number, value: number): [number, number] {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  const r = (value / SCALE) * R;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
}

function Marker({ kind, x, y, fill, stroke }: { kind: string; x: number; y: number; fill: string; stroke: string }) {
  const s = 3.5;
  if (kind === "circle") return <circle cx={x} cy={y} r={s} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  if (kind === "square") return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  if (kind === "triangle")
    return <polygon points={`${x},${y - s - 1} ${x + s + 1},${y + s} ${x - s - 1},${y + s}`} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  if (kind === "diamond")
    return <polygon points={`${x},${y - s - 1} ${x + s + 1},${y} ${x},${y + s + 1} ${x - s - 1},${y}`} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  return <path d={`M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}`} stroke={stroke} strokeWidth={2} />;
}

function Key({ index }: { index: number }) {
  const s = SERIES[index];
  return (
    <svg className={styles.key} viewBox="0 0 28 12" aria-hidden="true">
      <line x1={1} y1={6} x2={27} y2={6} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} />
      <Marker kind={s.marker} x={14} y={6} fill="var(--shade-0)" stroke={s.stroke} />
    </svg>
  );
}

/**
 * Interactive 5: the shape of a footballer. A radar of EA FC26 ratings on
 * a common 0–99 scale, six headline numbers or all 29 search attributes,
 * with each player standing above it as their PES 6 avatar. The table
 * carries every number, so the polygon never has to be read as a score.
 */
export function PlayerRadar() {
  const [slugs, setSlugs] = useState<string[]>(DEFAULTS);
  const [detailed, setDetailed] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);

  const players = slugs.map((s) => bySlug.get(s)!);
  const axes = detailed ? DETAILED_AXES : HEADLINE;
  const n = axes.length;
  const values = (p: Player) => (detailed ? p.detailed : p.headline);

  const latest = useRef(players);
  useEffect(() => {
    latest.current = players;
  });
  const roster = (list: Player[]) => list.map((p) => ({ key: p.slug, assets: p.assets }));

  useEffect(() => {
    let cancelled = false;
    let built: Stage | null = null;
    (async () => {
      const { createStage } = await import("./avatar-stage");
      if (cancelled || !strip.current || !canvas.current) return;
      built = await createStage(strip.current, canvas.current);
      if (cancelled) return built.dispose();
      stage.current = built;
      built.setPlayers(roster(latest.current));
    })();
    return () => {
      cancelled = true;
      built?.dispose();
      stage.current = null;
    };
  }, []);

  useEffect(() => {
    stage.current?.setPlayers(roster(players));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join()]);

  const replace = (i: number, slug: string) => setSlugs((s) => s.map((x, j) => (j === i ? slug : x)));
  const remove = (i: number) => setSlugs((s) => s.filter((_, j) => j !== i));
  const add = () =>
    setSlugs((s) => {
      const next = ADD_ORDER.find((x) => !s.includes(x)) ?? sorted.find((p) => !s.includes(p.slug))!.slug;
      return [...s, next];
    });

  const title = `${detailed ? "29 detailed attributes" : "Six headline ratings"} for ${players.map((p) => p.name).join(", ")}, on a 0 to 99 scale`;

  return (
    <div className={`player-radar not-prose ${styles.root}`} role="group" aria-label="Player radar" data-testid="player-radar">
      <div className={styles.controls}>
        <ol className={styles.roster}>
          {players.map((p, i) => (
            <li key={i} className={styles.slot}>
              <Key index={i} />
              <label className={styles.srOnly} htmlFor={`player-radar-${i}`}>
                Player {i + 1}
              </label>
              <select
                id={`player-radar-${i}`}
                value={p.slug}
                onChange={(e) => replace(i, e.target.value)}
                data-testid={`player-${i}`}
              >
                {sorted.map((o) => (
                  <option key={o.slug} value={o.slug} disabled={o.slug !== p.slug && slugs.includes(o.slug)}>
                    {o.name}
                  </option>
                ))}
              </select>
              {players.length > 1 ? (
                <button type="button" onClick={() => remove(i)} aria-label={`Remove ${p.name}`} className={styles.remove}>
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ol>
        <div className={styles.actions}>
          <button type="button" onClick={add} disabled={players.length >= MAX} data-testid="add-player">
            + Add player
          </button>
          <div className={styles.toggle} role="radiogroup" aria-label="Attributes">
            <button type="button" role="radio" aria-checked={!detailed} onClick={() => setDetailed(false)} data-testid="view-6">
              6 headline
            </button>
            <button type="button" role="radio" aria-checked={detailed} onClick={() => setDetailed(true)} data-testid="view-29">
              29 detailed
            </button>
          </div>
        </div>
      </div>

      <div ref={strip} className={styles.strip} data-count={players.length} aria-hidden="true">
        <canvas ref={canvas} className={styles.canvas} data-testid="avatar-canvas" />
        <ol className={styles.names}>
          {players.map((p, i) => (
            <li key={p.slug} style={{ left: `${((i + 0.5) / players.length) * 100}%` }}>
              <Key index={i} />
              <span>{surname(p)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.body} data-detailed={detailed ? "" : undefined}>
        <svg className={styles.radar} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title} data-testid="radar">
          {RINGS.map((ring) => (
            <polygon
              key={ring}
              points={axes.map((_, i) => at(i, n, ring).join(",")).join(" ")}
              fill="none"
              stroke="var(--shade-1)"
              strokeWidth={1}
            />
          ))}
          <polygon
            points={axes.map((_, i) => at(i, n, SCALE).join(",")).join(" ")}
            fill="none"
            stroke="var(--shade-2)"
            strokeWidth={1}
          />
          {axes.map((axis, i) => {
            const [x, y] = at(i, n, SCALE);
            return (
              <line
                key={axis.name}
                x1={C}
                y1={C}
                x2={x}
                y2={y}
                stroke={hovered === i ? "var(--shade-3)" : "var(--shade-1)"}
                strokeWidth={1}
              />
            );
          })}
          {players.map((p, k) => {
            const s = SERIES[k];
            const v = values(p);
            return (
              <g key={p.slug} data-testid="series">
                <polygon
                  points={v.map((x, i) => at(i, n, x).join(",")).join(" ")}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={s.width}
                  strokeDasharray={s.dash}
                  strokeLinejoin="round"
                />
                {v.map((x, i) => {
                  const [px, py] = at(i, n, x);
                  return <Marker key={i} kind={s.marker} x={px} y={py} fill="var(--shade-0)" stroke={s.stroke} />;
                })}
              </g>
            );
          })}
          {axes.map((axis, i) => {
            const [x, y] = at(i, n, detailed ? 116 : 122);
            const anchor = Math.abs(x - C) < 4 ? "middle" : x > C ? "start" : "end";
            return (
              <text
                key={axis.name}
                x={x}
                y={y}
                textAnchor={detailed ? "middle" : anchor}
                dominantBaseline="middle"
                className={styles.axisLabel}
                fill={hovered === i ? "var(--shade-3)" : "var(--shade-2)"}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {axis.short}
              </text>
            );
          })}
          <text x={C + 3} y={at(0, n, 80)[1] - 1} className={styles.ringLabel} fill="var(--shade-2)">
            80
          </text>
          <text x={C + 3} y={at(0, n, 40)[1] - 1} className={styles.ringLabel} fill="var(--shade-2)">
            40
          </text>
        </svg>

        <div className={styles.tableWrap}>
          <table className={styles.table} data-testid="ratings">
            <caption className={styles.srOnly}>EA FC26 ratings, 0 to 99</caption>
            <thead>
              <tr>
                <th scope="col">Rating</th>
                {players.map((p, k) => (
                  <th scope="col" key={p.slug} title={p.name}>
                    <Key index={k} />
                    <span>{surname(p)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {axes.map((axis, i) => (
                <tr
                  key={axis.name}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  data-hovered={hovered === i ? "" : undefined}
                >
                  <th scope="row">{axis.name}</th>
                  {players.map((p) => (
                    <td key={p.slug}>{values(p)[i]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className={styles.note}>
        EA FC26 ratings · Avatars: PES 6 faces, kits and idle motion
      </p>
    </div>
  );
}
