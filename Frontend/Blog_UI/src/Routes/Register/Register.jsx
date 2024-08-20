/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [otpWindow, setOtpWindow] = useState(false);
  const handleRegistration = async (e) => {
    setError("");
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          username,
          email,
          password,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        // console.log(res.data);
        setOtpWindow(true);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleNvaigateRegisterBtn = () => {
    navigate("/Login");
  };
  return (
    <div className="w-full min-h-[500px] border flex justify-center items-center">
      <div className="w-[90%] min-h-[200px] p-5 rounded-3xl border-2 border-slate-200 flex justify-center items-center bg-slate-100">
        <div className="w-[70%] h-full flex flex-col justify-center items-center">
          <h1 className="text-[50px] font-semibold text-slate-900 font-[Poppins]">
            <span className="text-3xl font-bold text-red-500 font-[lato]">
              NX
            </span>
            THREADS
          </h1>
          <h1 className="text-sm italic font-bold text-slate-600">
            Sharing Stories, One Post at a Time
          </h1>
        </div>
        {otpWindow && (
          <div className="w-[30%] h-full flex justify-center items-center">
            <form className="w-full h-full flex flex-col justify-center items-start gap-5">
              <div className="w-full h-20 flex justify-start items-center">
                <h1 className=" font-bold text-slate-900 text-3xl ">
                  Otp Window
                </h1>
              </div>
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="number"
                name="otp"
                placeholder="Otp Example 1234**"
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
              <button className="bg-transparent border border-slate-400 px-3 py-1 text-sm rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold">
                Begin Your Journey
              </button>
              <h1>
                Already have an account?{" "}
                <span
                  onClick={handleNvaigateRegisterBtn}
                  className="text-blue-500 font-semibold hover:text-blue-400 cursor-pointer"
                >
                  Login
                </span>
              </h1>
            </form>
          </div>
        )}
        {!otpWindow && (
          <div className="w-[30%] h-full flex justify-center items-center">
            <form
              className="w-full h-full flex flex-col justify-center items-start gap-5"
              onSubmit={handleRegistration}
            >
              <div className="w-full h-20 flex justify-start items-center">
                <h1 className=" font-bold text-slate-900 text-3xl ">
                  Register
                </h1>
              </div>
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="text"
                name="username"
                placeholder="Username"
              />
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="email"
                name="email"
                placeholder="Email"
              />
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="password"
                name="password"
                placeholder="Password"
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
              <button className="bg-transparent border border-slate-400 px-3 py-1 text-sm rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold">
                Next
              </button>
              <h1>
                Already have an account?{" "}
                <span
                  onClick={handleNvaigateRegisterBtn}
                  className="text-blue-500 font-semibold hover:text-blue-400 cursor-pointer"
                >
                  Login
                </span>
              </h1>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
