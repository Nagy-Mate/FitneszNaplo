import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import apiClient from "../api/apiClient";
import type { Workout } from "../types/Workout";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import "../styles/Main.css";
import { Link, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/tokenCheck";

function MainPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/");
    } else {
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

      <div className="workout-container">
        <h2 className="workout-title">My Workouts</h2>

        <div className="workout-grid">
          {workouts?.map((w) => (
            <Link to={`/workout/${w.id}`} key={w.id} className="workout-card">
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
  );
}
export default MainPage;
