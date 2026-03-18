import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function StudentReport() {
  const { studentId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [studentId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/results/student/${studentId}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Error loading student report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getGradeClass = (grade) => {
    if (grade === "A+") return "grade-a-plus";
    if (grade === "A") return "grade-a";
    if (grade === "B") return "grade-b";
    if (grade === "C") return "grade-c";
    return "grade-f";
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  if (!reportData) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Student Report</h1>
        </div>
        <div className="glass-card">
          <p style={{ textAlign: 'center', padding: '30px' }}>No data found for this student</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="student-report-page">
      <div className="page-header no-print">
        <h1 className="page-title">Student Report Card</h1>
        <p className="page-subtitle">Detailed performance report</p>
      </div>

      <div style={{ marginBottom: '25px' }} className="no-print">
        <button
          className="btn btn-primary"
          onClick={handlePrint}
          data-testid="print-report-btn"
        >
          🖨️ Print Report
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid rgba(139, 92, 246, 0.3)', paddingBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px', color: '#8b5cf6' }}>
            Student Result Management System
          </h1>
          <p style={{ fontSize: '18px', color: '#b0b0b0' }}>Academic Performance Report</p>
        </div>

        {/* Student Info */}
        <div style={{ marginBottom: '35px', background: 'rgba(139, 92, 246, 0.1)', padding: '25px', borderRadius: '15px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#c4b5fd' }}>Student Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>Roll Number</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>{reportData.student.roll_no}</p>
            </div>
            <div>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>Student Name</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>{reportData.student.name}</p>
            </div>
            <div>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>Class</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>{reportData.student.class_name}</p>
            </div>
            <div>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>Email</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>{reportData.student.email}</p>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Subject-wise Performance</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.subject_code}</td>
                    <td>{result.subject_name}</td>
                    <td>{result.marks}</td>
                    <td>{result.max_marks}</td>
                    <td>{((result.marks / result.max_marks) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '30px', borderRadius: '15px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '25px', textAlign: 'center' }}>Overall Performance</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '8px' }}>Total Marks</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
                {reportData.total_marks} / {reportData.max_total_marks}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '8px' }}>Percentage</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
                {reportData.percentage}%
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '8px' }}>Grade</p>
              <p style={{ fontSize: '28px', fontWeight: '700' }}>
                <span className={`badge ${getGradeClass(reportData.grade)}`} style={{ fontSize: '24px', padding: '8px 20px' }}>
                  {reportData.grade}
                </span>
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '8px' }}>Result</p>
              <p style={{ fontSize: '28px', fontWeight: '700' }}>
                <span className={`badge ${reportData.result === 'Pass' ? 'pass' : 'fail'}`} style={{ fontSize: '24px', padding: '8px 20px' }}>
                  {reportData.result}
                </span>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px' }}>
            <p style={{ fontSize: '16px', color: '#c4b5fd', fontWeight: '600' }}>
              Grade Description: {reportData.grade_description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '50px', paddingTop: '25px', borderTop: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Report generated on {new Date().toLocaleDateString()}</p>
          <p style={{ color: '#8b5cf6', fontSize: '14px', marginTop: '10px', fontWeight: '600' }}>
            Developed by Vikrant Rana | BCA Aspirant, Delhi
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentReport;
