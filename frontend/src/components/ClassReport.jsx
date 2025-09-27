import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ClassReport = () => {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [showDetailed, setShowDetailed] = useState(false);
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

  const fetchDetailedReport = async () => {
    if (detailedData) {
      setShowDetailed((prev) => !prev); // toggle
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/teacher/classes/${classId}/detailed-attendance`);
      setDetailedData(res.data);
      setShowDetailed(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch detailed report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Summary Excel export
  const exportExcel = () => {
    const exportData = showDetailed
      ? detailedData.report.map((s) => {
          const row = {
            "Student Name": s.studentName,
            Email: s.email,
          };
          s.sessionStats.forEach((sess, idx) => {
            row[`${(sess.date).toString()}`] = sess.status;
          });
          row.Present = s.totalPresent;
          row.Absent = s.totalAbsent;
          row["Total Sessions"] = s.totalSessions;
          row["% Attendance"] = s.attendancePercentage;
          return row;
        })
      : data.report.map((s) => {
          const present = s.sessionStats?.filter(st => st.status === "present").length || 0;
          const absent = s.sessionStats?.filter(st => st.status === "absent").length || 0;
          return {
            "Student Name": s.studentName,
            Present: s.totalPresent,
            Absent: s.totalAbsent,
            "Total Sessions": s.totalSessions,
            "% Attendance": s.attendancePercentage,
          };
        });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    const fileName = showDetailed
      ? `${detailedData.className}_Detailed_Attendance.xlsx`
      : `${data.className}_Summary_Attendance.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    const activeData = showDetailed ? detailedData : data;
    doc.setFontSize(16);
    doc.text(`${activeData.className} - ${showDetailed ? "Detailed" : "Summary"} Attendance Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Subject: ${activeData.subject}`, 14, 28);
    doc.text(`Teacher: ${activeData.teacherName}`, 14, 36);
    doc.text(`Total Sessions: ${activeData.totalSessions}`, 14, 44);

    let tableColumn = [];
    let tableRows = [];

    if (!showDetailed) {
      tableColumn = ["Name", "Present", "Absent", "Total Sessions", "% Attendance"];
      tableRows = data.report.map((s) => {
        const present = s.sessionStats?.filter(st => st.status === "present").length || 0;
        const absent = s.sessionStats?.filter(st => st.status === "absent").length || 0;
        return [s.studentName, s.presentCount, s.absentCount, s.totalSessions, s.attendancePercentage];
      });
    } else {
      // Detailed table with sessions as columns
      tableColumn = ["Name", "Email"];
      detailedData.sessions.forEach((sess) => {
        tableColumn.push((sess.date).toString()); // only date
      });
      tableColumn.push("Present", "Absent", "Total Sessions", "% Attendance");

      tableRows = detailedData.report.map((s) => {
        const row = [s.studentName, s.email];
        detailedData.sessions.forEach((sess) => {
          const stat = s.sessionStats.find(ss => ss.sessionId === sess.sessionId);
          row.push(stat ? stat.status : "-");
        });
        row.push(s.totalPresent, s.totalAbsent, s.totalSessions, s.attendancePercentage);
        return row;
      });
    }

    autoTable(doc, {
    startY: 50,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [88, 28, 135], fontSize: 10, halign: "center" },
    bodyStyles: { fontSize: 9 },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
});

    const fileName = showDetailed
      ? `${detailedData.className}_Detailed_Attendance.pdf`
      : `${data.className}_Summary_Attendance.pdf`;
    doc.save(fileName);
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

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          onClick={exportExcel}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-md transition"
        >
          Download Excel
        </button>
        {!showDetailed ?
        <button
          onClick={exportPDF}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-md transition"
        >
          Download PDF
        </button>
        : null}
        <button
          onClick={fetchDetailedReport}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md transition"
        >
          {showDetailed ? "Show Summary" : "Show Detailed"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {!showDetailed ? (
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
              {data?.report?.map((s) => {
                const present = s.sessionStats?.filter(st => st.status === "present").length || 0;
                const absent = s.sessionStats?.filter(st => st.status === "absent").length || 0;
                return (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{s.studentName}</td>
                    <td className="border px-3 py-2">{s.presentCount}</td>
                    <td className="border px-3 py-2">{s.absentCount}</td>
                    <td className="border px-3 py-2">{s.totalSessions}</td>
                    <td className="border px-3 py-2">{s.attendancePercentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-sm md:text-base">
            <thead className="bg-blue-100">
              <tr>
                <th className="border px-3 py-2">Student Name</th>
                <th className="border px-3 py-2">Email</th>
                {detailedData?.sessions?.map((sess, idx) => (
                  <th key={idx} className="border px-3 py-2">
                    {(sess.date).toString()}

                  </th>
                ))}
                <th className="border px-3 py-2">Present</th>
                <th className="border px-3 py-2">Absent</th>
                <th className="border px-3 py-2">Total Sessions</th>
                <th className="border px-3 py-2">% Attendance</th>
              </tr>
            </thead>
            <tbody>
              {detailedData?.report?.map((s) => (
                <tr key={s.studentId} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.studentName}</td>
                  <td className="border px-3 py-2">{s.email}</td>
                  {detailedData.sessions.map((sess) => {
                    const stat = s.sessionStats.find(ss => ss.sessionId === sess.sessionId);
                    return (
                      <td
                        key={sess.sessionId}
                        className={`border px-3 py-2 ${stat?.status === "present" ? "text-green-600" : "text-red-600"}`}
                      >
                        {stat?.status || "-"}
                      </td>
                    );
                  })}
                  <td className="border px-3 py-2">{s.totalPresent}</td>
                  <td className="border px-3 py-2">{s.totalAbsent}</td>
                  <td className="border px-3 py-2">{s.totalSessions}</td>
                  <td className="border px-3 py-2">{s.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassReport;
