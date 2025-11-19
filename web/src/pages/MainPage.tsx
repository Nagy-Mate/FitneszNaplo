import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiClient from "../api/apiClient";
import type { Workout } from "../types/Workout";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import "../styles/MainPage.css"

function MainPage() {
  const { auth } = useAuth();

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  useEffect(() => {
    (async () => {
      console.log(auth.accessToken);
      try {
        const res = await apiClient.get("/workouts", {
          headers: {
            Authorization: `Beare ${auth.accessToken}`,
          },
        });
        console.log(res.status);
        if (res.status === 200) {
          setWorkouts(res.data);
        }
      } catch (err) {
        const error = err as AxiosError;
        console.error(error);
        if (error.status === 404) {
          if (!toast.isActive("loginErr")) {
            toast.info("Workouts not found", { toastId: "loginErr" });
          }
        } else if (error.status === 401) {
          if (!toast.isActive("loginErr")) {
            toast.error("Unauthorized", { toastId: "loginErr" });
          }
        } else if (error.status === 403) {
          if (!toast.isActive("loginErr")) {
            toast.error("Access denied", { toastId: "loginErr" });
          }
        } else {
          if (!toast.isActive("loginErr")) {
            toast.error("Server error", { toastId: "loginErr" });
          }
        }
      }
    })();
  }, []);
  return (
    <>
   <div className="workout-container">
      <h2 className="workout-title">My Workouts</h2>

      <div className="workout-grid">
        {workouts?.map((w) => (
          <div key={w.id} className="workout-card">
            <div className="workout-date">
              📅 {new Date(w.date).toLocaleDateString()}
            </div>

            <div className="workout-duration">
              ⏱️ Duration: <span>{w.duration} min</span>
            </div>

            <div className="workout-notes">
              📝 {w.notes || "No notes added"}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
export default MainPage;
