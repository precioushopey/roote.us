export function ArcMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute"
      viewBox="0 0 200 200"
      width={200}
      height={200}
      style={{ opacity: 0.3 }}
    >
      <circle cx="100" cy="100" r="40" stroke="var(--accent)" strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="70" stroke="var(--accent)" strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="100" stroke="var(--accent)" strokeWidth="1" fill="none" />
    </svg>
  );
}
