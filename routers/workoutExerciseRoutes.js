import { Router } from "express";
import * as WorkoutExercise from "../util/workoutExercise.js";
import * as Workout from "../util/workout.js";
import * as Exercise from "../util/exercise.js";
import auth from "../util/authentication.js";

const router = Router();

router.get("/all", (req, res) => {
  const workoutExercises = WorkoutExercise.getWorkoutExercises();
  if (workoutExercises.length == 0) {
    return res.status(404).send("Not found");
  }
  return res.status(200).send(workoutExercises);
});

router.get("/:id", (req, res) => {
  const workoutExercises = WorkoutExercise.getWorkoutExerciseById(
    req.params.id
  );
  if (!workoutExercises) {
    return res.status(404).send("Not found! ");
  }
  return res.status(200).send(workoutExercises);
});

router.get("/", auth, (req, res) => {
  const workoutExercises = WorkoutExercise.getWorkoutExerciseByUserId(
    req.userId
  );
  if (workoutExercises.length == 0) {
    return res.status(404).send("Not found");
  }
  return res.status(200).send(workoutExercises);
});

router.post("/", auth, (req, res) => {
  const { workoutId, exerciseId, sets, reps, weight } = req.body;
  if (!workoutId || !exerciseId || !sets || !reps || !weight) {
    return res.status(404).send("Missing some data");
  }
  const exercise = Exercise.getExerciseById(exerciseId);
  if (!exercise) {
    return res.status(404).send("Exercise not found ");
  }
  const workout = Workout.getWorkoutById(workoutId);
  if (!workout) {
    return res.status(404).send("Workout not found");
  }
  if (workout.userId != req.userId) {
    return res.status(401).send("Unauthorized");
  }

  const savedWorkoutE = WorkoutExercise.saveWorkoutExercise(
    sets,
    reps,
    weight,
    workoutId,
    exerciseId
  );
  if (savedWorkoutE.changes != 1) {
    return res.status(500).send("Save failed");
  }
  return res.status(204).send("Saved");
});

router.patch("/:id", auth, (req, res) => {
  const workoutE = WorkoutExercise.getWorkoutExerciseById(req.params.id);
  if (!workoutE) {
    return res.status(404).send("Workout Exercise not found");
  }
  const workout = Workout.getWorkoutById(workoutE.workoutId);
  if (workout.userId != req.userId) {
    return res.status(401).send("Unauthorized");
  }
  const { workoutId, exerciseId, sets, reps, weight } = req.body;
  if (workoutId) {
    const workoutToUpdate = Workout.getWorkoutById(workoutId);
    if (!workoutToUpdate) {
      return res.status(404).send("Workout not found");
    }
    if (workoutToUpdate.userId != req.userId) {
      return res.status(401).send("Unauthorized");
    }
  }
  if (exerciseId) {
    const exerciseToUpdate = Exercise.getExerciseById(exerciseId);
    if (!exerciseToUpdate) {
      return res.status(404).send("Exercise not found");
    }
  }
  const updatedWE = WorkoutExercise.updateWorkoutExercise(
    workoutE.id,
    sets || workoutE.sets,
    reps || workoutE.reps,
    weight || workoutE.weight,
    workoutId || workoutE.workoutId,
    exerciseId || workoutE.exerciseId
  );
  if(updatedWE.changes !== 1){
    return res.status(500).send("Update failed")
  }
  return res.status(204).send("Updated")
});

router.delete("/:id", auth, (req, res) =>{
  const workoutE = WorkoutExercise.getWorkoutExerciseById(req.params.id);
  if(!workoutE){
    return res.status(404).send("Not found")
  }
  const workout = Workout.getWorkoutById(workoutE.workoutId);
  if(workout.userId != req.userId){
    return res.status(401).send("Unauthorized")
  }
  const deletedWE = WorkoutExercise.deleteWorkoutExercise(workoutE.id)
  if(deletedWE.changes !== 1){
    return res.status(500).send("Delete Failed")
  }
  return res.status(204).send("Deleted")
})

export default router;
