import React, { useState } from "react";
import "./GenerateTT.css"; // Make sure you have styles for this component
const GenerateTT = () => {
  const [className, setClassName] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [message, setMessage] = useState("");

  const handleClassNameChange = (e) => {
    setClassName(e.target.value);
  };

  const generateTimetable = async () => {
    if (!className) {
      setMessage("Please enter a class name.");
      return;
    }

    // Make API call to backend to generate the timetable
    try {
      const response = await fetch("http://localhost:5000/api/generate-timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ className }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimetable(data.timetable);
        setMessage("Timetable generated successfully!");
      } else {
        setMessage(data.error || "Error generating timetable.");
      }
    } catch (err) {
      setMessage("Error generating timetable.");
      console.error("Error:", err);
    }
  };

  return (
    <div className="generate-tt-container">
      <h2>Generate Timetable</h2>

      <div className="form-group">
        <label>Class Name:</label>
        <input
          type="text"
          value={className}
          onChange={handleClassNameChange}
          placeholder="Enter class name (e.g., 6A)"
        />
      </div>

      <button onClick={generateTimetable} className="generate-btn">
        Generate Timetable
      </button>

      {message && <p>{message}</p>}

      {timetable && (
        <div className="timetable-container">
          <h3>Generated Timetable:</h3>
          <pre>{JSON.stringify(timetable, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GenerateTT;
