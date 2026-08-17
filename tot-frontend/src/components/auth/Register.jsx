// src/components/auth/Register.jsx
import React, { useState } from "react";
import {
  getCsrfToken,
  register as authServiceRegister,
} from "../../api/authService";
import { IoMailOpen } from "react-icons/io5";
import "./login.css";
import { FaUserPen } from "react-icons/fa6";
import { RiDoorLockLine } from "react-icons/ri";
import { RiDoorLockFill } from "react-icons/ri";

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // This will be the @tot.com email
  const [recovery_email, setRecoveryEmail] = useState(""); // Add state for recovery email
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    try {
      await getCsrfToken();
      // Pass the recovery_email to the API call
      const response = await authServiceRegister(
        name,
        email,
        recovery_email, // Include recovery_email
        password,
        passwordConfirmation,
      );
      onRegister(response.data.token, response.data.user);
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : "Registration failed. Please try again.";
      setError(errorMsg);
    }
  };

  return (
    <div className="w-full max-w-[30rem] mx-auto p-4 sm:p-7 rounded-2xl cherry-bomb text-teamcolor">
      {error && (
        <div className="error-message text-red-600 text-center">{error}</div>
      )}
      <div className="absolute aboutHover top-7 right-2 sm:top-10 sm:right-13 px-4 sm:px-5 py-2 sm:py-3 backdrop-blur-xl bg-white/20 shadow-xl outline-white outline-1 rounded-full text-sm sm:text-xl text-teamcolor font-bold cursor-pointer">
        <a href="https://landingpage-tot.vercel.app/"> About Us &gt;</a>
      </div>
      <section className="auth-section absolute top-30 inset-4 lg:static">
        <div className="loginContainer outline-cyan-50 outline-1 rounded-3xl w-full mb-3 mx-auto px-5 sm:px-9 py-3  backdrop-blur-xl bg-white/20 shadow-xl">
          <span className="logoContainer w-18 h-18 rounded-full  flex items-center justify-center font-bold mx-auto">
            <img className="object-cover rounded-full" src="tot.jpg" alt="" />
          </span>
          <h2 className=" text-center text-3xl sm:text-4xl mb-1 cherry-bom text-transparent bg-[rgb(57,78,106)]/60 bg-clip-text [text-shadow:_0px_3px_2px_rgb(89_120_164_/_0.5)]">
            Welcome:D
          </h2>

          <form
            onSubmit={handleSubmit}
            className="formContainer flex flex-col justify-center items-center"
          >
            <div className="nameContainer boxshadow1 w-full px-5 py-3 rounded-2xl flex justify-center items-center mb-2 ">
              <FaUserPen className="mr-5 text-2xl text-black" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            <div className="totmailContainer boxshadow1 w-full px-5 py-3 rounded-2xl flex justify-center items-center mb-2 ">
              <IoMailOpen className="mr-5 text-2xl text-black" />
              <input
                type="email"
                name="email"
                placeholder="ToT mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            {/* Add the recovery email input field */}
            <div className="emailContainer boxshadow1 w-full px-5 py-3 rounded-2xl flex justify-center items-center mb-2 ">
              <IoMailOpen className="mr-5 text-2xl text-black" />
              <input
                type="email"
                name="recovery_email"
                placeholder="Recovery Email (!Important. You need a valid gmail here)"
                value={recovery_email}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            <div className="pswContainer boxshadow1 w-full px-5 py-3 rounded-2xl flex justify-center items-center mb-2">
              <RiDoorLockLine className="mr-5 text-2xl text-black" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            <div className="pswContainer boxshadow1 w-full px-5 py-3 rounded-2xl flex justify-center items-center mb-2">
              <RiDoorLockFill className="mr-5 text-2xl text-black" />
              <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            <button
              type="submit"
              className="btnHover border-2 border-teamcolor w-full rounded-2xl py-1 px-2 text-2xl  bg-teamcolor text-white cursor-pointer"
            >
              Register
            </button>
          </form>
        </div>

        <div className="switch-link flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-1 sm:gap-2 px-4 text-base sm:text-xl">
          <p className="switch-link">Already Trendsmate? </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="cursor-pointer hover:underline"
          >
            Back to your space
          </button>
        </div>
      </section>
    </div>
  );
}
