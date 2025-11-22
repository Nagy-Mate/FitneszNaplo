import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect, useState } from "react";
import "../styles/CreateWorkout.css";
import { isTokenExpired } from "../utils/tokenCheck";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

function CreateWorkoutPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [eName, setEName] = useState<string>("");

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [duration, setDuration] = useState<number>(1);
  const [notes, seteNotes] = useState<string>("");

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/");
    }
  }, [auth.accessToken]);

  const saveE = async (e: React.FormEvent) => {
    e.preventDefault()
 
    if (eName.trim() !== "") {
      await apiClient
        .post("/exercises", JSON.stringify({ name: eName }))
        .then((res) => {
          if (res.status === 201 && !toast.isActive("succ")) {
            toast.success("Saved", { toastId: "succ" });
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
  return (
    <>
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
    </>
  );
}

export default CreateWorkoutPage;
