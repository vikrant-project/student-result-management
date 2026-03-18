import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roll_no: "",
    name: "",
    class_name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search = "") => {
    try {
      const url = search ? `${API}/students?search=${search}` : `${API}/students`;
      const response = await axios.get(url);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchStudents(query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await axios.put(`${API}/students/${editingStudent.id}`, formData);
        alert("Student updated successfully!");
      } else {
        await axios.post(`${API}/students`, formData);
        alert("Student added successfully!");
      }

      setShowModal(false);
      setEditingStudent(null);
      setFormData({ roll_no: "", name: "", class_name: "", email: "", phone: "" });
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      roll_no: student.roll_no,
      name: student.name,
      class_name: student.class_name,
      email: student.email,
      phone: student.phone
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`${API}/students/${id}`);
        alert("Student deleted successfully!");
        fetchStudents();
      } catch (error) {
        alert("Error deleting student");
      }
    }
  };

  const handleViewReport = (studentId) => {
    navigate(`/report/${studentId}`);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ roll_no: "", name: "", class_name: "", email: "", phone: "" });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div data-testid="students-page">
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Manage student records</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={handleSearch}
            data-testid="student-search-input"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
          data-testid="add-student-btn"
        >
          + Add Student
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} data-testid={`student-row-${student.roll_no}`}>
                    <td>{student.roll_no}</td>
                    <td>{student.name}</td>
                    <td>{student.class_name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleViewReport(student.id)}
                          title="View Report"
                          data-testid={`view-report-btn-${student.roll_no}`}
                        >
                          📄
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleEdit(student)}
                          title="Edit"
                          data-testid={`edit-student-btn-${student.roll_no}`}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDelete(student.id)}
                          title="Delete"
                          data-testid={`delete-student-btn-${student.roll_no}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="student-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                  required
                  data-testid="modal-roll-no-input"
                />
              </div>

              <div className="input-group">
                <label>Student Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="modal-name-input"
                />
              </div>

              <div className="input-group">
                <label>Class</label>
                <input
                  type="text"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  required
                  data-testid="modal-class-input"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="modal-email-input"
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="modal-phone-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" className="btn btn-primary" data-testid="modal-submit-btn">
                  {editingStudent ? "Update Student" : "Add Student"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
