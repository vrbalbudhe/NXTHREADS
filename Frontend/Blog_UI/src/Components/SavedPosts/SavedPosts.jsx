/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useState, useEffect } from "react";

function SavedPosts({ postInformation }) {
  const [savedPosts, setSavedPosts] = useState([]);

  const handleSavedPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/post/favourite/${postInformation.id}`,
        { withCredentials: true }
      );

      if (res.data.length > 0 && res.data[0].savedPosts) {
        setSavedPosts(res.data[0].savedPosts);
      }
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSavedPosts();
  }, [postInformation]);

  return (
    <div>
      {savedPosts.length > 0 ? (
        savedPosts.map((post) => (
          <div key={post.id}>
            {/* Render post details here */}
            <p>Post ID: {post.postId}</p>
          </div>
        ))
      ) : (
        <p>No saved posts found.</p>
      )}
    </div>
  );
}

export default SavedPosts;
