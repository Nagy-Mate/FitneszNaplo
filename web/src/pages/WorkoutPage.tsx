import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Workout } from "../types/Workout";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthProvider";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { Exercise } from "../types/Exercise";
import type { WorkoutExercise } from "../types/WorkoutExercise";
import "../styles/Workout.css";
import { isTokenExpired } from "../utils/tokenCheck";

function WorkoutPage() {
  const { id } = useParams();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout>();
  const [exercises, setExercises] = useState<Array<Exercise>>();
  const [workoutE, setWorkoutE] = useState<Array<WorkoutExercise>>();

  useEffect(() => {
    if (!auth.accessToken || isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/login");
    } else {
      (async () => {
        await apiClient
          .get(`/workouts/${id}`, {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              setWorkout(res.data);
            }
          })
          .catch((e) => {
            const error = e as AxiosError;

            if (error.status === 404 && !toast.isActive("404Erro")) {
              toast.error("Workout not found", { toastId: "404Erro" });

              navigate("/home");
            } else {
              if (!toast.isActive("err")) {
                toast.error("Error", { toastId: "err" });
              }
              navigate("/home");
            }
          });
      })();
    }
  }, [id]);

  useEffect(() => {
    if (!workout) return;
    (async () => {
      try {
        const [exercises, workoutE] = await Promise.all([
          apiClient.get(`/exercises`),
          apiClient.get(`/workoutExercises/byWorkoutId/${workout.id}`, {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          }),
        ]);
        setExercises(exercises.data);
        setWorkoutE(workoutE.data);
      } catch (e) {
        if (!toast.isActive("error")) {
          toast.error("Error", { toastId: "error" });
        }
      }
    })();
  }, [workout]);

  if (!workout || !exercises || !workoutE) return <p>Loading...</p>;

  const mergedExercises = workoutE.map((wE) => {
    const ex = exercises.find((e) => e.id === wE.exerciseId);
    return {
      ...wE,
      name: ex ? ex.name : "Unknown exercise",
    };
  });
  return (
    <>
      <Link to={"/home"} className="btn btn-primary">
        Back
      </Link>
      <div className="workout-container">
        <div className="workout-card">
          <h2 className="workout-title">
            Workout – {new Date(workout.date).toLocaleDateString()}
          </h2>

          <p>
            <strong>Duration:</strong> {workout.duration} min
          </p>
          <p>
            <strong>Notes:</strong> {workout.notes || "No notes"}
          </p>

          <h3 className="exercise-subtitle">Exercises</h3>

          <div className="exercise-grid">
            {mergedExercises.map((ex) => (
              <div key={ex.id} className="exercise-card">
                <h4 className="exercise-name">{ex.name}</h4>

                <p>
                  <strong>Sets:</strong> {ex.sets}
                </p>
                <p>
                  <strong>Reps:</strong> {ex.reps}
                </p>
                <p>
                  <strong>Weight:</strong> {ex.weight} kg
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkoutPage;
