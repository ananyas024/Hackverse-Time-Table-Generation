import React, { useState } from "react";
import "./AddTeachers.css";

const AddTeachers = ({ onTeacherAdded }) => {
  const [form, setForm] = useState({
    teacherId: "",
    teacherName: "",
    subjectCode: "",
    subjectName: "",
    credits: "",
    isLab: false,
    sections: "",  // New field for sections
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form); // Debug log

    try {
      const response = await fetch("http://localhost:5000/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Teacher added successfully!");
        setForm({
          teacherId: "",
          teacherName: "",
          subjectCode: "",
          subjectName: "",
          credits: "",
          isLab: false,
          sections: "", // Reset sections field
        });
        if (onTeacherAdded) onTeacherAdded();
      } else {
        console.error("Server error:", data);
        setMessage("Failed to add teacher.");
      }
    } catch (err) {
      console.error("Request error:", err);
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="add-teacher-container">
      <form onSubmit={handleSubmit} className="teacher-form">
        <div className="form-group">
          <label>Teacher ID:</label>
          <input
            name="teacherId"
            value={form.teacherId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Teacher Name:</label>
          <input
            name="teacherName"
            value={form.teacherName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Subject Code:</label>
          <input
            name="subjectCode"
            value={form.subjectCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Subject Name:</label>
          <input
            name="subjectName"
            value={form.subjectName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Credits:</label>
          <input
            name="credits"
            type="number"
            value={form.credits}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Is Lab:</label>
          <input
            type="checkbox"
            name="isLab"
            checked={form.isLab}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Sections (comma-separated):</label>
          <input
            name="sections"
            value={form.sections}
            onChange={handleChange}
            placeholder="e.g. A,B,C"
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Teacher
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddTeachers;
