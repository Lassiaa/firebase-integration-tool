import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const LoggedUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) =>
      console.error("Error setting persistence:", error)
    );

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <section className="fixed top-0 right-0 p-4 text-center">
      <h3 className="text-xl font-bold">Signed in</h3>
      <p className="my-2">{user.displayName || "User"}</p>
      <button
        onClick={handleSignOut}
        className="bg-red-600 text-white rounded-md px-3 py-1 mx-auto block hover:bg-red-800 ease-in-out duration-150"
      >
        Sign out
      </button>
    </section>
  );
};

export default LoggedUser;
