import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const FormInput = ({
  type,
  placeholder,
  value,
  onChange,
  showPassword,
  togglePassword,
  name,
}) => {
  return (
    <div className="relative mb-4">
      <input
        type={showPassword && type === "password" ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
        name={name}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

const DotsIndicator = () => {
  return (
    <div className="flex justify-center space-x-2 mt-8">
      <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-white/50 rounded-full"></div>
      <div className="w-3 h-3 bg-white/50 rounded-full"></div>
      <div className="w-3 h-3 bg-white/50 rounded-full"></div>
    </div>
  );
};

function Login() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("example@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setCurrentUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    setError("");
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const res = await axios.post(
        `${baseUrl}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(res)
      if (res.data.success) {
        setCurrentUser({
          userId: res.data?.userInfo?.id,
          username: res.data?.userInfo?.username,
          email: res.data?.userInfo?.email,
          fullname: res.data?.userInfo?.fullname,
          gender: res.data?.userInfo?.gender,
          avatar: res.data?.userInfo?.avatar,
        });
        toast.success("Logged in successfully!");
        navigate(`/`);
      }
    } catch (error) {
      toast.error("Login failed!");
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center select-none p-4">
      <div className="w-full max-w-5xl bg-white overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[600px]">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
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

              {[...Array(5)].map((_, i) => (
                <div
                  key={`mountain-${i}`}
                  className="absolute bg-gradient-to-t from-gray-600/40 to-gray-400/20 animate-drift-mountains"
                  style={{
                    width: `${80 + Math.random() * 120}px`,
                    height: `${60 + Math.random() * 100}px`,
                    bottom: "0%",
                    left: `-${20 + Math.random() * 30}%`,
                    clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
                    animationDelay: `${i * 4}s`,
                    animationDuration: `${30 + Math.random() * 20}s`,
                  }}
                />
              ))}

              {[...Array(10)].map((_, i) => (
                <div
                  key={`bird-${i}`}
                  className="absolute animate-fly-birds"
                  style={{
                    top: `${15 + Math.random() * 40}%`,
                    left: `-${5 + Math.random() * 10}%`,
                    animationDelay: `${i * 2}s`,
                    animationDuration: `${15 + Math.random() * 10}s`,
                  }}
                >
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    className="text-white/30"
                  >
                    <path
                      d="M2 4 C4 2, 6 2, 8 4 C10 2, 12 2, 14 4"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ))}

              <div className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute top-32 right-16 w-3 h-3 bg-gray-300/40 rounded-full opacity-70 animate-bounce delay-500"></div>
              <div className="absolute bottom-40 left-20 w-5 h-5 bg-white/20 rounded-full opacity-50 animate-bounce delay-1000"></div>
              <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Welcome to NXTHREADS
              </h2>

              <p className="text-gray-300 text-center leading-relaxed max-w-sm">
                Share your stories and connect with creative minds from around
                the world. Your journey begins here.
              </p>

              <DotsIndicator />
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center bg-gray-50">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  NXTHREADS
                </h1>
                <p className="text-gray-600">Welcome to NXTHREADS</p>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Users name or Email
                    </label>
                    <FormInput
                      type="text"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Password
                    </label>
                    <FormInput
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      showPassword={showPassword}
                      togglePassword={togglePassword}
                    />
                    <div className="text-right mt-2">
                      <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600">
                    New to NXTHREADS?{" "}
                    <a
                      href="/register"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create Account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {" "}
        jsx
        {`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gentle-sway {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(1deg);
          }
          75% {
            transform: rotate(-1deg);
          }
        }

        @keyframes leaf-sway {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes drift-clouds {
          0% {
            transform: translateX(-100px) translateY(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-10px);
            opacity: 0;
          }
        }

        @keyframes drift-mountains {
          0% {
            transform: translateX(-150px);
            opacity: 0.8;
          }
          100% {
            transform: translateX(calc(100vw + 150px));
            opacity: 0.2;
          }
        }

        @keyframes fly-birds {
          0% {
            transform: translateX(-20px) translateY(0px);
            opacity: 0;
          }
          25% {
            transform: translateX(25vw) translateY(-5px);
            opacity: 0.8;
          }
          50% {
            transform: translateX(50vw) translateY(2px);
            opacity: 0.6;
          }
          75% {
            transform: translateX(75vw) translateY(-3px);
            opacity: 0.4;
          }
          100% {
            transform: translateX(calc(100vw + 20px)) translateY(-8px);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-gentle-sway {
          animation: gentle-sway 4s ease-in-out infinite;
        }
        .animate-leaf-sway {
          animation: leaf-sway 2s ease-in-out infinite;
        }
        .animate-drift-clouds {
          animation: drift-clouds linear infinite;
        }
        .animate-drift-mountains {
          animation: drift-mountains linear infinite;
        }
        .animate-fly-birds {
          animation: fly-birds linear infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}
      </style>
    </div>
  );
}

export default Login;
