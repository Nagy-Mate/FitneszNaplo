import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import React, { useEffect, useState } from "react";
import "../styles/Create.css";
import { isTokenExpired } from "../utils/tokenCheck";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { Exercise } from "../types/Exercise";
import type { Workout } from "../types/Workout";

function CreatePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [eName, setEName] = useState<string>("");

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [duration, setDuration] = useState<number>(1);
  const [notes, seteNotes] = useState<string>("");

  const [exercises, setExercises] = useState<Array<Exercise>>();
  const [exerciseDeleteId, setExerciseDeleteId] = useState<number>();

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
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
          .catch((e) => {});
      })();
    }
  }, [auth.accessToken]);

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
  }, []);

  const saveE = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eName.trim() !== "") {
      await apiClient
        .post("/exercises", JSON.stringify({ name: eName }))
        .then((res) => {
          if (res.status === 201 && !toast.isActive("succ")) {
            toast.success("Saved", { toastId: "succ" });

            window.location.reload();
          }
        })
        .catch((e) => {
          const error = e as AxiosError;
          console.log(error);

          if (error.status === 400) {
            if (!toast.isActive("err"))
              toast.error("Missing some data", { toastId: "err" });
          } else {
            if (!toast.isActive("err")) {
              toast.error("Error", { toastId: "err" });
            }
          }
        });
      setEName("");
    }
  };

  const saveW = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration < 1 || duration > 360 || notes.trim() === "") {
      if (!toast.isActive("invalidInput")) {
        toast.error("Invalid input", { toastId: "invalidInput" });
      }
    } else {
      await apiClient
        .post("/workouts", JSON.stringify({ date, duration, notes }), {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 204 && !toast.isActive("saved")) {
            toast.success("Workout saved");
            setSaved(true);
          }
        })
        .catch((e) => {
          const error = e as AxiosError;
          if (error.status === 400 && !toast.isActive("saveErr")) {
            toast.error("Missing data");
          } else if (error.status === 401 && !toast.isActive("saveErr")) {
            toast.error("Unauthorized");
          } else {
            if (!toast.isActive("saveErr")) {
              toast.error("Save failed");
            }
          }
        });
      setDuration(1);
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
            window.location.reload();
          }
        })
        .catch(() => {
          if (!toast.isActive("error")) {
            toast.error("Delete failed");
          }
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
                    {workouts?.map((w) => (
                      <li>
                        <Link className="dropdown-item" to={`/workout/${w.id}`}>
                          {new Date(w.date).toDateString()} - {w.notes}
                        </Link>
                      </li>
                    ))}
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
              <option value="" disabled hidden>
                -- Select exercise --
              </option>
              {exercises?.map((e) => (
                <option value={e.id}>{e.name}</option>
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
              onChange={(e) => setDuration(Number(e.target.value))}
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
