type AsideProps = {
  kicker?: string;
  children: React.ReactNode;
};

// No fill, no icon, no rounded corner — the 4px left bar comes from
// `.prose-site aside`.
export function Aside({ kicker, children }: AsideProps) {
  return (
    <aside>
      {kicker ? <p className="aside-kicker text-label">{kicker}</p> : null}
      {children}
    </aside>
  );
}
