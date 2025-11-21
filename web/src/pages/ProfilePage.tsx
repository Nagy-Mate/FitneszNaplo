import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { isTokenExpired } from "../utils/tokenCheck";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from "react-confirm-alert";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function ProfilePage() {
  const { auth, logout } = useAuth();
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

  useEffect(() => {
    if (!auth.accessToken || isTokenExpired(auth.accessToken)) {
      navigate("/login");
    }
  }, []);

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
    console.log("clicked");
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
    try {
      await apiClient
        .patch(`/users/${auth.id}`, JSON.stringify({ email: email2 }), {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        })
        .then((res) => {
          if (res.status === 200 && !toast.isActive("emailSaved")) {
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

  const deleteUser = async () => {
    confirmAlert({
      title: "Are you sure to delete this user.",
      message: "Confirm to submit",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await apiClient
              .delete(`/users/${auth.id}`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
              })
              .then((res) => {
                if (res.status === 204 && !toast.isActive("delUser")) {
                  toast.success("User deleted", { toastId: "delUser" });
                  logout
                  navigate("login");
                }
              })
              .catch((e) => {
                const error = e as AxiosError;
                if (error.status === 401 && !toast.isActive("delUserErr")) {
                  toast.error("Unauthorized", { toastId: "delUserErr" });
                } else if (
                  error.status === 403 &&
                  !toast.isActive("delUserErr")
                ) {
                  toast.error("Unauthorized", { toastId: "delUserErr" });
                } else {
                  if (!toast.isActive("delUserErr")) {
                    toast.error("User delete Failed", {
                      toastId: "delUserErr",
                    });
                  }
                }
              });
          },
        },
        {
          label: "No",
        },
      ],
    });
  };
  return (
    <>
      <div>User email: {auth?.email}</div>

      <form onSubmit={changePwd}>
        <p>Change Password: </p>
        <div className="input-groupE">
          <div>
            <label htmlFor="eInput"></label>
            <input
              type="password"
              className="eInput"
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
              className="eInput"
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
            className="btn btn-primary"
            disabled={!validPwd || !validMatch ? true : false}
          >
            Save password
          </button>
        </div>
      </form>
      <form onSubmit={changeEmail}>
        <div className="input-group">
          <input
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
          className="btn btn-primary"
          disabled={!validEmail ? true : false}
        >
          Save email
        </button>
      </form>

      <button className="btn btn-danger" onClick={deleteUser}>
        Delte User
      </button>
    </>
  );
}
export default ProfilePage;
