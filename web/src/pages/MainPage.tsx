import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiClient from "../api/apiClient";
import type { Workout } from "../types/Workout";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

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
      <h1>Main page xd</h1>
      {workouts?.map((w) => (
        <p>{w.id + " " + w.duration + " " + w.date}</p>
      ))}
    </>
  );
}
export default MainPage;
