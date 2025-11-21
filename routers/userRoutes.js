import { Router } from "express";
import * as User from "../util/user.js";
import jwt from "jsonwebtoken";
import auth from "../util/authentication.js";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing some data! ");
  }
  const user = User.getUsersByEmail(email);
  if (!user) {
    return res.status(401).send("Unauthorized");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).send("Unauthorized");
  }
  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "30m",
  });
  res.send({ token: token });
});

router.patch("/:id", auth, async (req, res) => {
  const id = +req.params.id;
  if (id != req.userId) {
    return res.status(401).send("Unauthorized");
  }
  const { email, password } = req.body;
  let user = User.getUsersById(id);
  let hashedPwd;
  if (password) {
    const salt = await bcrypt.genSalt(12);
    hashedPwd = await bcrypt.hash(password, salt);
  }

  User.updateUser(id, email || user.email, hashedPwd || user.password);

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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing data! ");
  }
  let user = User.getUsersByEmail(email);
  if (user) {
    return res.status(409).send("Email already exists");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPwd = await bcrypt.hash(password, salt);

  const savedUser = User.saveUser(email, hashedPwd);
  if (savedUser.changes != 1) {
    return res.status(500).send("User save failed! ");
  }
  user = User.getUsersById(savedUser.lastInsertRowid);
  delete user.password;
  res.status(201).json(user);
});

router.delete("/:id", auth, (req, res) => {
  const id = req.params.id;
  if (req.userId != id) {
    return res.status(401).send("Unauthorized");
  }
  const user = User.getUsersById(id);
  if (!user) {
    return res.status(404).send("User not found!");
  }

  const deletedUser = User.deleteUser(id);
  if (deletedUser.changes != 1) {
    return res.status(500).send("User delete failed! ");
  }
  res.status(204).send("Deleted");
});

export default router;
