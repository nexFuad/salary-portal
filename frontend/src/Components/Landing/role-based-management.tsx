const roles = [
  {
    title: "Officer workspace",
    text: "Manage employee records, prepare salary details, and track requests with confidence.",
    label: "Employee & payroll operations",
  },
  {
    title: "OM workspace",
    text: "Review payroll activity, approve decisions, and monitor your organisation at a glance.",
    label: "Approvals & oversight",
  },
];

export default function RoleBasedManagement() {
  return (
    <section id="roles" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b47a1f]">
            Role-based management
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            The right view for every responsibility.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {roles.map((role, index) => (
            <article
              key={role.title}
              className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:border-[#165c55] hover:shadow-lg"
            >
              <span className="inline-flex rounded-full bg-[#e4f0ed] px-3 py-1 text-xs font-bold text-[#165c55]">
                0{index + 1}
              </span>
              <h3 className="mt-6 text-2xl font-semibold text-slate-800">
                {role.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">{role.text}</p>
              <p className="mt-7 border-t border-slate-100 pt-5 text-sm font-semibold text-[#165c55]">
                {role.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
