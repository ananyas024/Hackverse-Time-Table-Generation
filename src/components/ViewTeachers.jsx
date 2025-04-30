import React, { useEffect, useState } from "react";

const ViewTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTeachers(teachers.filter((teacher) => teacher.id !== id));
        alert("Teacher deleted successfully!");
      } else {
        alert("Failed to delete teacher.");
      }
    } catch (err) {
      console.error("Error deleting teacher:", err);
      alert("Error deleting teacher.");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>All Teacher Details</h2>
      {teachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <table className="teacher-table">
          <thead>
            <tr>
              <th>Teacher ID</th>
              <th>Name</th>
              <th>Subject Code</th>
              <th>Subject</th>
              <th>Credits</th>
              <th>Is Lab</th>
              <th>Sections</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.name}</td>
                <td>{teacher.subjectCode}</td>
                <td>{teacher.subjectName}</td>
                <td>{teacher.credits}</td>
                <td>{teacher.isLab ? "Yes" : "No"}</td>
                <td>{teacher.sections}</td>
                <td>
                  <button onClick={() => deleteTeacher(teacher.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewTeachers;
