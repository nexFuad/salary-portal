export default function Hero() {
  return (
    <section id="home" className="scroll-mt-20 overflow-hidden bg-[#f5f8f7]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#b47a1f]">
            Built for better payroll
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
            Payroll that keeps your people moving.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Manage employees, approve salaries, and keep every payroll decision
            clear in one secure workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/Login"
              className="rounded-lg bg-[#165c55] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#104943]"
            >
              Get started
            </a>
            <a
              href="#preview"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-[#165c55] hover:text-[#165c55]"
            >
              View dashboard
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(22,92,85,0.12)] sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <p className="text-sm text-slate-500">
                This month&apos;s payroll
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-800">$176,681</p>
            </div>
            <span className="rounded-full bg-[#e4f0ed] px-3 py-1.5 text-xs font-bold text-[#165c55]">
              On track
            </span>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              ["24", "Employees"],
              ["7", "Approvals"],
              ["0", "Overdue"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-[#f5f8f7] p-4">
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex h-28 items-end gap-3 border-b border-slate-200 pb-2">
            {[54, 67, 61, 74, 82, 92].map((height, index) => (
              <div
                key={height}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={`w-full rounded-t-md ${index === 5 ? "bg-[#165c55]" : "bg-[#c7d8d5]"}`}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
