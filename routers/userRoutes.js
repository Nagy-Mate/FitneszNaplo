import { Router } from "express";
import * as User from "../util/user.js";
import * as Workout from "../util/workout.js";
import * as WorkoutExercise from "../util/workoutExercise.js";
import jwt from "jsonwebtoken";
import auth from "../util/authentication.js";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid credetntials ");
  }
  const user = User.getUsersByEmail(email);
  if (!user) {
    return res.status(404).send("User Not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Invalid credetntials ");
  }
  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "30s",
  });
  res.send({ token: token });
});

router.patch("/:id", auth, async (req, res) => {
  const id = +req.params.id;
  if (id != req.userId) {
    return res.status(400).send("Invalid user id");
  }
  const { name, email, password } = req.body;
  let user = User.getUsersById(id);
  let hashedPwd;
  if (password) {
    const salt = await bcrypt.genSalt(12);
    hashedPwd = await bcrypt.hash(password, salt);
  }

  User.updateUser(
    id,
    name || user.name,
    email || user.email,
    hashedPwd || user.password
  );

  user = User.getUsersById(id);
  delete user.password;
  res.status(200).json(user);
});

router.get("/", (req, res) => {
  const users = User.getUsers();
  if (users.length == 0) {
    return res.status(404).send("Users not found! ");
  }
  res.send(users);
});

router.get("/me", auth, (req, res) => {
  const user = User.getUsersById(+req.userId);
  delete user.password;
  res.status(200).send(user);
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("Missing data! ");
  }
  let user = User.getUsersByEmail(email);
  if (user) {
    return res.status(400).send("Email already exists");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPwd = await bcrypt.hash(password, salt);

  const savedUser = User.saveUser(name, email, hashedPwd);
  if (savedUser.changes != 1) {
    return res.status(501).send("User save failed! ");
  }
  user = User.getUsersById(savedUser.lastInsertRowid);
  delete user.password;
  res.status(200).json(user);
});

router.put("/:id", async (req, res) => {
  const { name, email, password } = req.body;
  const id = req.params.id;

  if (!name || !email || !password || !id) {
    return res.status(400).send("Missing data! ");
  }

  const user = User.getUsersById(id);
  if (!user) {
    return res.status(404).send("User not found!");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPwd = await bcrypt.hash(password, salt);

  const updatedUser = User.updateUser(id, name, email, hashedPwd);

  if (updatedUser.changes != 1) {
    return res.status(501).send("User update failed! ");
  }
  res.status(201).send("Updated");
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const user = User.getUsersById(id);
  if (!user) {
    return res.status(404).send("User not found!");
  }

  const workouts = Workout.getWorkoutByUserId(user.id);
  workouts.forEach((w) => {
    const workoutExercises = WorkoutExercise.getWorkoutExerciseByWorkoutId(
      w.id
    );
    workoutExercises.forEach((wE) => {
      WorkoutExercise.deleteWorkoutExercise(wE.id);
    });
    Workout.deleteWorkout(w.id);
  });

  const deletedUser = User.deleteUser(id);
  if (deletedUser.changes != 1) {
    return res.status(501).send("User delete failed! ");
  }
  res.status(201).send("Deleted");
});

export default router;
