import { Router } from "express";
import auth from "../util/authentication.js";
import * as Statistic from "../util/statistic.js";

const router = Router();

router.get("/allTime", auth, (req, res) => {
  return res.status(200).send(Statistic.getAllWDuration(req.userId));
});

router.get("/weeklyStat", auth, (req, res) => {
  return res.status(200).send(Statistic.getWeeklyStat(req.userId));
});

export default router;
