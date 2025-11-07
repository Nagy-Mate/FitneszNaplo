import db from "./database.js";

db.prepare(
  `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT)`
).run();

export const getUsers = () => db.prepare(`SELECT * FROM users`).all();

export const getUsersById = (id) =>
  db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);

export const getUsersByEmail = (email) =>
  db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

export const saveUser = (email, pwd) =>
  db
    .prepare(`INSERT INTO users (email, password) VALUES(?, ?)`)
    .run(email, pwd);

export const updateUser = (id, email, pwd) =>
  db
    .prepare(`UPDATE users SET email = ?, password = ? WHERE id = ?`)
    .run(email, pwd, id);

export const deleteUser = (id) =>
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
