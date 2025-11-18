import db from "./database.js";

db.prepare(
  `CREATE TABLE IF NOT EXISTS workouts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    date DATE,
    duration INTEGER,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)ON DELETE CASCADE) `
).run();

export const getWorkouts = () => db.prepare(`SELECT * FROM workouts`).all();

export const getWorkoutById = (id) =>
  db.prepare(`SELECT * FROM workouts WHERE id = ?`).get(id);

export const getWorkoutsByUserId = (userId) =>
  db.prepare(`SELECT * FROM workouts WHERE userId = ?`).all(userId);

export const saveWorkout = (date, duration, notes, userId) =>
  db
    .prepare(
      `INSERT INTO workouts (date, duration, notes, userId) VALUES(?, ?, ?, ?)`
    )
    .run(date, duration, notes, userId);

export const updateWorkout = (id, date, duration, notes) =>
  db
    .prepare(
      `UPDATE workouts SET date = ?, duration = ?, notes = ? WHERE id = ?`
    )
    .run(date, duration, notes, id);

export const deleteWorkout = (id) =>
  db.prepare(`DELETE FROM workouts WHERE id = ?`).run(id);
