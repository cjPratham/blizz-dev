import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ClassReport = () => {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/teacher/classes/${classId}/attendance`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch class report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [classId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Export to Excel
  const exportExcel = () => {
    const worksheetData = data.report.map((s) => ({
      "Student Name": s.studentName,
      Present: s.presentCount,
      Absent: s.absentCount,
      "Total Sessions": s.totalSessions,
      "% Attendance": s.attendancePercentage,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `${data.className}_Attendance_Report.xlsx`);
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${data.className} - Attendance Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Subject: ${data.subject}`, 14, 28);
    doc.text(`Teacher: ${data.teacherName}`, 14, 36);
    doc.text(`Total Sessions: ${data.totalSessions}`, 14, 44);

    const tableColumn = ["Student Name", "Present", "Absent", "Total Sessions", "% Attendance"];
    const tableRows = data.report.map((s) => [
      s.studentName,
      s.presentCount,
      s.absentCount,
      s.totalSessions,
      s.attendancePercentage,
    ]);

    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [88, 28, 135] }, // Blizz purple
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`${data.className}_Attendance_Report.pdf`);
  };

  return (
    <div className="p-4 md:p-6">
  {/* Class Header */}
  <div className="bg-purple-50 rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-700">
    <h2 className="text-3xl font-bold mb-2 text-purple-800">{data.className}</h2>
    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-gray-700">
      <p className="text-lg"><span className="font-semibold">Subject:</span> {data.subject}</p>
      <p className="text-lg"><span className="font-semibold">Teacher:</span> {data.teacherName}</p>
      <p className="text-lg"><span className="font-semibold">Total Sessions:</span> {data.totalSessions}</p>
    </div>
  </div>

  {/* Download Buttons */}
  <div className="flex flex-col sm:flex-row gap-2 mb-4">
    <button
      onClick={exportExcel}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-md transition"
    >
      Download Excel
    </button>
    <button
      onClick={exportPDF}
      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-md transition"
    >
      Download PDF
    </button>
  </div>

  {/* Attendance Table */}
  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-300 text-sm md:text-base">
      <thead className="bg-purple-100">
        <tr>
          <th className="border px-3 py-2">Student Name</th>
          <th className="border px-3 py-2">Present</th>
          <th className="border px-3 py-2">Absent</th>
          <th className="border px-3 py-2">Total Sessions</th>
          <th className="border px-3 py-2">% Attendance</th>
        </tr>
      </thead>
      <tbody>
        {data.report.map((s) => (
          <tr key={s.studentId} className="hover:bg-gray-50">
            <td className="border px-3 py-2">{s.studentName}</td>
            <td className="border px-3 py-2">{s.presentCount}</td>
            <td className="border px-3 py-2">{s.absentCount}</td>
            <td className="border px-3 py-2">{s.totalSessions}</td>
            <td className="border px-3 py-2">{s.attendancePercentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};

export default ClassReport;