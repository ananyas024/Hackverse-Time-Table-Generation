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

  // Delete teacher by ID
  const deleteTeacher = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove teacher from state after successful deletion
        setTeachers(teachers.filter((teacher) => teacher.teacherId !== teacherId));
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
              <th>Sections</th> {/* New column for sections */}
              <th>Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.teacherId}>
                <td>{teacher.teacherId}</td>
                <td>{teacher.teacherName}</td>
                <td>{teacher.subjectCode}</td>
                <td>{teacher.subjectName}</td>
                <td>{teacher.credits}</td>
                <td>{teacher.isLab ? "Yes" : "No"}</td>
                <td>{teacher.sections}</td>
                <td>
                  {/* Delete Button */}
                  <button onClick={() => deleteTeacher(teacher.teacherId)} className="delete-btn">
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
