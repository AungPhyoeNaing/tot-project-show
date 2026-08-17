// src/components/auth/Login.jsx
import React, { useState } from "react";
import { getCsrfToken, login as authServiceLogin } from "../../api/authService";
import { IoMailOpen } from "react-icons/io5";
import { LuKeySquare } from "react-icons/lu";
import "./login.css";

export default function Login({
  onLogin,
  onSwitchToRegister,
  onSwitchToPasswordResetRequest,
}) {
  // Add onSwitchToPasswordResetRequest prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await getCsrfToken();
      const response = await authServiceLogin(email, password);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : "Login failed. Please check your credentials.";
      setError(errorMsg);
    }
  };

  return (
    <div className="w-full max-w-[28rem] mx-auto px-4 sm:px-15 py-8 sm:py-13 rounded-2xl cherry-bomb text-[#5978a4]">
      <div className="absolute top-7 right-2 sm:top-10 sm:right-13 aboutHover px-4 sm:px-5 py-2 sm:py-3 backdrop-blur-xl bg-white/20 shadow-xl outline-white outline-1 rounded-full text-sm sm:text-xl text-teamcolor font-bold cursor-pointer">
        <a href="https://landingpage-tot.vercel.app/"> About Us &gt;</a>
      </div>

      <section className="auth-section absolute top-30 inset-4 lg:static">
        <div className="loginContainer outline-cyan-50 outline-1 rounded-3xl w-full mb-3 mx-auto px-5 sm:px-8 py-7 backdrop-blur-xl bg-white/20 shadow-xl">
          <span className="logoContainer w-20 h-20  flex items-center justify-center font-bold mx-auto mb-1">
            <img className="object-cover rounded-full" src="tot.jpg" alt="" />
          </span>
          <h2 className=" text-center text-3xl sm:text-4xl mb-2 cherry-bom text-transparent bg-teamcolor bg-clip-text  ">
            Welcome Back:D
          </h2>

          {error && (
            <div className="error-message text-red-600 text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="formContainer flex flex-col justify-center items-center"
          >
            <div className="emailContainer boxshadow1 w-full p-4 rounded-2xl flex justify-center items-center mb-4 ">
              <IoMailOpen className="mr-4 text-2xl text-black" />
              <input
                type="email"
                name="email"
                placeholder="Enter your ToT email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>
            <div className="pswContainer boxshadow1 w-full p-4 rounded-2xl flex justify-center items-center mb-1 ">
              <LuKeySquare className="mr-4 text-2xl text-black" />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:outline-0 w-full sm:w-63 focus:placeholder-teamcolor/20"
              />
            </div>

            {/* Link to Password Reset Request page */}
            <div className=" font-balthazar flex justify-center sm:justify-start items-center text-base sm:text-lg gap-2 px-2 mb-3 sm:-ml-37 font-bold">
              <p className="switch-link">Forgot? </p>
              <button
                type="button"
                onClick={onSwitchToPasswordResetRequest}
                className="cursor-pointer text-sm hover:underline"
              >
                Reset Password
              </button>
            </div>

            <button
              type="submit"
              className="btnHover border-2 border-teamcolor w-full rounded-2xl p-2 text-2xl bg-teamcolor text-white cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>

        <div className="switch-link flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-1 sm:gap-2 px-4 text-base sm:text-xl">
          <p> Newbie to ToT?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="cursor-pointer hover:underline"
          >
            Create your space
          </button>
        </div>
      </section>
    </div>
  );
}
