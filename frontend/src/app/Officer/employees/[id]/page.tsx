"use client";

import { use } from "react";
import NewEmployeePage from "../new/page";

export default function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <NewEmployeePage employeeId={id} />;
}
