import { useEffect, useRef, useState } from "react";
import "../styles/LoginRegister.css";
import { Link, useNavigate } from "react-router";
import apiClient from "../api/apiClient.tsx";
import type { AxiosError } from "axios";
import { useAuth } from "../context/AuthProvider.tsx";
import icon from "../assets/fitIcon.png";

function LoginPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiClient.post(
        "/users/login",
        JSON.stringify({ email, password: pwd })
      );

      if (response.status == 200) {
        setAuth({
          accessToken: response.data.token,
          email: email
        });

        navigate("/home");
      }

      setEmail("");
      setPwd("");
    } catch (err) {
      const error = err as AxiosError;
      setEmail("")
      setPwd("")
      if (!error.response) {
        setErrMsg("No Server Response");
      } else if (error.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current?.focus();
    }
  };
  return (
    <div className="login-container">
      <section className="login-card">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}{" "}
        </p>

        <img alt="App logo" src={icon} className="logo" />
        <h1 className="title">Fit Notes</h1>
        <p className="subtitle">Lépj be!</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            ref={userRef}
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPwd(e.target.value)}
            value={pwd}
          />
          <button>Sign in</button>
        </form>

        <p className="s-text">
          Need an account? <Link to={"/register"}>Sign up</Link>
        </p>
      </section>
    </div>
  );
}
export default LoginPage;
