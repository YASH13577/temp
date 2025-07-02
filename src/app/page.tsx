"use client";

import ReportView from "@/components/ReportView";

const ReportPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-800 print:hidden">
        Lab Report Viewer (Mock Data)
      </h1>
      <ReportView />
    </div>
  );
};

export default ReportPage;
