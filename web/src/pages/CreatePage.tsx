import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import React, { useEffect, useState } from "react";
import "../styles/Create.css";
import { isTokenExpired } from "../utils/tokenCheck";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import type { Exercise } from "../types/Exercise";
import type { Workout } from "../types/Workout";
import { handleApiError } from "../utils/ErrorHandle";

function CreatePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [eName, setEName] = useState<string>("");

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [duration, setDuration] = useState<string>("");
  const [notes, seteNotes] = useState<string>("");

  const [exercises, setExercises] = useState<Array<Exercise>>();
  const [exerciseDeleteId, setExerciseDeleteId] = useState<number>();

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  const [saved, setSaved] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    if ((auth.accessToken && isTokenExpired(auth.accessToken)) || !auth.accessToken) {
      logout();
      navigate("/");
    } else {
      (async () => {
        await apiClient
          .get("/exercises")
          .then((res) => {
            if (res.status == 200) {
              setExercises(res.data);
            }
          })
          .catch((e) => {
            handleApiError(e, navigate, logout);
          });
      })();
    }
  }, [auth.accessToken, refreshFlag]);

  useEffect(() => {
    if (!saved) return;
    (async () => {
      try {
        const res = await apiClient.get("/workouts", {
          headers: {
            Authorization: `Beare ${auth.accessToken}`,
          },
        });

        if (res.status === 200) {
          setWorkouts(res.data);
        }
      } catch (err) {
        handleApiError(err, navigate, logout);
      }
    })();
    setSaved(false);
  }, [auth.accessToken, saved]);

  const saveE = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eName.trim() !== "") {
      await apiClient
        .post("/exercises", JSON.stringify({ name: eName }))
        .then((res) => {
          if (res.status === 201 && !toast.isActive("succ")) {
            toast.success("Saved", { toastId: "succ" });

            setRefreshFlag((prev) => !prev);
          }
        })
        .catch((e) => {
          handleApiError(e, navigate, logout);
        });
      setEName("");
    } else {
      if (!toast.isActive("err"))
        toast.error("Enter exercie name", { toastId: "err" });
    }
  };

  const saveW = async (e: React.FormEvent) => {
    e.preventDefault();
    const dur = Number(duration);

    if (dur < 1 || dur > 360 || notes.trim() === "") {
      if (!toast.isActive("invalidInput")) {
        toast.error("Invalid input", { toastId: "invalidInput" });
      }
    } else {
      await apiClient
        .post("/workouts", JSON.stringify({ date, duration: dur, notes }), {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 204 && !toast.isActive("saved")) {
            toast.success("Workout saved");
            setSaved(true);
          }
        })
        .catch((e) => {
          handleApiError(e, navigate, logout);
        });
      setDuration("");
      seteNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  };

  const deleteExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseDeleteId) {
      if (!toast.isActive("error")) {
        toast.error("Select an exercise");
      }
    } else {
      await apiClient
        .delete(`/exercises/${exerciseDeleteId}`)
        .then((res) => {
          if (res.status === 204 && !toast.isActive("deleted")) {
            toast.success("Deleted");
            setExerciseDeleteId(undefined);
            setRefreshFlag((prev) => !prev);
          }
        })
        .catch((e) => {
          handleApiError(e, navigate, logout);
        });
    }
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
                Create workout & exercise
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

      <div className="exercise-management-wrapper">
        <div className="createE-group">
          <form onSubmit={saveE}>
            <h2>Create Exercise</h2>

            <label className="label">Exercise name</label>
            <input
              type="text"
              className="eInput"
              placeholder="Exercise name"
              onChange={(e) => setEName(e.target.value)}
              value={eName}
            />
            <button className="btn btn-primary" type="button" onClick={saveE}>
              Save Exercise
            </button>
          </form>
        </div>

        <div className="delete-exercise-container">
          <form onSubmit={deleteExercise}>
            <h2>Delete Exercise</h2>

            <select
              className="delete-select"
              onChange={(e) => setExerciseDeleteId(Number(e.target.value))}
              value={exerciseDeleteId ?? ""}
              required
            >
              <option key={""} value="" disabled hidden>
                -- Select exercise --
              </option>
              {exercises?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            <button className="delete-exercise-btn">Delete Exercise</button>
          </form>
        </div>

        <div className="createW-group">
          <form onSubmit={saveW} className="form-box">
            <h2>Create Workout</h2>
            <label className="label">Date</label>
            <input
              type="date"
              onChange={(e) =>
                setDate(new Date(e.target.value).toISOString().split("T")[0])
              }
              value={date}
              className="input"
            />

            <label className="label">Duration (seconds)</label>
            <input
              type="number"
              min={1}
              max={360}
              onChange={(e) => setDuration(e.target.value)}
              value={duration}
              className="input"
            />

            <label className="label">Notes</label>
            <input
              type="text"
              onChange={(e) => seteNotes(e.target.value)}
              value={notes}
              className="input"
              placeholder="Notes..."
            />

            <button className="btn btn-primary save-btn">Save Workout</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePage;
