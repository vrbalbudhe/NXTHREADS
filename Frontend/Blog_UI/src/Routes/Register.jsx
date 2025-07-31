import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [otpWindow, setOtpWindow] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${baseUrl}/api/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        setOtpWindow(true);
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
    <div className="w-full min-h-screen flex bg-white items-center justify-center select-none">
      <div className="w-full overflow-hidden">
        <div className="w-full h-full flex justify-center items-center md:flex-row flex-col">
          <div className=" md:h-screen bg-red-400 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={`cloud-${i}`}
                  className="absolute bg-white/20 rounded-full blur-sm animate-drift-clouds"
                  style={{
                    width: `${40 + Math.random() * 80}px`,
                    height: `${20 + Math.random() * 40}px`,
                    top: `${10 + Math.random() * 30}%`,
                    left: `-${10 + Math.random() * 20}%`,
                    animationDelay: `${i * 3}s`,
                    animationDuration: `${20 + Math.random() * 15}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Welcome to NXTHREADS
              </h2>
              <p className="text-gray-300 text-center leading-relaxed max-w-sm">
                Share your stories and connect with creative minds from around
                the world. Your journey begins here.
              </p>
            </div>
          </div>

          <div className="p-12 w-full md:w-2/5 flex flex-col justify-center bg-gray-50">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  NXTHREADS
                </h1>
                <p className="text-gray-600">Create your account</p>
              </div>

              {otpWindow ? (
                <form onSubmit={handleOtpVerification} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg"
                  >
                    Verify OTP
                  </button>
                  <p className="text-center text-gray-600">
                    Already have an account?{" "}
                    <span
                      onClick={handleNavigateRegisterBtn}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                    >
                      Login
                    </span>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegistration} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg"
                  >
                    Next
                  </button>
                  <p className="text-center text-gray-600">
                    Already have an account?{" "}
                    <span
                      onClick={handleNavigateRegisterBtn}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                    >
                      Login
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
