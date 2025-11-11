import express from "express";
import cors from "cors";
import userRoutes from "./routers/userRoutes.js"
import workoutRoutes from "./routers/workoutRoutes.js"
import exerciseRoutes from "./routers/exerciseRoutes.js"
import workoutExerciseRoutes from "./routers/workoutExerciseRoutes.js"

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes)
app.use("/workouts", workoutRoutes)
app.use("/exercises", exerciseRoutes)
app.use("/workoutExercises", workoutExerciseRoutes)

app.use((err, req, res, next) => {
  if (err) res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`server runs on http://localhost:${PORT}`);
});