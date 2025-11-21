import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect, useState } from "react";
import "../styles/CreateWorkout.css";
import { isTokenExpired } from "../utils/tokenCheck";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

function CreateWorkoutPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [eName, setEName] = useState<string>("");

  useEffect(() => {
    if (!auth.accessToken || isTokenExpired(auth.accessToken)) {
      navigate("/login");
    }
  }, []);

  const saveE = async () => {
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
    }
  };
  return (
    <>
      <div className="input-groupE">
        <input
          type="text"
          className="eInput"
          placeholder="Exercise name"
          onChange={(e) => setEName(e.target.value)}
        />
        <button className="btn btn-primary" type="button" onClick={saveE}>
          Button
        </button>
      </div>
    </>
  );
}

export default CreateWorkoutPage;
