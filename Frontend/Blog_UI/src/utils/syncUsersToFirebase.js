import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const syncUsersToFirebase = async (currentUserId) => {
     try {
          console.log("=== SYNC USERS DEBUG ===");
          console.log("Current user ID:", currentUserId);
          console.log("Base URL:", baseUrl);

          if (!currentUserId) {
               console.error("No current user ID provided");
               return;
          }

          console.log("Making request to:", `${baseUrl}/api/userfollow/following/${currentUserId}`);

          const response = await axios.post(
               `${baseUrl}/api/userfollow/following/${currentUserId}`,
               {},
               { withCredentials: true }
          );

          console.log("Backend response:", response);
          console.log("Response data:", response.data);

          const followingUsers = response.data.totalFollowings || [];
          console.log("Following users array:", followingUsers);
          console.log("Number of following users:", followingUsers.length);

          if (followingUsers.length === 0) {
               console.log("No following users found. You might not be following anyone yet.");
               return;
          }

          const usersCollection = collection(db, "users");
          console.log("Firebase users collection reference created");

          for (const followRecord of followingUsers) {
               try {
                    console.log("Processing follow record:", followRecord);
                    const user = followRecord.following;
                    console.log("User data:", user);

                    if (!user || !user.id) {
                         console.error("Invalid user data:", user);
                         continue;
                    }

                    const existingUserQuery = query(
                         usersCollection,
                         where("id", "==", user.id)
                    );
                    const existingUserSnapshot = await getDocs(existingUserQuery);

                    if (existingUserSnapshot.empty) {
                         const userData = {
                              id: user.id,
                              fullname: user.fullname,
                              username: user.username,
                              avatar: user.avatar,
                              createdAt: new Date(),
                         };

                         console.log("Adding user to Firebase:", userData);
                         await addDoc(usersCollection, userData);
                         console.log("Successfully added following user to Firebase:", userData.fullname);
                    } else {
                         console.log("Following user already exists in Firebase:", user.fullname);
                    }
               } catch (error) {
                    console.error("Error processing follow record:", error);
               }
          }

          console.log("=== SYNC COMPLETED ===");
     } catch (error) {
          console.error("=== SYNC ERROR ===");
          console.error("Error syncing following users to Firebase:", error);
          console.error("Error details:", error.response?.data || error.message);
     }
};

export const checkFirebaseUsers = async () => {
     try {
          console.log("=== CHECKING FIREBASE USERS ===");
          const usersCollection = collection(db, "users");
          const snapshot = await getDocs(usersCollection);

          console.log("Firebase users count:", snapshot.size);
          if (snapshot.size === 0) {
               console.log("No users found in Firebase");
          } else {
               snapshot.forEach((doc) => {
                    console.log("Firebase user:", doc.data());
               });
          }

          return snapshot.size;
     } catch (error) {
          console.error("Error checking Firebase users:", error);
          return 0;
     }
}; 