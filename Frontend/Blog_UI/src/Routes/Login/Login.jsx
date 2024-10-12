import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

function Login() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
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
        setCurrentUser({
          userId: res.data?.userInfo?.id,
          username: res.data?.userInfo?.username,
          email: res.data?.userInfo?.email,
          fullname: res.data?.userInfo?.fullname,
          gender: res.data?.userInfo?.gender,
          avatar: res.data?.userInfo?.avatar,
        });
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
    <div className="w-full h-full flex justify-center items-center bg-black">
      <div className="w-[100%] h-full flex flex-col justify-center items-center mb-5">
        <div className="w-[95%] h-[100vh] flex flex-wrap justify-center items-center gap-2">
          <img
            className="rounded-[30px] object-cover w-[99%] h-[90vh] "
            src="https://images.unsplash.com/photo-1542396601-dca920ea2807?q=80&w=1651&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />{" "}
        </div>
        <div className="w-full h-full absolute flex flex-row  justify-center items-center">
          <div className="w-[50%] h-[90%] p-2 rounded-lg flex justify-center items-center">
            <p className="text-white text-[80px]">NXTHREADS</p>
          </div>
          <div className="w-[50%] h-[91%] p-2 rounded-lg bg-opacity-50 flex justify-center items-center">
            <div className="w-[30%] h-full flex justify-center items-center">
              <form
                className="w-full h-full flex flex-col justify-center items-start gap-5"
                onSubmit={handleLogin}
              >
                <div className="w-full h-10 flex justify-start items-center">
                  <h1 className=" font-bold text-white text-lg ">Login</h1>
                </div>
                <input
                  className="w-[100%] h-[40px] bg-slate-50 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
                  type="email"
                  name="email"
                  placeholder="Email"
                />
                <input
                  className="w-[100%] h-[40px] bg-slate-50 border border-slate-200 rounded-md pl-5 text-sm font-semibold text-zinc-700"
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
    </div>
  );
}

export default Login;
