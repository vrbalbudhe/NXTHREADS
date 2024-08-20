import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

function Login() {
  const { updateUser,  } = useContext(AuthContext);
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
      <div className="w-[100%] h-[580px] rounded-xl flex flex-col justify-center items-center mb-5">
        <div className="w-full h-full flex flex-col flex-wrap justify-center items-center gap-2 mt-5">
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/6b/64/52/6b6452ab35737a6327313a3260ffcb03.jpg"
            alt=""
          />
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/c9/5b/96/c95b9686616a33fc1a85c8c920504a94.jpg"
            alt=""
          />
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/32/ce/40/32ce40cdf2a8b5e0461c9d8caaab329d.jpg"
            alt=""
          />
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/12/ac/c1/12acc17c34d4c5a1d959f127f26c1039.jpg"
            alt=""
          />
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/38/be/37/38be3711904d5e7e11d5aa0099d319b1.jpg"
            alt=""
          />
          <img
            className="rounded-xl"
            src="https://i.pinimg.com/236x/7c/24/61/7c2461c750b82a77204b3ad7adbf161e.jpg"
            alt=""
          />
          {/* <img className="rounded-xl" src="https://i.pinimg.com/236x/10/13/cd/1013cd054efbe5be0ff44af160c8e104.jpg" alt="" /> */}
        </div>
        <div className="w-[80%] h-[90%] absolute p-2  rounded-lg bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
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
              <h1 className="text-sm text-slate-700 font-bold">
                Dont have an account?{" "}
                <span
                  onClick={handleNvaigateLoginBtn}
                  className="text-slate-800 font-semibold hover:text-blue-400 cursor-pointer"
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
