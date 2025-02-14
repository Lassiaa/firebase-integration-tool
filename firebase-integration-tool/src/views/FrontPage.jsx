import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../utils/firebase";

const FrontPage = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/cloud-platform");
  provider.addScope("https://www.googleapis.com/auth/firebase");

  const logGoogleUser = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential) {
        const accessToken = credential.accessToken;
        localStorage.setItem("accessToken", accessToken);
        navigate("/project");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <main className="w-full px-2">
      <h1 className="text-center text-3xl font-bold my-8">
        Firebase Integration Tool
      </h1>
      <section className="my-32">
        <h2 className="text-2xl font-bold text-center my-8">Get started!</h2>
        <p className="text-center">
          Effortless integration of Firebase services!
        </p>

        <p className="text-center my-6">
          Automate your Firebase project setup and get ready-to-use
          configurations for seamless web app integration with AI. <br />
          Download a ready to go React Vite project zip file with your new
          Firebase project integrated.
        </p>

        <div className="flex align-center justify-center my-12">
          <button
            onClick={logGoogleUser}
            type="button"
            className="text-white w-56 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2 ease-in-out duration-150 "
          >
            <svg
              className="mr-2 -ml-1 w-4 h-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </section>
    </main>
  );
};

export default FrontPage;
