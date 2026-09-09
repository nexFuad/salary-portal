const cards = [
  ["Total employees", "24", "20 active"],
  ["This month's payroll", "$176,681", "September 2026"],
  ["Pending payroll", "7", "awaiting action"],
  ["Paid payroll", "0", "this month"],
];

export default function DashboardPreview() {
  return (
    <section id="preview" className="bg-[#eff5f3] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b47a1f]">
              One clear dashboard
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              See the work that matters, instantly.
            </h2>
          </div>
          <a
            href="/Login"
            className="text-sm font-bold text-[#165c55] hover:underline"
          >
            Sign in to explore
          </a>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faf9] shadow-[0_20px_55px_rgba(22,92,85,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-lg bg-[#165c55] text-xs font-bold text-white">
                SF
              </span>
              <span className="font-semibold text-slate-800">Dashboard</span>
            </div>
            <span className="text-sm text-slate-500">September 2026</span>
          </div>
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[170px_1fr]">
            <aside className="hidden rounded-xl bg-[#165c55] p-5 text-sm text-white lg:block">
              <p className="mb-7 text-lg font-semibold">SalaryFlow</p>
              <div className="space-y-4 text-white/75">
                <p className="font-semibold text-white">Dashboard</p>
                <p>Employees</p>
                <p>Payroll</p>
                <p>Requests</p>
                <p>Reports</p>
              </div>
            </aside>
            <div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value, note]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-3 text-2xl font-bold text-slate-800">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#4c8377]">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">
                    Monthly salary expense
                  </p>
                  <p className="text-sm text-slate-500">Last 6 months</p>
                </div>
                <div className="mt-8 flex h-32 items-end gap-3 border-b border-slate-200 pb-2">
                  {[48, 62, 58, 70, 78, 88].map((height, index) => (
                    <div
                      key={height}
                      className={`flex-1 rounded-t-md ${index === 5 ? "bg-[#165c55]" : "bg-[#c7d8d5]"}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
