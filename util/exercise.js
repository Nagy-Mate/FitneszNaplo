import db from "./database.js";

db.prepare(
  `CREATE TABLE IF NOT EXISTS exercises(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT)`
).run();

export const getExercises = () => db.prepare(`SELECT * FROM exercises`).all();

export const getExerciseById = (id) =>
  db.prepare(`SELECT * FROM exercises WHERE id = ?`).get(id);

export const saveExercise = (name) =>
  db
    .prepare(
      `INSERT INTO exercises (name) VALUES(?)`
    )
    .run(name);

export const updateExercise = (id, name) =>
  db
    .prepare(
      `UPDATE exercises SET name = ? WHERE id = ?`
    )
    .run(name, id);

export const deleteExercise = (id) =>
  db.prepare(`DELETE FROM exercises WHERE id = ?`).run(id);
