import * as User from "../util/user.js";
import jwt from "jsonwebtoken";

function auth(req, res, next) {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).send("Unauthorized");
    }
    const token = jwt.verify(accessToken.split(" ")[1], "secret_key");

    const user = User.getUsersById(token.id);
    if (!user) {
      return res.status(403).send("Access denied");
    }
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (err) {
    res.status(500).send(err);
  }
}

export default auth;
