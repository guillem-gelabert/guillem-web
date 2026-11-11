"use client";

import { useEffect, useRef, useState } from "react";
import data from "./players.json";
import type { Stage } from "./avatar-stage";
import { Flag, nationName } from "./flag";
import styles from "./player-radar.module.css";

type Player = (typeof data.players)[number];

// The six headline ratings, clockwise from the top, as FC26 orders them.
const AXES = [
  { short: "PAC", name: "Pace" },
  { short: "SHO", name: "Shooting" },
  { short: "PAS", name: "Passing" },
  { short: "DRI", name: "Dribbling" },
  { short: "DEF", name: "Defending" },
  { short: "PHY", name: "Physical" },
];

// Left player pink, right player blue, as on the game's comparison screen.
const SIDES = [
  { colour: "var(--left)", label: "Left player" },
  { colour: "var(--right)", label: "Right player" },
] as const;

const DEFAULTS: [string, string] = ["deu-wirtz", "nld-dijk"];
const SCALE = 99;
const SIZE = 300;
const C = SIZE / 2;
const R = 100;
// the radar-grid sprite's height in viewBox units: corner to corner, plus its rim
const GRID_H = 2 * R + 8;

const bySlug = new Map(data.players.map((p) => [p.slug, p]));
const sorted = [...data.players].sort((a, b) => a.name.localeCompare(b.name));
// "F. Wirtz", as the game abbreviates its names; one-word names stay whole
const short = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first[0]}. ${rest.join(" ")}` : first;
};
const surname = (p: Player) => p.name.split(" ").slice(1).join(" ") || p.name;

function at(i: number, value: number): [number, number] {
  const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
  const r = (value / SCALE) * R;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
}

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
      <div className={styles.cardRow}>
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
      <div className={styles.cardRow}>
        <span className={styles.flagFrame}>
          <Flag nation={player.nation} className={styles.flag} />
        </span>
        <span className={styles.nation}>{nationName(player.nation)}</span>
      </div>
    </section>
  );
}

/**
 * Interactive 5: the shape of a footballer, set as a PES 6 comparison
 * screen. Two players either side of a radar of their six headline EA FC26
 * ratings on a common 0–99 scale, each standing as their PES 6 avatar.
 * Hovering an axis shows both numbers; a screen reader gets them as a table.
 */
export function PlayerRadar() {
  const [slugs, setSlugs] = useState<[string, string]>(DEFAULTS);
  const strip = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);

  const players = slugs.map((s) => bySlug.get(s)!) as [Player, Player];

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

  return (
    // a div, not a figure: the prose layer frames and spaces every figure
    <div className={`player-radar not-prose ${styles.figure}`}>
      <div className={styles.root} role="group" aria-label="Player comparison" data-testid="player-radar">
        <div className={styles.titleBar} aria-hidden="true">
          <div className={styles.title} />
        </div>

        <div className={styles.pitch}>
          <div ref={strip} className={styles.stage} aria-hidden="true">
            <canvas ref={canvas} className={styles.canvas} data-testid="avatar-canvas" />
          </div>

          <svg
            className={styles.radar}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`Six headline ratings for ${players[0].name} and ${players[1].name}, on a 0 to 99 scale`}
            data-testid="radar"
          >
            <image
              href="/figures/what-are-embeddings/pes-ui/radar-grid.webp"
              x={C - (GRID_H * 145) / 173 / 2}
              y={C - GRID_H / 2}
              width={(GRID_H * 145) / 173}
              height={GRID_H}
            />
            {players.map((p, k) => (
              <polygon
                key={p.slug}
                points={p.headline.map((v, i) => at(i, v).join(",")).join(" ")}
                className={styles.radarShape}
                style={{ fill: SIDES[k].colour, stroke: SIDES[k].colour }}
                data-testid="series"
              />
            ))}
            {AXES.map((axis, i) => {
              const [x, y] = at(i, 128);
              return (
                <text key={axis.name} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={styles.radarLabel}>
                  <title>{`${axis.name}: ${surname(players[0])} ${players[0].headline[i]}, ${surname(players[1])} ${players[1].headline[i]}`}</title>
                  {axis.short}
                </text>
              );
            })}
          </svg>

          <div className={styles.cards}>
            <Card side={0} player={players[0]} other={players[1]} onPick={(s) => pick(0, s)} />
            <Card side={1} player={players[1]} other={players[0]} onPick={(s) => pick(1, s)} />
          </div>

          <table className={styles.srOnly} data-testid="ratings">
            <caption>EA FC26 headline ratings, 0 to 99</caption>
            <thead>
              <tr>
                <th scope="col">Rating</th>
                <th scope="col">{players[0].name}</th>
                <th scope="col">{players[1].name}</th>
              </tr>
            </thead>
            <tbody>
              {AXES.map((axis, i) => (
                <tr key={axis.name}>
                  <th scope="row">{axis.name}</th>
                  <td>{players[0].headline[i]}</td>
                  <td>{players[1].headline[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.caption}>
        EA FC26 headline ratings, 0–99. Hover an axis for both numbers. Avatars from PES 6.
      </div>
    </div>
  );
}
