import React, { useState } from "react";
import "./Dashboard.css";
import { Line } from "react-chartjs-2";
import Tabs from "./Tabs"; // Optional if you're using a tab system
import AddTeachers from "./AddTeachers";
import ViewTeachers from "./ViewTeachers";
import AddBatch from "./AddBatch"; // ✅ Import the AddBatch component
import GenerateTT from "./GenerateTT"; // Import the GenerateTT component

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Generate TimeTable");
  const [fitnessData, setFitnessData] = useState([10, 8, 5, 2]);

  const fitnessChart = {
    labels: fitnessData.map((_, i) => `Gen ${i + 1}`),
    datasets: [
      {
        label: "Fitness Score",
        data: fitnessData,
        fill: false,
        borderColor: "#4f46e5",
        tension: 0.1,
      },
    ],
  };

  // Tab Contents
  const generateTimeTableContent = (
    <div className="dashboard-container">
      <GenerateTT /> {/* Add GenerateTT component here */}
    </div>
  );

  const recentHistoryContent = (
    <div className="dashboard-container">
      <h2>Recent History</h2>
      <p>Details about recent activity...</p>
      {/* Display recent actions or history data */}
    </div>
  );

  const aboutUsContent = (
    <div className="dashboard-container">
      <h2>About Us</h2>
      <p>Information about the application...</p>
      {/* About us information */}
    </div>
  );

  const addTeacherContent = (
    <div className="dashboard-container">
      <h2>Add Teacher Details</h2>
      <AddTeachers />
    </div>
  );

  const viewTeacherContent = (
    <div className="dashboard-container">
      <h2>View Teacher Details</h2>
      <ViewTeachers />
    </div>
  );

  const addBatchContent = (
    <div className="dashboard-container">
      <h2>Add Batch Details</h2>
      <AddBatch />
    </div>
  );

  const tabs = {
    "Generate TimeTable": generateTimeTableContent,
    "Recent History": recentHistoryContent,
    "About Us": aboutUsContent,
    "Add Teacher Details": addTeacherContent,
    "View Teacher Details": viewTeacherContent,
    "Add Batch Details": addBatchContent, // ✅ New tab content
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <ul>
          <li onClick={() => setActiveTab("Generate TimeTable")}>Generate TimeTable</li>
          <li onClick={() => setActiveTab("Recent History")}>Recent History</li>
          <li onClick={() => setActiveTab("About Us")}>About Us</li>
          <li onClick={() => setActiveTab("Add Teacher Details")}>Add Teacher Details</li>
          <li onClick={() => setActiveTab("View Teacher Details")}>View Teacher Details</li>
          <li onClick={() => setActiveTab("Add Batch Details")}>Add Batch Details</li>
        </ul>
      </div>

      <div className="content">
        {tabs[activeTab]} {/* This renders the content based on the active tab */}
      </div>
    </div>
  );
};

export default Dashboard;
