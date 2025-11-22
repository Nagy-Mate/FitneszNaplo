import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import type { Workout } from "../types/Workout";
import { useEffect, useState } from "react";
import { isTokenExpired } from "../utils/tokenCheck";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { Exercise } from "../types/Exercise";

function WorkoutExercisePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Array<Workout>>();
  const [exercises, setExercises] = useState<Array<Exercise>>();

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/");
    } else {
      (async () => {
        try {
          const [w, e] = await Promise.all([
            apiClient.get("/workouts", {
              headers: {
                Authorization: `Beare ${auth.accessToken}`,
              },
            }),
            apiClient.get("/exercises")
          ]);
          setWorkouts(w.data)
          setExercises(e.data)
        } catch (err) {
          const error = err as AxiosError;

          if (error.status === 404) {
            if (!toast.isActive("loginErr")) {
              toast.info("Workouts not found", { toastId: "loginErr" });
            }
          } else if (error.status === 401) {
            navigate("/");
          } else if (error.status === 403) {
            navigate("/");
          } else {
            navigate("/");
          }
        }
      })();
    }
  }, [auth.accessToken]);

  return <></>;
}
export default WorkoutExercisePage;
