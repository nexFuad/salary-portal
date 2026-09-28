import { redirect } from "next/navigation";

export default async function EmployeeDetailsPage({
  params,
}: PageProps<"/Officer/employees/[id]">) {
  const { id } = await params;
  redirect(`/Officer/employees/new?employeeId=${encodeURIComponent(id)}`);
}
