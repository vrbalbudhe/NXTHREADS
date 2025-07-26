import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFirebaseUsers = (currentUserId) => {
     const [users, setUsers] = useState([]);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          console.log("=== FIREBASE USERS HOOK DEBUG ===");
          console.log("Current user ID:", currentUserId);

          if (!currentUserId) {
               console.log("No current user ID, clearing users");
               setUsers([]);
               return;
          }

          setLoading(true);
          console.log("Starting to fetch users from Firebase for user:", currentUserId);

          const q = query(
               collection(db, "users"),
               where("id", "!=", currentUserId)
          );

          console.log("Firebase query created");

          const unsubscribe = onSnapshot(q, (snapshot) => {
               console.log("Firebase snapshot received:", snapshot.size, "users");
               const userList = [];
               snapshot.forEach((doc) => {
                    const userData = doc.data();
                    console.log("Processing user document:", userData);
                    userList.push({
                         id: doc.id,
                         ...userData,
                    });
               });
               console.log("Final processed users:", userList);
               setUsers(userList);
               setLoading(false);
          }, (error) => {
               console.error("=== FIREBASE USERS ERROR ===");
               console.error("Error fetching users from Firebase:", error);
               setLoading(false);
          });

          return () => {
               console.log("Cleaning up Firebase users listener");
               unsubscribe();
          };
     }, [currentUserId]);

     return {
          users,
          loading,
     };
}; 