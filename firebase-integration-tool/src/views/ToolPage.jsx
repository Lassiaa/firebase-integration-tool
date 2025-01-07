import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

import LoggedUser from "../components/LoggedUser";

const ToolPage = () => {
  const navigate = useNavigate();

  const [isAISetup, setAISetup] = useState(false);
  const [isManualSetup, setManualSetup] = useState(false);

  // Redirect to the front page if the user is not signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const manualSetupSelection = () => {
    if (!isManualSetup) {
      setManualSetup(true);
    } else {
      setManualSetup(false);
    }
  };

  const aiSetupSelection = () => {
    if (!isAISetup) {
      setAISetup(true);
    } else {
      setAISetup(false);
    }
  };

  return (
    <main className="w-full px-2">
      <h1 className="text-center text-3xl font-bold my-8">
        Firebase Integration Tool
      </h1>

      <section className="w-full">
        <article className="my-20">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={aiSetupSelection}
          >
            <h2 className="text-2xl font-bold text-center mx-2">AI setup</h2>
            {isAISetup ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            )}
          </div>
          {isAISetup ? (
            <>
              <p className="my-8 text-center">
                Tell about your new project to the AI. <br /> The AI will setup
                Firebase settings based on your description.
              </p>
              <textarea
                className="rounded-md w-1/2 h-32 p-2 my-8 mx-auto block text-black"
                name="Prompt"
                placeholder="Prompt"
              ></textarea>
              <button className="bg-white text-black rounded-md my-8 px-6 py-2 mx-auto block hover:bg-gray-200 ease-in-out duration-150">
                Submit
              </button>
            </>
          ) : (
            ""
          )}
        </article>

        <article className="my-20">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={manualSetupSelection}
          >
            <h2 className="text-2xl font-bold text-center mx-2">
              Manual setup
            </h2>

            {isManualSetup ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            )}
          </div>
          {isManualSetup ? (
            <div className="my-8 w-1/2 mx-auto block">
              <ul>
                {[
                  "Authentication",
                  "Firestore Database",
                  "Realtime Database",
                  "Hosting",
                  "Storage",
                  "Functions",
                  "Analytics",
                  "Project Settings",
                ].map((item, index) => (
                  <li key={index} className="flex my-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="mr-2 w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                    <h3 className="text-xl font-bold">{item}</h3>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            ""
          )}
        </article>
      </section>

      <section className="w-full">
        <article className="my-20">
          <h2 className="text-2xl font-bold text-center my-8">Last steps</h2>
          <h3 className="text-xl font-bold text-center">
            Name the Firebase project
          </h3>
          <input
            className="rounded-md w-48 p-2 my-8 mx-auto block text-black"
            type="text"
            placeholder="Firebase project name"
          />

          <h3 className="text-xl font-bold text-center">
            Name the React project
          </h3>
          <input
            className="rounded-md w-48 p-2 my-8 mx-auto block text-black"
            type="text"
            placeholder="React project name"
          />
        </article>

        <article className="my-20">
          <h2 className="text-2xl font-bold text-center">Download project</h2>
          <p className="my-8 text-center">Run the setup to download.</p>
          <button className="disabled bg-gray-400 text-gray-800 rounded-md my-8 px-6 py-2 mx-auto block">
            Download
          </button>
        </article>
      </section>

      <LoggedUser />
    </main>
  );
};

export default ToolPage;
