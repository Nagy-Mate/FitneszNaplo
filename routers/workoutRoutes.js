import { Router } from "express";
import * as Workout from "../util/workout.js";
import auth from "../util/authentication.js";

const router = Router();

router.get("/getAll", (req, res) => {
  const workouts = Workout.getWorkouts();
  if (workouts.length == 0) {
    return res.status(404).send("Workouts not found");
  }
  return res.status(200).send(workouts);
});

router.get("/", auth, (req, res) => {
    console.log(req.userId)
  const workouts = Workout.getWorkoutsByUserId(req.userId);
  console.log(workouts)
  if (workouts.length == 0) {
    return res.status(404).send("Workouts not found");
  }
  return res.status(200).send(workouts);
});

router.post("/", auth, (req, res) => {
  const { date, duration, notes } = req.body;
  if (!date || !duration || !notes) {
    return res.status(404).send("Missing some data");
  }
  const savedWorkout = Workout.saveWorkout(date, duration, notes, req.userId);
  if (savedWorkout.changes != 1) {
    return res.status(500).send("Workout save failed");
  }
  return res.status(204).send("Saved");
});

export default router;
