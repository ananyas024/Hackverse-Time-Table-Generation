import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// SQLite setup
const dbPath = path.resolve(__dirname, 'timetable.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database opening error:', err);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

// Create teachers table with sections column
db.run(`
  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacherId TEXT NOT NULL,
    teacherName TEXT NOT NULL,
    subjectCode TEXT NOT NULL,
    subjectName TEXT NOT NULL,
    credits INTEGER NOT NULL,
    isLab INTEGER NOT NULL,
    sections TEXT NOT NULL  -- New column for storing sections as a comma-separated string
  )
`, (err) => {
  if (err) console.error("Teacher table creation error:", err);
  else console.log("Teachers table is ready.");
});

// ------------------- TEACHER APIs -------------------

// Add Teacher
app.post('/api/teachers', (req, res) => {
  const { teacherId, teacherName, subjectCode, subjectName, credits, isLab, sections } = req.body;

  if (!teacherId || !teacherName || !subjectCode || !subjectName || credits === "" || !sections) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    `INSERT INTO teachers (teacherId, teacherName, subjectCode, subjectName, credits, isLab, sections)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [teacherId, teacherName, subjectCode, subjectName, credits, isLab ? 1 : 0, sections],
    function (err) {
      if (err) {
        console.error("DB Insertion Error:", err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Teacher added', id: this.lastID });
    }
  );
});

// Get all Teachers
app.get("/api/teachers", (req, res) => {
  db.all("SELECT * FROM teachers", (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(rows);
    }
  });
});

// DELETE Teacher by teacherId
app.delete('/api/teachers/:teacherId', (req, res) => {
  const { teacherId } = req.params;

  console.log(`Attempting to delete teacher with teacherId: ${teacherId}`);  // Debug log

  db.run(`DELETE FROM teachers WHERE teacherId = ?`, [teacherId], function (err) {
    if (err) {
      console.error("Error deleting teacher:", err);
      return res.status(500).json({ error: "Error deleting teacher." });
    }

    // Check if any rows were affected
    if (this.changes === 0) {
      console.log(`No teacher found with teacherId: ${teacherId}`);  // Debug log
      return res.status(404).json({ message: "Teacher not found." });
    }

    console.log(`Teacher with teacherId: ${teacherId} deleted successfully.`);  // Debug log
    res.status(200).json({ message: "Teacher deleted successfully!" });
  });
});

// ------------------- BATCH APIs -------------------

// Batch POST and GET APIs remain unchanged

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
