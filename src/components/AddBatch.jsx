import React, { useState } from "react";
import "./AddBatch.css";

const AddBatch = ({ onBatchAdded }) => {
  const [form, setForm] = useState({
    year: "",
    section: "",
    subjectCodes: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const subjectsArray = form.subjectCodes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!form.year || !form.section || subjectsArray.length === 0) {
      setMessage("❌ Please fill all fields correctly.");
      return;
    }

    const body = {
      year: parseInt(form.year),
      sections: [
        {
          name: form.section,
          subjects: subjectsArray,
        },
      ],
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage("✅ Batch added successfully!");
        setForm({ year: "", section: "", subjectCodes: "" });
        if (onBatchAdded) onBatchAdded();
      } else {
        setMessage(`❌ Failed to add batch: ${data.error}`);
      }
    } catch (error) {
      setLoading(false);
      console.error("Network error:", error);
      setMessage("❌ Could not connect to the server.");
    }
  };

  return (
    <div className="add-batch-container">
      <h2>Add New Batch</h2>
      <form onSubmit={handleSubmit} className="batch-form">
        <div className="form-group">
          <label htmlFor="year">Batch Year:</label>
          <input
            id="year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
            min="2000"
            placeholder="e.g., 2025"
          />
        </div>

        <div className="form-group">
          <label htmlFor="section">Section Name:</label>
          <input
            id="section"
            name="section"
            type="text"
            value={form.section}
            onChange={handleChange}
            required
            placeholder="e.g., 6A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subjectCodes">Subject Codes (comma-separated):</label>
          <input
            id="subjectCodes"
            name="subjectCodes"
            type="text"
            value={form.subjectCodes}
            onChange={handleChange}
            required
            placeholder="e.g., CS301, MA202, EC101"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Batch"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddBatch;
