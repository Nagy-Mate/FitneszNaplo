import { useEffect, useRef, useState } from "react";
import logo from "../assets/RedCupLogo.png";
import "../styles/LoginPage.css";
import { Link } from "react-router";
import apiClient from "../api/apiClient.tsx";
import type { AxiosError } from "axios";
import { useAuth } from "../auth/AuthProvider";

function LoginPage() {
  const { setAuth } = useAuth();

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
        JSON.stringify({ email, password: pwd})
      );
      setAuth({
        accessToken: response.data.token,
        email: email,
      });

      setEmail("");
      setPwd("");
    } catch (err) {
      const error = err as AxiosError;
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

        <img src={logo} alt="App logo" className="logo" />
        <h1 className="title">RedCup</h1>
        <p className="subtitle">Lépj be, és kezdődhet a buli!</p>

        <form className="login-form" onSubmit={handleSubmit}>
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
        <Link to={"/homePage"}>
          <button className="skip-button">Skip </button>
        </Link>
        <p className="signup-text">
          Need an account? <Link to={"/register"}>Sign up</Link>
        </p>
      </section>
    </div>
  );
}
export default LoginPage;
