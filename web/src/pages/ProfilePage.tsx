import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { isTokenExpired } from "../utils/tokenCheck";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Profile.css";
import type { Workout } from "../types/Workout";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function ProfilePage() {
  const { auth, logout, setAuth } = useAuth();
  const navigate = useNavigate();

  const errRef = useRef<HTMLInputElement>(null);

  const [pwd, setPwd] = useState<string>("");
  const [validPwd, setValidPwd] = useState<boolean>(false);
  const [pwdFocus, setPwdFocus] = useState<boolean>(false);

  const [matchPwd, setMatchPwd] = useState<string>("");
  const [validMatch, setValidMatch] = useState<boolean>(false);
  const [matchFocus, setMatchFocus] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [validEmail, setValidEmail] = useState<boolean>(false);
  const [emailFocus, setEmailFocus] = useState<boolean>(false);

  const [pwdConfirm, setPwdConfirm] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const [workouts, setWorkouts] = useState<Array<Workout>>();

  useEffect(() => {
    if (auth.accessToken && isTokenExpired(auth.accessToken)) {
      logout();
      navigate("/");
    }else{
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

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = pwd.trim();
    const v3 = PWD_REGEX.test(password);

    if (!v3 && !toast.isActive("invalidPwd")) {
      toast.error("Invalid password", { toastId: "invalidPwd" });
      return;
    }
    try {
      await apiClient
        .patch(`/users/${auth.id}`, JSON.stringify({ password }), {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 200 && !toast.isActive("pwdSaved")) {
            toast.success("Password saved", { toastId: "pwdSaved" });
            setPwd("");
            setMatchPwd("");
          }
        });
    } catch (err) {
      const error = err as AxiosError;

      if (!error.response && !toast.isActive("pwdErr")) {
        toast.error("No Server Response", { toastId: "pwdErr" });
      } else if (error.status === 401 && !toast.isActive("pwdErr")) {
        toast.error("Unauthorized", { toastId: "pwdErr" });
      } else {
        if (!toast.isActive("pwdErr")) {
          toast.error("Password save failed", { toastId: "pwdErr" });
        }
      }
      errRef.current?.focus();
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const email2 = email.trim();
    const v2 = EMAIL_REGEX.test(email2);

    if (!v2 && !toast.isActive("invalidEmail")) {
      toast.error("Invalid Email", { toastId: "invalidEmail" });
      return;
    }
    if(email2 === auth.email && !toast.isActive("invalidEmail")){
      toast.error("Enter a new email")
      setEmail("")
      return
    }

    try {
      await apiClient
        .patch(`/users/${auth.id}`, JSON.stringify({ email: email2 }), {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 200 && !toast.isActive("emailSaved")) {
            setAuth({ email: email2 });
            setEmail("");
            toast.success("Email saved", { toastId: "emailSaved" });
          }
        });
    } catch (err) {
      const error = err as AxiosError;

      if (!error.response && !toast.isActive("emailErr")) {
        toast.error("No Server Response", { toastId: "emailErr" });
      } else if (error.status === 401 && !toast.isActive("emailErr")) {
        toast.error("Unauthorized", { toastId: "emailErr" });
      } else {
        if (!toast.isActive("emailErr")) {
          toast.error("Email save failed", { toastId: "emailErr" });
        }
      }
      errRef.current?.focus();
    }
  };

  const deleteUser = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      if (pwdConfirm.trim() === "") {
        if (!toast.isActive("pwdErr"))
          toast.error("Password required", { toastId: "pwdErr" });
        return;
      }

      try {
        await apiClient.delete(`/users/${auth.id}`, {
          data: { password: pwdConfirm },
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        toast.success("User deleted");
        setPwdConfirm("");
        logout();
        navigate("/");
      } catch {
        if (!toast.isActive("pwdErr")) {
          toast.error("Invalid password", { toastId: "pwdErr" });
          setPwdConfirm("");
        }
      }
    })();
  };

  const logoutBtn = () => {
    logout();
    navigate("/");
  };
  return (
    <>
      <nav className="navbar bg-body-white fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to={"/home"}>
            Home
          </Link>
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
                Profile
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
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Workouts
                  </a>
                  <ul className="dropdown-menu">
                    {workouts?.map((w) => (
                      <li>
                        <Link className="dropdown-item" to={`/workout/${w.id}`}>
                          {new Date(w.date).toDateString()} - {w.notes}
                        </Link>
                      </li>
                    ))}
                  </ul>
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

      <div className="profile-container">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-email">User email: {auth?.email}</div>

        <form onSubmit={changePwd} className="pForm">
          <p>Change Password: </p>

          <div>
            <input
              type="password"
              className="pwdInput"
              placeholder="Password"
              id="pwd"
              autoComplete="off"
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
            Must include uppercase and lowercase letters, a number and a special
            character.
            <br />
            Allowed special characters:{" "}
            <span aria-label="exclamation mark">!</span>{" "}
            <span aria-label="at symbol">@</span>{" "}
            <span aria-label="hashtag">#</span>{" "}
            <span aria-label="dollar sign">$</span>{" "}
            <span aria-label="percent">%</span>
          </p>

          <div>
            <input
              type="password"
              className="pwdInput"
              placeholder="Password again"
              autoComplete="off"
              id="confirmPwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
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
            className={matchFocus && !validMatch ? "instructions" : "offscreen"}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            Must match the first password input field.
          </p>

          <button
            className="btn btn-primary saveBtn"
            disabled={!validPwd || !validMatch ? true : false}
          >
            Save password
          </button>
        </form>

        <form onSubmit={changeEmail} className="pForm">
          <p>Change email: </p>
          <div>
            <input
              className="pwdInput"
              type="email"
              placeholder="Email"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
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
              emailFocus && email && !validEmail ? "instructions" : "offscreen"
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            Please enter a valid email address. <br />
            Example: user@example.com
          </p>
          <button
            className="btn btn-primary saveBtn"
            disabled={!validEmail ? true : false}
          >
            Save email
          </button>
        </form>

        <button className="btn btn-danger btn-del-user" onClick={() => setShowPopup(true)}>
          Delte User
        </button>

        <div className={`popup-overlay ${showPopup ? "show" : ""}`}>
          <div className={`custom-confirm ${showPopup ? "show" : ""}`}>
            <h3>Delete Account</h3>
            <p>Please enter your password to confirm deletion</p>

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPwdConfirm(e.target.value)}
              className="custom-input"
            />

            <div className="confirm-buttons">
              <button className="btn btn-danger" onClick={deleteUser}>
                Delete
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ProfilePage;
