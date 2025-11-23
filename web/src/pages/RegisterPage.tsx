import { useEffect, useState } from "react";
import "../styles/LoginRegister.css";
import { Link, useNavigate } from "react-router";
import apiClient from "../api/apiClient.tsx";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import icon from "../assets/fitIcon.png";
import { toast } from "react-toastify";
import { handleApiError } from "../utils/ErrorHandle";
import {  useAuth } from "../context/AuthProvider.tsx";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const RegisterPage = () => {
  const navigate = useNavigate()
  const {logout} = useAuth();
  const [email, setEmail] = useState<string>("");
  const [validEmail, setValidEmail] = useState<boolean>(false);
  const [emailFocus, setEmailFocus] = useState<boolean>(false);

  const [pwd, setPwd] = useState<string>("");
  const [validPwd, setValidPwd] = useState<boolean>(false);
  const [pwdFocus, setPwdFocus] = useState<boolean>(false);

  const [matchPwd, setMatchPwd] = useState<string>("");
  const [validMatch, setValidMatch] = useState<boolean>(false);
  const [matchFocus, setMatchFocus] = useState<boolean>(false);

  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = pwd.trim();
    const email2 = email.trim();
    const v2 = EMAIL_REGEX.test(email2);
    const v3 = PWD_REGEX.test(password);
    if ((!v2 || !v3) && !toast.isActive("inputErr")) {
      toast.error("Invalid input", { toastId: "inputErr" });
      return;
    }
    try {
      await apiClient
        .post("/users/register", JSON.stringify({ password, email }))
        .then((res) => {
          if (res.status === 201) {
            setSuccess(true);
          }
        });
    } catch (err) {
      handleApiError(err, navigate, logout);
    }
    setEmail("");
    setPwd("");
    setMatchPwd("");
  };

  const CountdownRedirect = () => {
    const [countdown, setCountdown] = useState<number>(5);
    const navigate = useNavigate();

    useEffect(() => {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      if (countdown === 0) {
        navigate("/");
      }

      return () => clearInterval(timer);
    }, [countdown, navigate]);
    return (
      <p>
        Redirect to{" "}
        <span className="s-text">
          <Link to={"/"}>Login</Link>
        </span>{" "}
        in {countdown} s
      </p>
    );
  };

  return (
    <>
      {success ? (
        <div className="login-container">
          <section className="login-card">
            <h1>Success</h1>
            <CountdownRedirect />
          </section>
        </div>
      ) : (
        <div className="login-container">
          <section className="login-card">
            <img alt="App logo" src={icon} className="logo" />

            <h1 className="title">Register</h1>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Email"
                  id="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={validEmail ? "false" : "true"}
                  aria-describedby="uidnote"
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                />
                <FontAwesomeIcon
                  icon={validEmail ? faCheck : faTimes}
                  className={
                    !email
                      ? "hide"
                      : validEmail
                      ? "valid input-icon"
                      : "invalid input-icon"
                  }
                />
              </div>
              <p
                id="uidnote"
                className={
                  emailFocus && email && !validEmail
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Please enter a valid email address. <br />
                Example: user@example.com
              </p>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  id="password"
                  onChange={(e) => setPwd(e.target.value)}
                  value={pwd}
                  required
                  aria-invalid={validPwd ? "false" : "true"}
                  aria-describedby="pwdnote"
                  onFocus={() => setPwdFocus(true)}
                  onBlur={() => setPwdFocus(false)}
                />
                <FontAwesomeIcon
                  icon={validPwd ? faCheck : faTimes}
                  className={
                    !pwd
                      ? "hide"
                      : validPwd
                      ? "valid input-icon"
                      : "invalid input-icon"
                  }
                />
              </div>
              <p
                id="pwdnote"
                className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                8 to 24 characters.
                <br />
                Must include uppercase and lowercase letters, a number and a
                special character.
                <br />
                Allowed special characters:{" "}
                <span aria-label="exclamation mark">!</span>{" "}
                <span aria-label="at symbol">@</span>{" "}
                <span aria-label="hashtag">#</span>{" "}
                <span aria-label="dollar sign">$</span>{" "}
                <span aria-label="percent">%</span>
              </p>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  id="confirm_pwd"
                  onChange={(e) => setMatchPwd(e.target.value)}
                  value={matchPwd}
                  required
                  aria-invalid={validMatch ? "false" : "true"}
                  aria-describedby="confirmnote"
                  onFocus={() => setMatchFocus(true)}
                  onBlur={() => setMatchFocus(false)}
                />{" "}
                <FontAwesomeIcon
                  icon={validMatch ? faCheck : faTimes}
                  className={
                    !matchPwd
                      ? "hide"
                      : validMatch
                      ? "valid input-icon"
                      : "invalid input-icon"
                  }
                />
              </div>
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch ? "instructions" : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Must match the first password input field.
              </p>

              <button
                disabled={
                  !validPwd || !validEmail || !validMatch ? true : false
                }
              >
                Sign Up
              </button>
            </form>
            <p className="s-text">
              Already registered?
              <Link to={"/"}> Sign in </Link>
            </p>
          </section>
        </div>
      )}
    </>
  );
};
export default RegisterPage;