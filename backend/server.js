import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/output', express.static(path.join(__dirname, 'output')));

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
db.run(`CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    section TEXT NOT NULL,
    subjectCodes TEXT NOT NULL
)`, (err) => {
  if (err) console.error("Batch table creation error:", err);
  else console.log("Batches table is ready.");
});

// Create teachers table
db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subjectCode TEXT NOT NULL,
    subjectName TEXT NOT NULL,
    credits INTEGER NOT NULL,
    isLab INTEGER NOT NULL,
    sections TEXT NOT NULL
)`, (err) => {
  if (err) console.error("Teachers table creation error:", err);
  else console.log("Teachers table is ready.");
});

// POST /api/generate-timetable
app.post('/api/generate-timetable', (req, res) => {
  const { className } = req.body;

  if (!className) {
    return res.status(400).json({ error: 'Class name is required.' });
  }

  // Fetch the batch for the given section
  db.get(
    `SELECT * FROM batches WHERE section = ?`,
    [className],
    (err, batchRow) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      if (!batchRow) {
        return res.status(404).json({ error: "Batch not found for this section." });
      }

      // Get subject codes for this batch
      const subjectCodes = batchRow.subjectCodes.split(',').map(s => s.trim());

      // Fetch teachers for these subject codes
      db.all(
        `SELECT * FROM teachers WHERE subjectCode IN (${subjectCodes.map(() => '?').join(',')})`,
        subjectCodes,
        (err, teacherRows) => {
          if (err) {
            return res.status(500).json({ error: "Database query failed" });
          }

          const subjects = teacherRows.map(row => ({
            subject_name: row.subjectName,
            teacher_name: row.name,
            is_lab: !!row.isLab,
            credits: row.credits,
            subject_code: row.subjectCode,
          }));

          const timetable = generateTimetable(subjects);
          return res.status(200).json({ timetable });
        }
      );
    }
  );
});

// Helper function to generate timetable based on subjects
const generateTimetable = (subjects) => {
  const timetable = { 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [] };
  const days = Object.keys(timetable);
  const periodsPerDay = 6;

  subjects.forEach(subject => {
    let hoursAssigned = 0;
    while (hoursAssigned < subject.credits) {
      const day = days[Math.floor(Math.random() * days.length)];
      let period = Math.floor(Math.random() * periodsPerDay);

      if (subject.is_lab && period < periodsPerDay - 1 && timetable[day][period] === undefined && timetable[day][period + 1] === undefined) {
        timetable[day][period] = subject.subject_code;
        timetable[day][period + 1] = subject.subject_code;
        hoursAssigned += 2;
      } else if (!subject.is_lab && timetable[day][period] === undefined) {
        timetable[day][period] = subject.subject_code;
        hoursAssigned++;
      }
    }
  });

  for (const day of days) {
    for (let i = 0; i < periodsPerDay; i++) {
      if (timetable[day][i] === undefined) timetable[day][i] = "---";
    }
  }

  return timetable;
};

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
