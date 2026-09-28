type OfficerHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function OfficerHeader({ title, subtitle }: OfficerHeaderProps) {
  return (
    <header className="border-b border-[#e5ebea] bg-white px-4 py-5 sm:px-6 lg:px-9 lg:py-6">
      <p className="text-xs text-[#849099]">
        SalaryFlow <span className="mx-2 text-[#a7afb5]">›</span>{" "}
        <span className="font-semibold text-[#4b5760]">{title}</span>
      </p>
      <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.035em] text-[#202b35]">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-[15px] text-[#77838d]">{subtitle}</p>}
    </header>
  );
}
