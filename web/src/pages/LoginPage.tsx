import { useState } from "react";
import "../styles/LoginRegister.css";
import { Link, useNavigate } from "react-router";
import apiClient from "../api/apiClient.tsx";
import { useAuth } from "../context/AuthProvider.tsx";
import icon from "../assets/fitIcon.png";
import type { JwtPayload } from "../types/JwtPayload.ts";
import { jwtDecode } from "jwt-decode";
import { handleApiError } from "../utils/ErrorHandle";

function LoginPage() {
  const { setAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiClient.post(
        "/users/login",
        JSON.stringify({ email, password: pwd })
      );

      if (response.status == 200) {
        const decoded = jwtDecode<JwtPayload>(response.data.token);
        setAuth({
          accessToken: response.data.token,
          email: decoded.email,
          id: decoded.id,
        });

        navigate("/home");
      }
    } catch (err) {
      handleApiError(err, navigate, logout);
    }
    setEmail("");
    setPwd("");
  };
  return (
    <div className="login-container">
      <section className="login-card">
        <img alt="App logo" src={icon} className="logo" />
        <h1 className="title">Fit Notes</h1>
        <p className="subtitle">Lépj be!</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
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
