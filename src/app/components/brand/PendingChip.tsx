export function PendingChip({ label }: { label: string }) {
  return (
    <mark className="inline-block rounded border border-dashed border-accent bg-transparent px-1.5 py-0.5 text-sm font-medium text-accent">
      [PENDING: {label}]
    </mark>
  );
}
