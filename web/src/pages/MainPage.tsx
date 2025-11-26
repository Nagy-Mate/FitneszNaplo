import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import apiClient from "../api/apiClient";
import type { Workout } from "../types/Workout";
import "../styles/Main.css";
import { Link, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/tokenCheck";
import type { WeeklyStat } from "../types/WeeklyStat";
import { handleApiError } from "../utils/ErrorHandle";

function MainPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Array<Workout>>();
  const [allWTime, setAllWTime] = useState<number>();
  const [weeklyStat, setWeeklyStat] = useState<WeeklyStat>();

  useEffect(() => {
    if ((auth.accessToken && isTokenExpired(auth.accessToken)) || !auth.accessToken) {
      logout();
      navigate("/");
    } else {
      (async () => {
        try {
          const [workout, time, weekly] = await Promise.all([
            apiClient.get("/workouts", {
              headers: {
                Authorization: `Beare ${auth.accessToken}`,
              },
            }),
            apiClient.get("/statistics/allTime", {
              headers: {
                Authorization: `Beare ${auth.accessToken}`,
              },
            }),
            apiClient.get("/statistics/weeklyStat", {
              headers: {
                Authorization: `Beare ${auth.accessToken}`,
              },
            }),
          ]);

          if (workout.status === 200) {
            setWorkouts(workout.data);
          }
          if (time.status === 200) {
            setAllWTime(time.data.totalDuration);
          }
          if (weekly.status === 200) {
            setWeeklyStat(weekly.data);
          }
        } catch (err) {
          handleApiError(err, navigate, logout);
        }
      })();
    }
  }, [auth.accessToken]);

  const logoutBtn = () => {
    logout();
    navigate("/");
  };
  return (
    <>
      <nav className="navbar bg-body-white fixed-top">
        <div className="container-fluid">
          <a></a>
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
                Workouts
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

      {workouts && workouts.length > 0 ? (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total workout time</h3>
              <p>{allWTime} min</p>
            </div>

            <div className="stat-card">
              <h3>This week</h3>
              <p>Workout count: {weeklyStat?.workoutCount}</p>
              <p>Total volume: {weeklyStat?.totalVolume}</p>
            </div>
          </div>

          <div className="workout-container">
            <h2 className="workout-title">My Workouts</h2>

            <div className="workout-grid">
              {workouts.map((w) => (
                <Link
                  to={`/workout/${w.id}`}
                  key={w.id}
                  className="workout-card"
                >
                  <div className="workout-date">
                    📅 {new Date(w.date).toLocaleDateString()}
                  </div>

                  <div className="workout-duration">
                    ⏱️ Duration: <span>{w.duration} min</span>
                  </div>

                  <div className="workout-notes">
                    📝 {w.notes || "No notes added"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="no-workouts">
          <h2>No workouts yet</h2>
          <p>Start your fitness journey by creating your first workout!</p>
          <Link to="/create" className="btn btn-primary create-w-btn">
            ➕ Create Workout
          </Link>
        </div>
      )}
    </>
  );
}
export default MainPage;
