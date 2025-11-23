import db from "./database.js";

export const getAllWDuration = (userId) =>
  db
    .prepare(
      `SELECT COALESCE(SUM(duration), 0) AS totalDuration
     FROM workouts
     WHERE userId = ?`
    )
    .get(userId);

export const getWeeklyStat = (userId) =>
  db
    .prepare(
      `SELECT
        SUM(we.weight * we.reps * we.sets) AS totalVolume,
        COUNT(DISTINCT w.id) AS workoutCount
    FROM workouts w
      LEFT JOIN workoutExercises we ON we.workoutId = w.id
    WHERE w.userId = ?
      AND DATE(w.date) BETWEEN 
        DATE('now', 'weekday 1', '-7 days') 
        AND DATE('now', 'weekday 0')`
    )
    .get(userId);
