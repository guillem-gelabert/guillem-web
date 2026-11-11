import type { ReactNode } from "react";

// Simplified flags for the pool's nations, 3:2, no coats of arms: at 30 px
// wide they would be a smudge. England is the St George's cross, as the
// team plays under it.
const H = ({ c }: { c: string[] }) => (
  <>
    {c.map((fill, i) => (
      <rect key={i} x={0} y={(20 / c.length) * i} width={30} height={20 / c.length} fill={fill} />
    ))}
  </>
);
const V = ({ c }: { c: string[] }) => (
  <>
    {c.map((fill, i) => (
      <rect key={i} x={(30 / c.length) * i} y={0} width={30 / c.length} height={20} fill={fill} />
    ))}
  </>
);

const FLAGS: Record<string, { name: string; draw: ReactNode }> = {
  DEU: { name: "Germany", draw: <H c={["#000", "#dd0000", "#ffce00"]} /> },
  NLD: { name: "Netherlands", draw: <H c={["#ae1c28", "#fff", "#21468b"]} /> },
  FRA: { name: "France", draw: <V c={["#002395", "#fff", "#ed2939"]} /> },
  ESP: {
    name: "Spain",
    draw: (
      <>
        <rect width={30} height={20} fill="#aa151b" />
        <rect y={5} width={30} height={10} fill="#f1bf00" />
      </>
    ),
  },
  ENG: {
    name: "England",
    draw: (
      <>
        <rect width={30} height={20} fill="#fff" />
        <rect x={12.5} width={5} height={20} fill="#ce1124" />
        <rect y={7.5} width={30} height={5} fill="#ce1124" />
      </>
    ),
  },
  HRV: { name: "Croatia", draw: <H c={["#ff0000", "#fff", "#171796"]} /> },
  PRT: {
    name: "Portugal",
    draw: (
      <>
        <rect width={30} height={20} fill="#da291c" />
        <rect width={12} height={20} fill="#046a38" />
      </>
    ),
  },
  MAR: {
    name: "Morocco",
    draw: (
      <>
        <rect width={30} height={20} fill="#c1272d" />
        <path d="M15 5.5 17.6 13.6 10.7 8.6H19.3L12.4 13.6Z" fill="none" stroke="#006233" strokeWidth={1} />
      </>
    ),
  },
  NOR: {
    name: "Norway",
    draw: (
      <>
        <rect width={30} height={20} fill="#ba0c2f" />
        <rect x={8} width={6} height={20} fill="#fff" />
        <rect y={7} width={30} height={6} fill="#fff" />
        <rect x={9.5} width={3} height={20} fill="#00205b" />
        <rect y={8.5} width={30} height={3} fill="#00205b" />
      </>
    ),
  },
  EGY: { name: "Egypt", draw: <H c={["#ce1126", "#fff", "#000"]} /> },
  ARG: { name: "Argentina", draw: <H c={["#74acdf", "#fff", "#74acdf"]} /> },
  BRA: {
    name: "Brazil",
    draw: (
      <>
        <rect width={30} height={20} fill="#009c3b" />
        <path d="M15 2.5 27.5 10 15 17.5 2.5 10Z" fill="#ffdf00" />
        <circle cx={15} cy={10} r={4.2} fill="#002776" />
      </>
    ),
  },
};

export const nationName = (nation: string) => FLAGS[nation]?.name ?? nation;

export function Flag({ nation, className }: { nation: string; className?: string }) {
  const flag = FLAGS[nation];
  if (!flag) return <span className={className}>{nation}</span>;
  return (
    <svg className={className} viewBox="0 0 30 20" role="img" aria-label={flag.name}>
      <title>{flag.name}</title>
      {flag.draw}
    </svg>
  );
}
