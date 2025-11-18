import { Router } from "express";
import * as Workout from "../util/workout.js";
import auth from "../util/authentication.js";

const router = Router();

router.get("/all", (req, res) => {
  const workouts = Workout.getWorkouts();
  if (workouts.length == 0) {
    return res.status(404).send("Workouts not found");
  }
  return res.status(200).send(workouts);
});

router.get("/:id", auth, (req, res) => {
  const workout = Workout.getWorkoutById(req.params.id);
  if (!workout) {
    return res.status(404).send("Workout not found! ");
  }
  if (workout.userId != req.userId) {
    return res.status(401).send("Unauthorized");
  }
  return res.status(200).send(workout);
});

router.get("/", auth, (req, res) => {
  const workouts = Workout.getWorkoutsByUserId(req.userId);
  if (workouts.length == 0) {
    return res.status(404).send("Workouts not found");
  }
  return res.status(200).send(workouts);
});

router.post("/", auth, (req, res) => {
  const { date, duration, notes } = req.body;
  if (!date || !duration || !notes) {
    return res.status(400).send("Missing some data");
  }
  const savedWorkout = Workout.saveWorkout(date, duration, notes, req.userId);
  if (savedWorkout.changes != 1) {
    return res.status(500).send("Workout save failed");
  }
  return res.status(204).send("Saved");
});

router.patch("/:id", auth, (req, res) => {
  const { date, duration, notes } = req.body;
  const workoutId = req.params.id;
  const workout = Workout.getWorkoutById(workoutId);
  if (!workout) {
    return res.status(404).send("Workout not found");
  }
  if (workout.userId != req.userId) {
    return res.status(401).send("Unauthorized");
  }
  const updatedW = Workout.updateWorkout(
    workout.id,
    date || workout.date,
    duration || workout.duration,
    notes || workout.notes
  );
  if (updatedW.changes != 1) {
    return res.status(500).send("Workout update failed");
  }
  return res.status(204).send("Updated");
});

router.delete("/:id", auth, (req, res) => {
  const workout = Workout.getWorkoutById(req.params.id);
  if (!workout) {
    return res.status(404).send("Workout not found");
  }
  if (workout.userId != req.userId) {
    return res.status(401).send("Unauthorized");
  }
  const deletedW = Workout.deleteWorkout(workout.id);
  if (deletedW.changes != 1) {
    return res.status(500).send("Workout delete failed");
  }
  return res.status(204).send("Deleted");
});
export default router;
