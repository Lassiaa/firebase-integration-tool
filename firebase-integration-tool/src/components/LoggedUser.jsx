import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";

const LoggedUser = () => {
  const navigate = useNavigate();
  const userName = auth.currentUser?.displayName || "User";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <section className="fixed top-0 right-0 p-4 text-center">
      <h3 className="text-xl font-bold">Logged in as:</h3>
      <p className="my-2">{userName}</p>
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
