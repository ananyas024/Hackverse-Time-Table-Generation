import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

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

// Create batches table
db.run(`
  CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    section TEXT NOT NULL,
    subjectCodes TEXT NOT NULL
  )
`, (err) => {
  if (err) console.error("Batch table creation error:", err);
  else console.log("Batches table is ready.");
});

// DROP and recreate the teachers table (FIX for sections column)
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS batches`, (err) => {
    if (err) console.error("Error dropping batches table:", err);
    else console.log("Old batches table dropped.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      section TEXT NOT NULL,
      subjectCodes TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error("Batch table creation error:", err);
    else console.log("Batches table is ready.");
  });
});

// POST /api/batches
app.post('/api/batches', (req, res) => {
  const { year, sections } = req.body;

  if (!year || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ error: 'Year and sections are required.' });
  }

  const insertStmt = db.prepare(`INSERT INTO batches (year, section, subjectCodes) VALUES (?, ?, ?)`);
  let insertCount = 0;

  sections.forEach(({ name, subjects }) => {
    if (!name || !Array.isArray(subjects)) return;

    const subjectCodes = subjects.join(',');

    insertStmt.run([year, name, subjectCodes], function (err) {
      if (err) {
        console.error("Error inserting batch:", err.message);
        return res.status(500).json({ error: "Database error while inserting batch" });
      }

      insertCount++;
      if (insertCount === sections.length) {
        insertStmt.finalize(() => {
          return res.status(200).json({ message: "Batch(es) added successfully" });
        });
      }
    });
  });
});

// GET /api/batches
app.get('/api/batches', (req, res) => {
  db.all("SELECT * FROM batches", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    } else {
      res.status(200).json(rows);
    }
  });
});

// POST /api/teachers
app.post('/api/teachers', (req, res) => {
  const { teacherId, teacherName, subjectCode, subjectName, credits, isLab, sections } = req.body;

  if (!teacherId || !teacherName || !subjectCode || !subjectName || credits == null || !sections) {
    return res.status(400).json({ error: 'Missing required teacher fields.' });
  }

  const isLabInt = isLab ? 1 : 0;

  const insertStmt = `
    INSERT INTO teachers (id, name, subjectCode, subjectName, credits, isLab, sections)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(insertStmt, [teacherId, teacherName, subjectCode, subjectName, credits, isLabInt, sections], function(err) {
    if (err) {
      console.error("Failed to insert teacher:", err.message);
      return res.status(500).json({ error: 'Failed to insert teacher.' });
    }
    res.status(200).json({ message: 'Teacher added successfully.' });
  });
});

app.get('/api/teachers', (req, res) => {
  db.all("SELECT * FROM teachers", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    } else {
      res.status(200).json(rows);
    }
  });
});

// DELETE /api/teachers/:id
app.delete('/api/teachers/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM teachers WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting teacher:", err.message);
      return res.status(500).json({ error: "Failed to delete teacher." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    res.status(200).json({ message: "Teacher deleted successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
