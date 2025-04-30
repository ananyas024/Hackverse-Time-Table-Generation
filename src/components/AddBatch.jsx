import React, { useState } from "react";
import "./AddBatch.css";

const AddBatch = ({ onBatchAdded }) => {
  const [form, setForm] = useState({
    year: "",
    section: "",
    subjectCodes: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      year: parseInt(form.year),
      sections: [
        {
          name: form.section,
          subjects: form.subjectCodes.split(",").map((s) => s.trim()),
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Batch added successfully!");
        setForm({ year: "", section: "", subjectCodes: "" });
        if (onBatchAdded) onBatchAdded();
      } else {
        setMessage("Failed to add batch.");
        console.error("Server error:", data);
      }
    } catch (err) {
      setMessage("Error connecting to server.");
      console.error("Request error:", err);
    }
  };

  return (
    <div className="add-batch-container">
      <form onSubmit={handleSubmit} className="batch-form">
        <div className="form-group">
          <label>Batch Year:</label>
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Section Name (e.g., 6A):</label>
          <input
            name="section"
            value={form.section}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Subject Codes (comma separated):</label>
          <input
            name="subjectCodes"
            value={form.subjectCodes}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Batch
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddBatch;
