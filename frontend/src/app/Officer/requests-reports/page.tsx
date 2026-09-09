"use client";

import { useState } from "react";
import AttendanceRecords from "@/Components/Officer/RequestsReports/Attendance/AttendanceRecords";
import DocumentsList from "@/Components/Officer/RequestsReports/Documents/DocumentsList";
import LeaveRequests from "@/Components/Officer/RequestsReports/Leave/LeaveRequests";
import LoansList from "@/Components/Officer/RequestsReports/Loans/LoansList";
import SalaryAdvanceRequests from "@/Components/Officer/RequestsReports/SalaryAdvance/SalaryAdvanceRequests";

const tabs = [
  { id: "leave", label: "Leave", component: LeaveRequests },
  { id: "attendance", label: "Attendance", component: AttendanceRecords },
  {
    id: "salary-advance",
    label: "Salary advance",
    component: SalaryAdvanceRequests,
  },
  { id: "loans", label: "Loans", component: LoansList },
  { id: "documents", label: "Documents", component: DocumentsList },
] as const;

export default function RequestsReportsPage() {
  const [activeTabId, setActiveTabId] =
    useState<(typeof tabs)[number]["id"]>("leave");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const ActiveComponent = activeTab.component;

  return (
    <section className="min-w-0">
      <div className="border-b border-[#e5ebea] bg-white px-4 py-5 sm:px-6 lg:px-9 lg:py-6">
        <p className="text-xs text-[#849099]">
          SalaryFlow <span className="mx-2 text-[#a7afb5]">›</span>{" "}
          <span className="font-semibold text-[#4b5760]">
            Requests &amp; Reports
          </span>
        </p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.035em] text-[#202b35]">
          Requests &amp; Reports
        </h1>
      </div>

      <div className="overflow-x-auto border-b border-[#e5ebea] bg-white">
        <div
          role="tablist"
          aria-label="Requests and reports sections"
          className="flex min-w-max px-4 sm:px-7"
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTabId(tab.id)}
                className={`border-b-[3px] px-4 py-4 text-[15px] font-semibold transition sm:px-5 ${
                  isActive
                    ? "border-[#23665f] text-[#23665f]"
                    : "border-transparent text-[#66727b] hover:text-[#23665f]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="min-h-[calc(100vh-235px)] bg-[#f7f9f9]">
        <ActiveComponent />
      </div>
    </section>
  );
}
