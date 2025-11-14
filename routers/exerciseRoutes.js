import { Router } from "express";
import * as Exercise from "../util/exercise.js";

const router = Router();

router.get("/", (req, res) => {
  const exercises = Exercise.getExercises();
  if (exercises.length == 0) {
    return res.status(404).send("Exercises not found! ");
  }
  return res.status(200).send(exercises);
});

router.get("/:id", (req, res) => {
  const exercise = Exercise.getExerciseById(req.params.id);
  if (!exercise) {
    return res.status(404).send("Exercises not found! ");
  }
  return res.status(200).send(exercise);
});

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send("Missing some data");
  }

  const savedExercise = Exercise.saveExercise(name);
  if (savedExercise.changes != 1) {
    return res.status(500).send("Exercise save failed! ");
  }
  return res
    .status(201)
    .send({ id: savedExercise.lastInsertRowid, name: name });
});

router.put("/:id", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send("Missing some data");
  }
  const id = req.params.id;
  const exercise = Exercise.getExerciseById(id);
  if (!exercise) {
    return res.status(404).send("Exercise not found! ");
  }
  const savedExercise = Exercise.updateExercise(id, name);
  if (savedExercise.changes != 1) {
    return res.status(500).send("Exercise update failed");
  }
  return res
    .status(200)
    .send({ id: savedExercise.lastInsertRowid, name: name });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const exercise = Exercise.getExerciseById(id);
  if (!exercise) {
    return res.status(404).send("Exercise not found");
  }
  const deletedExercise = Exercise.deleteExercise(id);
  if (deletedExercise.changes != 1) {
    return res.status(500).send("Exercise delete failed");
  }
  return res.status(204).send("Deleted");
});

export default router;
