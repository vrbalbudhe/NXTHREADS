/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Suspense, useContext, useEffect, useState } from "react";
import { Await, redirect, useLoaderData } from "react-router-dom";
import PostCard from "../../Components/PostCard/PostCard";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import AlertBar from "../../Components/AlertBar/AlertBar";
import { AuthContext } from "../../Context/AuthContext";
import NextPrevious from "../../Components/NextPrevious/NextPrevious";
import ViewMore from "../../Components/ViewMore/ViewMore";
import SecondBar from "../../Components/SecondBar/SecondBar";

function Homepage() {
  const { postResponse } = useLoaderData();
  const { currentUser } = useContext(AuthContext);
  const [login, setLogin] = useState(true);
  const [next, setNext] = useState(3);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (postResponse && postResponse.data) {
      setTotal(postResponse.data.posts.length);
    }
  }, [postResponse]);

  useEffect(() => {
    if (!currentUser) {
      const interval = setTimeout(() => {
        setLogin(false);
        console.log(login);
      }, 10000);

      return () => clearTimeout(interval); // Cleanup timeout on component unmount
    }
  }, [currentUser, login]);

  const handleNext = () => {
    if (total > next) {
      setNext(next + 3);
    }
  };

  return (
    <div className="w-full h-min-[500px] mt-5 flex gap-5 relative">
      {!login ? (
        <div className="w-[100%] h-fit absolute top-[350px] pl-5 pr-5 rounded-xl flex justify-center items-center z-10">
          <div className="w-full h-full flex justify-center items-center">
            <AlertBar />
          </div>
        </div>
      ) : null}
      <div
        className={`w-[70%] ${login ? "" : "backdrop-blur-md opacity-90"} h-full flex flex-col justify-center items-center`}
      >
        <div className="w-full h-fit flex justify-center items-center">
          {/* <img
            className="w-[90%] h-full rounded-xl"
            src="https://i.pinimg.com/564x/e6/f0/d8/e6f0d83692f2e29b0510b8fb8de31184.jpg"
            alt="Blog Banner"
          /> */}
          {/* <SecondBar /> */}
        </div>
        <div className="w-full h-fit flex justify-center items-center flex-col">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={postResponse}
              errorElement={
                <p className="w-fit pr-8 py-1 rounded-sm pl-8 bg-yellow-100">
                  Error loading Posts!
                </p>
              }
            >
              {({ data }) =>
                data.posts
                  .slice(0, next)
                  .map((post) => <PostCard key={post.id} post={post} />)
              }
            </Await>
          </Suspense>
        </div>
        <ViewMore onViewMore={handleNext} />
      </div>
      <div className="w-[30%] h-full bg-white rounded-xl">
        <div>
          <HotTopicsCard />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
