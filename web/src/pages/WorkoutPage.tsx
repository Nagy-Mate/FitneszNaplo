import React, { useEffect, useState } from "react";
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

  const [selectedEId, setSelectedEId] = useState<number>();
  const [sets, setSets] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const [date, setDate] = useState<string>();
  const [duration, setDuration] = useState<string>("");
  const [notes, setNotes] = useState<string>();

  const [showPopupDW, setShowPopupDW] = useState<boolean>(false);
  const [showPopupDE, setShowPopupDE] = useState<boolean>(false);

  const [deleteEId, setDeleteEId] = useState<number>();

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  const [saved, setSaved] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

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
  }, [id, auth.accessToken, refreshFlag]);

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
  }, [workout, refreshFlag]);

  useEffect(() => {
    if (!saved) return;
    (async () => {
      try {
        const res = await apiClient.get("/workouts", {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (res.status === 200) {
          setWorkouts(res.data);
        }
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
    setSaved(false);
  }, [auth.accessToken]);

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
            sets: Number(sets),
            reps: Number(reps),
            weight: Number(weight),
          }),
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        )
        .then((res) => {
          if (res.status === 204 && !toast.isActive("saved")) {
            toast.success("Saved", { toastId: "saved" });
            setRefreshFlag((prev) => !prev);
          }
        })
        .catch((e) => {
          console.error(e);
          if (!toast.isActive("failed")) {
            toast.error("Save failed", { toastId: "failed" });
          }
        });
      setDeleteEId(undefined);
      setSets("");
      setReps("");
      setWeight("");
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
      .catch(() => {
        if (!toast.isActive("deleted")) {
          toast.error("Delete failed", { toastId: "deleted" });
        }
      });
  };

  const deleteWE = async () => {
    if (deleteEId) {
      await apiClient
        .delete(`/workoutExercises/${deleteEId}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 204) {
            setDeleteEId(undefined);
            setRefreshFlag((prev) => !prev);
          }
        })
        .catch((e) => {
          const error = e as AxiosError;
          setDeleteEId(undefined);

          if (error.status === 404 && !toast.isActive("dleErr")) {
            toast.error("Not found", { toastId: "delErr" });
          } else if (error.status === 401 && !toast.isActive("dleErr")) {
            toast.error("Unauthorized", { toastId: "delErr" });
          } else {
            if (!toast.isActive("dleErr")) {
              toast.error("Delete failed", { toastId: "delErr" });
            }
          }
        });
    } else {
      if (!toast.isActive("id")) {
        toast.error("Invalid id", { toastId: "id" });
      }
    }
  };

  const updateW = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, unknown> = {};

    if (date) payload.date = date;
    if (duration) payload.duration = Number(duration);
    if (notes) payload.notes = notes;

    if (Object.keys(payload).length === 0) {
      if (!toast.isActive("updateErr")) {
        toast.error("Enter at least one data to update", {
          toastId: "updateErr",
        });
      }
      return;
    }

    try {
      await apiClient.patch(`/workouts/${workout.id}`, payload, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      toast.success("Workout updated");
      setRefreshFlag((prev) => !prev);
    } catch {
      toast.error("Update failed");
    }
    setDate(undefined);
    setDuration("");
    setNotes(undefined);
  };

  const logoutBtn = () => {
    logout();
    navigate("/");
  };
  return (
    <>
      <nav className="navbar bg-body-white fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to={"/home"}>
            Home
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Workout
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <Link className="nav-link" to={"/create"}>
                    Create workout & exercise
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={"/profile"}>
                    Profile Page
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Workouts
                  </a>
                  <ul className="dropdown-menu">
                    {workouts && workouts.length > 0 ? (
                      <>
                        {workouts?.map((w) => (
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/workout/${w.id}`}
                            >
                              {new Date(w.date).toDateString()} - {w.notes}
                            </Link>
                          </li>
                        ))}
                      </>
                    ) : (
                      <>
                        <li className="dropdown-item">No workouts yet</li>
                      </>
                    )}
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link logout-link" onClick={logoutBtn}>
                    Log out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="add-exercise-container">
        <h3>Add exercise to workout</h3>

        <form onSubmit={saveE}>
          <select
            onChange={(e) => setSelectedEId(Number(e.target.value))}
            value={selectedEId ?? ""}
            required
          >
            <option key={""} value="" disabled hidden>
              -- Select exercise --
            </option>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
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

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setShowPopupDE(true);
                    setDeleteEId(ex.id);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="update-card">
        <h2 className="workout-title">Update this workout</h2>

        <form onSubmit={updateW} className="form-update">
          <label className="label">Date</label>
          <input
            type="date"
            onChange={(e) =>
              setDate(new Date(e.target.value).toISOString().split("T")[0])
            }
            value={date}
            className="input-update"
          />

          <label className="label">Duration (seconds)</label>
          <input
            type="number"
            min={1}
            max={360}
            onChange={(e) => setDuration(e.target.value)}
            value={duration}
            className="input-update"
          />

          <label className="label">Notes</label>
          <input
            type="text"
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
            className="input-update"
            placeholder="Notes..."
          />

          <button className="btn btn-primary save-btn">Save Workout</button>
        </form>
      </div>

      <div>
        <button
          className="delete-workout-btn"
          onClick={() => setShowPopupDW(true)}
        >
          Delete Workout
        </button>
      </div>

      <div className={`popup-overlay ${showPopupDW ? "show" : ""}`}>
        <div className={`custom-confirm ${showPopupDW ? "show" : ""}`}>
          <h3>Delete Workout</h3>
          <p>Are you sure you want to delete this workout?</p>

          <div className="confirm-buttons">
            <button className="btn btn-danger" onClick={deleteW}>
              Delete
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowPopupDW(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className={`popup-overlay ${showPopupDE ? "show" : ""}`}>
        <div className={`custom-confirm ${showPopupDE ? "show" : ""}`}>
          <h3>Delete exercise form this workout</h3>
          <p>Are you sure you want to delete this?</p>

          <div className="confirm-buttons">
            <button
              className="btn btn-danger"
              onClick={() => {
                deleteWE();
                setShowPopupDE(false);
              }}
            >
              Delete
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowPopupDE(false)}
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
