const stats = [
  ["24+", "active employees"],
  ["99.9%", "payroll accuracy"],
  ["48h", "faster approvals"],
  ["100%", "role-based access"],
];

export default function TrustedBy() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Trusted payroll operations, made simple
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="border-l border-slate-200 px-5 first:border-l-0"
            >
              <p className="text-3xl font-bold text-[#165c55]">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
