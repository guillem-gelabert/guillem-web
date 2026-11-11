"use client";

import { useEffect, useRef, useState } from "react";
import data from "./players.json";
import type { Stage } from "./avatar-stage";
import { Flag } from "./flag";
import styles from "./player-radar.module.css";

type Player = (typeof data.players)[number];

const HEADLINE = [
  { short: "PAC", name: "Pace" },
  { short: "SHO", name: "Shooting" },
  { short: "PAS", name: "Passing" },
  { short: "DRI", name: "Dribbling" },
  { short: "DEF", name: "Defending" },
  { short: "PHY", name: "Physical" },
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

// Left player pink, right player blue, as on the game's comparison screen.
const SIDES = [
  { colour: "var(--left)", label: "Left player" },
  { colour: "var(--right)", label: "Right player" },
] as const;

const DEFAULTS: [string, string] = ["deu-wirtz", "nld-dijk"];
const SCALE = 99;
const SIZE = 200;
const C = SIZE / 2;
const R = 70;
const RINGS = [20, 40, 60, 80];

const bySlug = new Map(data.players.map((p) => [p.slug, p]));
const sorted = [...data.players].sort((a, b) => a.name.localeCompare(b.name));
// "F. Wirtz", as the game abbreviates its names; one-word names stay whole
const short = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first[0]}. ${rest.join(" ")}` : first;
};

function at(i: number, n: number, value: number): [number, number] {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  const r = (value / SCALE) * R;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
}
const ring = (n: number, value: number) =>
  Array.from({ length: n }, (_, i) => at(i, n, value).join(",")).join(" ");

function Card({
  side,
  player,
  other,
  onPick,
}: {
  side: 0 | 1;
  player: Player;
  other: Player;
  onPick: (slug: string) => void;
}) {
  return (
    <section className={styles.card} data-side={side} aria-label={SIDES[side].label}>
      <div className={styles.cardHead}>
        <span className={styles.badge} title={`Position: ${player.position}`}>
          {player.position}
        </span>
        <span className={styles.shirt} aria-hidden="true">
          {player.shirt}
        </span>
        <select
          aria-label={SIDES[side].label}
          value={player.slug}
          onChange={(e) => onPick(e.target.value)}
          data-testid={`player-${side}`}
        >
          {sorted.map((o) => (
            <option key={o.slug} value={o.slug} disabled={o.slug === other.slug}>
              {short(o.name)}
            </option>
          ))}
        </select>
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>Height</dt>
          <dd>{player.height} cm</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{player.age}</dd>
        </div>
        <div>
          <dt>Nationality</dt>
          <dd>
            <Flag nation={player.nation} className={styles.flag} />
          </dd>
        </div>
        <div>
          <dt>Foot</dt>
          <dd>{player.foot}</dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * Interactive 5: the shape of a footballer, set as a PES 6 comparison
 * screen. Two players, their EA FC26 ratings on a common 0–99 scale, six
 * headline numbers or all 29 search attributes, with each player standing
 * beside their card as their PES 6 avatar. The bars carry every number, so
 * the polygon never has to be read as a score.
 */
export function PlayerRadar() {
  const [slugs, setSlugs] = useState<[string, string]>(DEFAULTS);
  const [detailed, setDetailed] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);

  const players = slugs.map((s) => bySlug.get(s)!) as [Player, Player];
  const axes = detailed ? DETAILED_AXES : HEADLINE;
  const n = axes.length;
  const values = (p: Player) => (detailed ? p.detailed : p.headline);

  const roster = (list: Player[]) => list.map((p) => ({ key: p.slug, assets: p.assets }));
  const latest = useRef(players);
  useEffect(() => {
    latest.current = players;
  });

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

  const pick = (side: 0 | 1, slug: string) =>
    setSlugs((s) => (side === 0 ? [slug, s[1]] : [s[0], slug]));

  const title = `${detailed ? "29 detailed attributes" : "Six headline ratings"} for ${players[0].name} and ${players[1].name}, on a 0 to 99 scale`;

  return (
    <div
      className={`player-radar not-prose ${styles.root}`}
      role="group"
      aria-label="Player comparison"
      data-testid="player-radar"
      data-detailed={detailed ? "" : undefined}
    >
      <div className={styles.titleBar} aria-hidden="true">
        <span>Player Comparison</span>
      </div>

      <div className={styles.pitch}>
        <div ref={strip} className={styles.stage} aria-hidden="true">
          <canvas ref={canvas} className={styles.canvas} data-testid="avatar-canvas" />
        </div>

        <div className={styles.layout}>
          <Card side={0} player={players[0]} other={players[1]} onPick={(s) => pick(0, s)} />

          <svg className={styles.radar} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title} data-testid="radar">
            <polygon points={ring(n, SCALE)} className={styles.radarPlate} />
            {RINGS.map((r) => (
              <polygon key={r} points={ring(n, r)} className={styles.radarRing} />
            ))}
            {axes.map((axis, i) => {
              const [x, y] = at(i, n, SCALE);
              return (
                <line
                  key={axis.name}
                  x1={C}
                  y1={C}
                  x2={x}
                  y2={y}
                  className={styles.radarSpoke}
                  data-hovered={hovered === i ? "" : undefined}
                />
              );
            })}
            {players.map((p, k) => (
              <polygon
                key={p.slug}
                points={values(p).map((v, i) => at(i, n, v).join(",")).join(" ")}
                className={styles.radarShape}
                style={{ fill: SIDES[k].colour, stroke: SIDES[k].colour }}
                data-testid="series"
              />
            ))}
            {axes.map((axis, i) => {
              const [x, y] = at(i, n, detailed ? 112 : 118);
              return (
                <text
                  key={axis.name}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.radarLabel}
                  data-hovered={hovered === i ? "" : undefined}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {axis.short}
                </text>
              );
            })}
          </svg>

          <Card side={1} player={players[1]} other={players[0]} onPick={(s) => pick(1, s)} />

          <div className={styles.barsPanel}>
            <table className={styles.bars} data-testid="ratings">
              <caption className={styles.srOnly}>EA FC26 ratings, 0 to 99</caption>
              <thead className={styles.srOnly}>
                <tr>
                  <th scope="col">{players[0].name}</th>
                  <td />
                  <th scope="col">Rating</th>
                  <td />
                  <th scope="col">{players[1].name}</th>
                </tr>
              </thead>
              <tbody>
                {axes.map((axis, i) => {
                  const [a, b] = players.map((p) => values(p)[i]);
                  return (
                    <tr
                      key={axis.name}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      data-hovered={hovered === i ? "" : undefined}
                    >
                      <td className={styles.value}>{a}</td>
                      <td className={`${styles.track} ${styles.trackLeft}`} aria-hidden="true">
                        <span className={styles.bar} style={{ width: `${(a / SCALE) * 100}%` }} />
                      </td>
                      <th scope="row" className={styles.label}>
                        {axis.name}
                      </th>
                      <td className={`${styles.track} ${styles.trackRight}`} aria-hidden="true">
                        <span className={styles.bar} style={{ width: `${(b / SCALE) * 100}%` }} />
                      </td>
                      <td className={styles.value}>{b}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" onClick={() => setDetailed(false)} disabled={!detailed} data-testid="view-6">
          <span className={styles.circle} aria-hidden="true" />
          Back
        </button>
        <button type="button" onClick={() => setDetailed(true)} aria-pressed={detailed} data-testid="view-29">
          <span className={styles.cross} aria-hidden="true" />
          Player details
        </button>
        <span className={styles.note}>EA FC26 ratings · ages on 19 Sep 2025 · PES 6 avatars</span>
      </div>
    </div>
  );
}
