'use client';
import { mockReports } from "@/data/mockReports";
import { mockPatient } from "@/data/mockPatient";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { FaPrint } from "react-icons/fa";

interface Report {
  reportId: number;
  testName: string;
  testCategory: string;
  labId: number;
  referenceDescription: string;
  referenceRange: string;
  enteredValue: string;
  unit: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

const A4_WIDTH = 210;
const A4_HEIGHT = 297;

const ReportView = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const reportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const viewPatient = mockPatient;
  const currentLab = { name: "Nextjen Diagnostics", id: "1" };

  useEffect(() => {
    setLoading(true);
    try {
      setReports(mockReports.data as unknown as Report[]);
    } finally {
      setLoading(false);
    }
  }, []);

  const printAllReports = async () => {
  setPrinting(true);
  try {
    console.log("Starting PDF generation...");
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Hide buttons before capturing
    const buttons = document.querySelectorAll('.print-hide');
    buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

    for (let i = 0; i < reportRefs.current.length; i++) {
      const page = reportRefs.current[i];
      if (!page) continue;

      console.log(`Processing page ${i + 1}`);

      // Clone the page and append to body
      const clone = page.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '210mm';
      clone.style.height = '297mm';
      clone.style.background = 'white';
      document.body.appendChild(clone);

      // Wait a tick to ensure styles apply
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
  useCORS: true,
  logging: true,
  allowTaint: true,
  background: '#ffffff',
  scale: window.devicePixelRatio || 1,
} as any);

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = A4_WIDTH - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) pdf.addPage();

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      console.log(`Page ${i + 1} added to PDF`);
    }

    // Restore buttons visibility
    buttons.forEach(btn => (btn as HTMLElement).style.display = '');

    const filename = `${viewPatient?.patientname || 'report'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
    console.log("PDF saved:", filename);

  } catch (error) {
    console.error('Print error:', error);
    alert('Failed to generate PDF. Please check console for details.');
  } finally {
    setPrinting(false);
  }
};


  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading report data...</p>
      </div>
    </div>
  );

  const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
    if (!acc[report.testName]) {
      acc[report.testName] = [];
    }
    acc[report.testName].push(report);
    return acc;
  }, {});

  function calculateAge(dateOfBirth: string): string {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age.toString();
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Blurred background overlay */}
      <div className="fixed inset-0 bg-[url('/Tiameds.png')] bg-cover bg-center blur-sm opacity-20 -z-10"></div>
      
      {/* Main content container */}
      <div className="container mx-auto py-8 px-4">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4 print:hidden bg-white p-4 rounded-lg shadow-sm print-hide">
          <div className="text-sm text-gray-600">
            {Object.keys(groupedReports).length} page report
          </div>
          <div className="flex gap-2">
            <button
              onClick={printAllReports}
              disabled={printing}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {printing ? (
                <span className="animate-spin">↻</span>
              ) : (
                <>
                  <FaPrint className="text-lg" />
                  Print All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Pages Container */}
        <div className="flex flex-col items-center">
          {Object.entries(groupedReports).map(([testName, testResults], index) => (
            <div
              key={index}
              ref={el => { reportRefs.current[index] = el; }}
              className="bg-white p-8 border border-gray-200 rounded-lg mb-6 flex flex-col shadow-lg print:shadow-none print:border-0 relative"
              style={{
                width: '210mm',
                minHeight: '297mm',
                boxSizing: 'border-box'
              }}
            >
              {/* Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-20 print:opacity-40 bg-opacity-20">
  <img src="/bloodbank.png" alt="Watermark" className="w-2/3 max-w-xs md:max-w-md lg:max-w-lg object-contain" />
</div>



              {/* Header */}
              <div className="flex justify-between items-start border-b border-purple-100 pb-6 mb-6 relative z-10">
                <div className="flex items-center">
                  <img src="/bloodbank.png" alt="Lab Logo" className="h-14 mr-4 print:h-12" />
                  <div>
                    <h1 className="text-2xl font-bold text-purple-800 print:text-xl">{currentLab?.name || ''}</h1>
                    <p className="text-xs text-gray-600 mt-1 print:text-[10px]">Accredited by NABL | ISO 15189:2012 Certified</p>
                  </div>
                </div>
                <div className="text-right bg-purple-50 p-3 rounded-lg print:p-2">
                  <p className="text-xs font-medium text-purple-700 print:text-[10px]">Report ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
                  <p className="text-xs font-medium text-purple-700 print:text-[10px]">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
                  <p className="text-xs font-medium text-purple-700 mt-1 print:text-[10px]">Page: {index + 1}/{Object.keys(groupedReports).length}</p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-4 gap-4 mb-6 bg-purple-50 p-4 rounded-lg border border-blue-100 text-sm print:p-2 print:text-xs relative z-10">
                {/* Patient Name & Contact */}
                <div className="space-y-1">
                  <p className="font-medium text-purple-700">Patient Name</p>
                  <p className="font-semibold text-gray-800">{viewPatient?.patientname || 'N/A'}</p>
                  <p className="font-semibold text-gray-800 text-xs">{viewPatient?.contactNumber || 'N/A'}</p>
                </div>

                {/* Demographics */}
                <div className="space-y-1">
                  <p className="font-medium text-purple-700">Age /Gender</p>
                  <div className="flex gap-2">
                    <p className="font-semibold text-gray-800">{calculateAge(viewPatient?.dateOfBirth ?? '') || 'N/A'}</p>
                    <span className="text-gray-400">|</span>
                    <p className="font-semibold text-gray-800">{viewPatient?.gender || 'N/A'}</p>
                  </div>
                </div>

                {/* Physician Info */}
                <div className="space-y-1">
                  <p className="font-medium text-purple-700">Referred By</p>
                  <p className="font-semibold text-gray-800">DR. SELF</p>
                </div>

                {/* Status & Visit Info */}
                <div className="space-y-1">
                  <div>
                    <p className="font-medium text-purple-700">Status</p>
                    <p className="font-semibold text-gray-800 text-xs">Patient ID: {viewPatient?.visitId || 'N/A'}</p>
                    <p className="font-semibold text-gray-800 text-xs">Patient Status: {viewPatient?.visitStatus || 'N/A'}</p>
                    <p className="font-semibold text-gray-800 text-xs">Patient Type: {viewPatient?.visitType || 'N/A'}</p>
                    <p className="font-semibold text-gray-800 text-xs">Visit Date: {viewPatient?.visitDate || 'N/A'}</p>
                  </div>
                  
                  {viewPatient?.sampleNames?.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-600">Samples:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewPatient.sampleNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="bg-white px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-800 text-xs"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Header */}
              <div className="mb-6 relative z-10">
                <h2 className="text-xl font-bold text-purple-800 mb-2 print:text-lg">{testName}</h2>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-blue-100 rounded-full"></div>
              </div>

              {/* Test Results */}
              <div className="mb-8 flex-grow relative z-10">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="bg-purple-600 text-white">
                      <th className="text-left p-3 font-medium print:p-2">Parameter</th>
                      <th className="text-left p-3 font-medium print:p-2">Value</th>
                      <th className="text-left p-3 font-medium print:p-2">Unit</th>
                      <th className="text-left p-3 font-medium print:p-2">Reference Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((param, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                        <td className="p-3 border-b border-gray-100 font-medium text-black print:p-2">{param.referenceDescription}</td>
                        <td className="p-3 border-b border-gray-100 font-bold text-black print:p-2">{param.enteredValue}</td>
                        <td className="p-3 border-b border-gray-100 text-black print:p-2">{param.unit}</td>
                        <td className="p-3 border-b border-gray-100 text-black print:p-2">{param.referenceRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-6 border-gray-200 print:pt-4 relative z-10">
                <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 print:pt-2">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 mb-2 print:text-[10px]">Lab Technician</p>
                    <div className="h-12 border-t border-gray-300 flex items-center justify-center print:h-8">
                      <span className="text-xs text-gray-500 print:text-[10px]">Signature/Stamp</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 mb-2 print:text-[10px]">Verified By</p>
                    <div className="h-12 border-t border-gray-300 flex items-center justify-center print:h-8">
                      <span className="text-xs text-gray-500 print:text-[10px]">Signature/Stamp</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 mb-2 print:text-[10px]">Authorized Pathologist</p>
                    <div className="h-12 border-t border-gray-300 flex items-center justify-center print:h-8">
                      <span className="text-xs text-gray-500 print:text-[10px]">Dr. Signature/Stamp</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center print:mt-2">
                  <p className="text-xs text-gray-600 mb-1 print:text-[10px]">This is an electronically generated report. No physical signature required.</p>
                  <p className="text-xs text-gray-600 print:text-[10px]">For queries: help@nextjen.com | +91 98765 43210 | www.nextjendl.com</p>
                  <p className="text-xs font-medium text-purple-600 mt-2 print:text-[10px]">Thank you for choosing NEXTJEN DIAGNOSTICS</p>
                </div>
              </div>

              {/* Footer divider */}
              <div className="flex justify-between items-center mt-4 print:mt-2 relative z-10">
                <div className="flex items-center">
                  <img src="/Tiameds.png" alt="Tiamed Logo" className="h-6 mr-2 opacity-80 print:h-4" />
                  <span className="text-xs font-medium text-gray-600 print:text-[10px]">Powered by Tiameds Technology</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 print:text-[10px]">Generated on: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportView;