export default function CtaSection() {
  return (
    <section id="contact" className="bg-[#2f766d] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f2c86b]">
          Ready when you are
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          A calmer way to run payroll.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
          Bring your team, salaries, and approvals into one focused workflow.
        </p>
        <a
          href="/Login"
          className="mt-9 inline-flex rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#165c55] transition hover:bg-[#f2c86b] hover:text-slate-900"
        >
          Go to sign in
        </a>
      </div>
    </section>
  );
}
