interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-coffee-dark">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}
