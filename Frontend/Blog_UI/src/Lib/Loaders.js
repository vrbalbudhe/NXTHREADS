import axios from "axios";
import { defer } from "react-router-dom";

// Loader for fetching a single post by ID
export const profilePageUserOwnPost = async ({ params }) => {
  try {
    const postPromise = axios.get(
      `http://localhost:8000/api/post/${params.id}`,
      {
        withCredentials: true,
      }
    );
    return defer({
      postResponse: postPromise,
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login.");
      throw new Error("Unauthorized access. Please login.");
    } else {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }
};

// Loader for fetching posts based on query parameters
export const singlePageLoader = async ({ request }) => {
  try {
    const query = request.url.split("?")[1];
    const postPromise = axios.get(
      `http://localhost:8000/api/post/fltr/` + query,
      { withCredentials: true }
    );

    return defer({
      postResponse: postPromise,
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login.");
      throw new Error("Unauthorized access. Please login.");
    } else {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }
};

// Loader for fetching user information
export const usersInfoLoader = async () => {
  try {
    const postPromise = await axios.get("http://localhost:8000/api/user/", {
      withCredentials: true,
    });
    return defer({
      postResponse: postPromise,
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login.");
      throw new Error("Unauthorized access. Please login.");
    } else {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }
};

// Loader for fetching user profile information by URL parameter
export const userProfileInfoUsingURL = async ({ params }) => {
  const id = params.id;
  try {
    const postPromise = await axios.get(
      `http://localhost:8000/api/user/${id}`,
      {
        withCredentials: true,
      }
    );
    return defer({
      UserData: postPromise,
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login.");
      // Optionally redirect or handle unauthorized access
    } else {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }
};


// Combined loader to fetch data from multiple sources
// export const combinedLoader = async ({ params }) => {
//   try {
//     const postPromise = profilePageUserOwnPost({ params });
//     const userInfoPromise = userProfileInfoUsingURL({ params });

//     const [postResponse, userInfoResponse] = await Promise.all([
//       postPromise,
//       userInfoPromise,
//     ]);

//     return defer({
//       postResponse: postResponse.data.postResponse,
//       userInfoResponse: userInfoResponse.data.UserData,
//     });
//   } catch (error) {
//     console.error("Error in combined loader:", error);
//     throw error;
//   }
// };
