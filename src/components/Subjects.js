import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    max_marks: 100
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        await axios.put(`${API}/subjects/${editingSubject.id}`, formData);
        alert("Subject updated successfully!");
      } else {
        await axios.post(`${API}/subjects`, formData);
        alert("Subject added successfully!");
      }

      setShowModal(false);
      setEditingSubject(null);
      setFormData({ name: "", code: "", max_marks: 100 });
      fetchSubjects();
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred");
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      max_marks: subject.max_marks
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject? All related results will also be deleted.")) {
      try {
        await axios.delete(`${API}/subjects/${id}`);
        alert("Subject deleted successfully!");
        fetchSubjects();
      } catch (error) {
        alert("Error deleting subject");
      }
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "", max_marks: 100 });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div data-testid="subjects-page">
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Manage subject records</p>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
          data-testid="add-subject-btn"
        >
          + Add Subject
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Maximum Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                    No subjects found
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} data-testid={`subject-row-${subject.code}`}>
                    <td>{subject.code}</td>
                    <td>{subject.name}</td>
                    <td>{subject.max_marks}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleEdit(subject)}
                          title="Edit"
                          data-testid={`edit-subject-btn-${subject.code}`}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDelete(subject.id)}
                          title="Delete"
                          data-testid={`delete-subject-btn-${subject.code}`}
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
          <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="subject-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Subject Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  data-testid="modal-code-input"
                />
              </div>

              <div className="input-group">
                <label>Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="modal-name-input"
                />
              </div>

              <div className="input-group">
                <label>Maximum Marks</label>
                <input
                  type="number"
                  value={formData.max_marks}
                  onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                  min="1"
                  required
                  data-testid="modal-max-marks-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" className="btn btn-primary" data-testid="modal-submit-btn">
                  {editingSubject ? "Update Subject" : "Add Subject"}
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

export default Subjects;
