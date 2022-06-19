import { getAuth } from "firebase/auth";

const useUserAuth = () => {
  console.log("4");
  const auth = getAuth();
  console.log("6");
  const isLoggedIn = () => {
    return new Promise((resolve) => {
      const getCurrentUser = auth.onAuthStateChanged((user) => {
        resolve(user);
      });
      getCurrentUser();
    });
  };
  console.log("8");

  return {
    isLoggedIn,
  };
};
export default useUserAuth;
