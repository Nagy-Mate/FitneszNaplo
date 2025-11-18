import db from "./database.js";

db.prepare(
  `CREATE TABLE IF NOT EXISTS workoutExercises(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutId INTEGER,
    exerciseId INTEGER,
    sets NUMBER,
    reps NUMBER,
    weight NUMBER,
    FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exercises(id))`
).run();

export const getWorkoutExercises = () =>
  db.prepare(`SELECT * FROM workoutExercises`).all();

export const getWorkoutExerciseById = (id) =>
  db.prepare(`SELECT * FROM workoutExercises WHERE id = ?`).get(id);

export const getWorkoutExerciseByWorkoutId = (workoutId) =>
  db
    .prepare(`SELECT * FROM workoutExercises WHERE workoutId = ?`)
    .get(workoutId);

export const getWorkoutExerciseByUserId = (userId) =>
  db
    .prepare(
      `SELECT workoutExercises.* FROM workoutExercises JOIN workouts ON workoutExercises.workoutId = workouts.id WHERE workouts.userId = ?`
    )
    .all(userId);

export const saveWorkoutExercise = (
  sets,
  reps,
  weight,
  workoutId,
  exerciseId
) =>
  db
    .prepare(
      `INSERT INTO workoutExercises (sets, reps, weight, workoutId, exerciseId) VALUES(?, ?, ?, ?, ?)`
    )
    .run(sets, reps, weight, workoutId, exerciseId);

export const updateWorkoutExercise = (
  id,
  sets,
  reps,
  weight,
  workoutId,
  exerciseId
) =>
  db
    .prepare(
      `UPDATE workoutExercises SET sets = ?, reps = ?, weight = ?, workoutId = ?, exerciseId = ? WHERE id = ?`
    )
    .run(sets, reps, weight, workoutId, exerciseId, id);

export const deleteWorkoutExercise = (id) =>
  db.prepare(`DELETE FROM workoutExercises WHERE id = ?`).run(id);
