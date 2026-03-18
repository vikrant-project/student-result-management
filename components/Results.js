import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Results() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentResults();
    }
  }, [selectedStudent]);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/subjects`)
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async () => {
    try {
      const response = await axios.get(`${API}/results/student/${selectedStudent}`);
      const resultsMap = {};
      response.data.results.forEach(result => {
        resultsMap[result.subject_code] = result.marks;
      });
      setMarks(resultsMap);
    } catch (error) {
      // Student might not have results yet
      setMarks({});
    }
  };

  const handleMarksChange = (subjectCode, value) => {
    setMarks({
      ...marks,
      [subjectCode]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save marks for each subject
      const promises = subjects.map(subject => {
        const marksValue = marks[subject.code];
        if (marksValue !== undefined && marksValue !== "") {
          return axios.post(`${API}/results`, {
            student_id: selectedStudent,
            subject_id: subject.id,
            marks: parseFloat(marksValue)
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      alert("Results saved successfully!");
    } catch (error) {
      alert(error.response?.data?.detail || "Error saving results");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div data-testid="results-page">
      <div className="page-header">
        <h1 className="page-title">Enter Results</h1>
        <p className="page-subtitle">Enter marks for students</p>
      </div>

      <div className="glass-card">
        <div className="input-group">
          <label>Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            data-testid="student-select"
          >
            <option value="">-- Select a Student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.roll_no} - {student.name} ({student.class_name})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Enter Marks</h3>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Max Marks</th>
                      <th>Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.id} data-testid={`marks-row-${subject.code}`}>
                        <td>{subject.code}</td>
                        <td>{subject.name}</td>
                        <td>{subject.max_marks}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={subject.max_marks}
                            step="0.5"
                            value={marks[subject.code] || ""}
                            onChange={(e) => handleMarksChange(subject.code, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              width: '120px'
                            }}
                            data-testid={`marks-input-${subject.code}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '25px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  data-testid="save-results-btn"
                >
                  {saving ? "Saving..." : "Save Results"}
                </button>
              </div>
            </div>
          </form>
        )}

        {!selectedStudent && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#a0a0a0' }}>
            Please select a student to enter marks
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
