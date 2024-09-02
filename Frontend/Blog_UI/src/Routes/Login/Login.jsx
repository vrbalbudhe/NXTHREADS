import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

function Login() {
  const { updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    setError("");
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        updateUser(res.data);
        console.log(res.data);
        navigate(`/`);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleNvaigateLoginBtn = () => {
    navigate("/register");
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden">
      <div className="w-[100%] h-[650px] rounded-xl flex flex-col justify-center items-center mb-5">
        <div className="w-full h-full flex flex-wrap justify-center items-center gap-2 mt-5">
          <img
            className="rounded-xl w-[99%]"
            src="https://i.pinimg.com/236x/c9/5b/96/c95b9686616a33fc1a85c8c920504a94.jpg"
            alt=""
          />{" "}
        </div>
        <div className="w-[80%] h-[91%] absolute p-2  rounded-lg bg-opacity-50 flex justify-center items-center">
          <div className="w-[30%] h-full">
            <form
              className="w-full h-full flex flex-col justify-center items-start gap-5"
              onSubmit={handleLogin}
            >
              <div className="w-full h-10 flex justify-start items-center">
                <h1 className=" font-bold text-white text-lg ">Login</h1>
              </div>
              <input
                className="w-[90%] h-[40px] bg-slate-50 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="email"
                name="email"
                placeholder="Email"
              />
              <input
                className="w-[90%] h-[40px] bg-slate-50 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                type="password"
                name="password"
                placeholder="Password"
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
              <button
                type="submit"
                className="bg-transparent border text-blue-400 bg-white border-slate-400 px-3 py-1 text-sm rounded-lg hover:bg-blue-400 hover:text-white  font-bold"
              >
                Login
              </button>
              <h1 className="text-sm text-white font-bold">
                Dont have an account?{" "}
                <span
                  onClick={handleNvaigateLoginBtn}
                  className="text-slate-900 font-bold hover:text-blue-400 cursor-pointer"
                >
                  Register
                </span>
              </h1>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
