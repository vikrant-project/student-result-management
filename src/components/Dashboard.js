import { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get(`${API}/export/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of student results</p>
        </div>
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const passFailData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        label: 'Students',
        data: [stats?.passed_students || 0, stats?.failed_students || 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 14
          }
        }
      },
    },
  };

  return (
    <div data-testid="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of student results and statistics</p>
      </div>

      <div style={{ marginBottom: "25px" }}>
        <button
          className="btn btn-success"
          onClick={exportCSV}
          data-testid="export-csv-btn"
        >
          📥 Export Results to CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" data-testid="stat-total-students">
          <div className="stat-icon purple">👥</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{stats?.total_students || 0}</div>
        </div>

        <div className="stat-card" data-testid="stat-total-subjects">
          <div className="stat-icon blue">📖</div>
          <div className="stat-label">Total Subjects</div>
          <div className="stat-value">{stats?.total_subjects || 0}</div>
        </div>

        <div className="stat-card" data-testid="stat-passed-students">
          <div className="stat-icon green">✅</div>
          <div className="stat-label">Passed Students</div>
          <div className="stat-value">{stats?.passed_students || 0}</div>
        </div>

        <div className="stat-card" data-testid="stat-failed-students">
          <div className="stat-icon red">❌</div>
          <div className="stat-label">Failed Students</div>
          <div className="stat-value">{stats?.failed_students || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Pass/Fail Distribution</h3>
          <div style={{ height: '300px' }}>
            <Pie data={passFailData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Performance Overview</h3>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#b0b0b0' }}>Average Percentage</span>
                <span style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '18px' }}>
                  {stats?.average_percentage?.toFixed(2) || 0}%
                </span>
              </div>
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${stats?.average_percentage || 0}%`,
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    borderRadius: '10px',
                    transition: 'width 1s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', marginBottom: '10px' }}>
                <span>Pass Rate</span>
                <span style={{ fontWeight: '600' }}>
                  {stats?.total_students > 0
                    ? ((stats.passed_students / (stats.passed_students + stats.failed_students)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}>
                <span>Fail Rate</span>
                <span style={{ fontWeight: '600' }}>
                  {stats?.total_students > 0
                    ? ((stats.failed_students / (stats.passed_students + stats.failed_students)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
