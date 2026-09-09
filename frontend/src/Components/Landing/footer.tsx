export default function Footer() {
  return (
    <footer className="bg-[#103f3b] text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.45fr_.8fr_.8fr_1.1fr]">
        <div>
          <a
            href="#home"
            className="flex items-center gap-3"
            aria-label="SalaryFlow home"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#e4f0ed] text-sm font-bold text-[#165c55]">
              SF
            </span>
            <span className="text-xl font-semibold text-white">SalaryFlow</span>
          </a>
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
            A focused payroll workspace for teams that value clarity, accuracy,
            and control.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Product
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <a href="#home" className="block transition hover:text-[#f2c86b]">
              Home
            </a>
            <a href="#roles" className="block transition hover:text-[#f2c86b]">
              Roles
            </a>
            <a
              href="#preview"
              className="block transition hover:text-[#f2c86b]"
            >
              Dashboard
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Company
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <a href="#roles" className="block transition hover:text-[#f2c86b]">
              About us
            </a>
            <a
              href="#contact"
              className="block transition hover:text-[#f2c86b]"
            >
              Contact
            </a>
            <a href="/Login" className="block transition hover:text-[#f2c86b]">
              Sign in
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Contact
          </h2>
          <address className="mt-5 space-y-3 text-sm not-italic leading-6">
            <a
              href="mailto:support@salaryflow.com"
              className="block transition hover:text-[#f2c86b]"
            >
              support@salaryflow.com
            </a>
            <a
              href="tel:+8801700000000"
              className="block transition hover:text-[#f2c86b]"
            >
              +880 1700 000 000
            </a>
            <p>Dhaka, Bangladesh</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 SalaryFlow. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#home" className="hover:text-white">
              Privacy
            </a>
            <a href="#home" className="hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
