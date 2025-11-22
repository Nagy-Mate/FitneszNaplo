import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const [selectedEId, setSelectedEId] = useState<number>();
  const [sets, setSets] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/");
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
  }, [id, auth.accessToken]);

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

  const saveE = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedEId);
    if (
      !selectedEId ||
      Number(sets) < 1 ||
      Number(reps) < 1 ||
      Number(weight) < 1
    ) {
      if (!toast.isActive("select"))
        toast.error("Select an exercise", { toastId: "select" });
    } else {
      await apiClient
        .post(
          "/workoutExercises",
          JSON.stringify({
            workoutId: workout.id,
            exerciseId: selectedEId,
            sets,
            reps,
            weight,
          }),
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        )
        .then((res) => {
          if (res.status === 204 && !toast.isActive("saved")) {
            toast.success("Saved", { toastId: "saved" });
            window.location.reload();
          }
        })
        .catch((e) => {
          console.error(e);
          if (!toast.isActive("failed")) {
            toast.error("Save failed", { toastId: "failed" });
          }
        });
    }
  };

  const deleteW = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient
      .delete(`/workouts/${workout.id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      .then((res) => {
        if (res.status === 204 && !toast.isActive("deleted")) {
          toast.success("Workout deleted", { toastId: "deleted" });
          navigate("/home");
        }
      })
      .catch((e) => {
        if (!toast.isActive("deleted")) {
          toast.error("Delete failed", { toastId: "deleted" });
        }
      });
  };
  return (
    <>
      <div className="add-exercise-container">
        <h3>Add exercise to workout</h3>

        <form onSubmit={saveE}>
          <select
            onChange={(e) => setSelectedEId(Number(e.target.value))}
            value={selectedEId ?? ""}
            required
          >
            <option value="" disabled hidden>
              -- Select exercise --
            </option>
            {exercises.map((e) => (
              <option value={e.id}>{e.name}</option>
            ))}
          </select>

          <div className="compact-row">
            <input
              type="number"
              className="compact-input"
              placeholder="Sets"
              min={1}
              max={50}
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
            />
            <input
              type="number"
              className="compact-input"
              placeholder="Reps"
              min={1}
              max={500}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />
            <input
              type="number"
              className="compact-input"
              placeholder="kg"
              min={1}
              max={2000}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          <button>Add exercise</button>
        </form>
      </div>

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
      <div>
        <button
          className="delete-workout-btn"
          onClick={() => setShowPopup(true)}
        >
          Delete Workout
        </button>
      </div>

      <div className={`popup-overlay ${showPopup ? "show" : ""}`}>
        <div className={`custom-confirm ${showPopup ? "show" : ""}`}>
          <h3>Delete Workout</h3>
          <p>Are you sure you want to delete this workout?</p>

          <div className="confirm-buttons">
            <button className="btn btn-danger" onClick={deleteW}>
              Delete
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkoutPage;
