import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [otpWindow, setOtpWindow] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // Keep track of email

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await axios.post(
        `${baseUrl}/api/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setOtpWindow(true);
        setEmail(email); // Store email to use in OTP submission
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
        email,
        otp,
      });

      if (res.data.success) {
        navigate("/login");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleNavigateRegisterBtn = () => {
    navigate("/login");
  };

  return (
    <div className="w-full min-h-[600px] flex justify-center items-center">
      <div className="w-[90%] min-h-[200px] p-5 rounded-3xl flex justify-center items-center">
        <div className="w-[70%] h-full flex flex-col justify-center items-center">
          <h1 className="text-[50px] font-semibold dark:text-white text-slate-900 font-[Poppins]">
            <span className="text-3xl font-bold text-red-500 font-[lato]">
              NX
            </span>
            THREADS
          </h1>
          <h1 className="text-md font-normal text-slate-600 dark:text-white">
            Sharing Stories, One Post at a Time
          </h1>
        </div>

        {otpWindow ? (
          <div className="w-[30%] h-full flex justify-center items-center">
            <form
              className="w-full h-full flex flex-col justify-center items-start gap-5"
              onSubmit={handleOtpVerification}
            >
              <div className="w-full h-20 flex justify-start items-center">
                <h1 className="font-bold text-slate-900 text-3xl">
                  OTP Verification
                </h1>
              </div>
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
              <button
                type="submit"
                className="bg-transparent border border-slate-400 px-3 py-1 text-sm rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
              >
                Verify OTP
              </button>
              <h1>
                Already have an account?{" "}
                <span
                  onClick={handleNavigateRegisterBtn}
                  className="text-blue-500 font-semibold hover:text-blue-400 cursor-pointer"
                >
                  Login
                </span>
              </h1>
            </form>
          </div>
        ) : (
          <div className="w-[30%] h-full flex justify-center items-center">
            <form
              className="w-full h-full flex flex-col justify-center items-start gap-5"
              onSubmit={handleRegistration}
            >
              <div className="w-full h-20 flex justify-start items-center">
                <h1 className="font-bold text-slate-900 text-3xl">Register</h1>
              </div>
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="text"
                name="username"
                placeholder="Username"
                required
              />
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="email"
                name="email"
                placeholder="Email"
                required
              />
              <input
                className="w-[80%] h-[40px] bg-slate-200 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="password"
                name="password"
                placeholder="Password"
                required
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
              <button
                type="submit"
                className="bg-transparent border border-slate-400 px-3 py-1 text-sm rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
              >
                Next
              </button>
              <h1>
                Already have an account?{" "}
                <span
                  onClick={handleNavigateRegisterBtn}
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
