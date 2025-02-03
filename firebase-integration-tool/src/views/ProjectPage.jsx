import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { auth } from "../utils/firebase";

import LoggedUser from "../components/LoggedUser";

const ProjectPage = () => {
  const navigate = useNavigate();

  const [reactProjectName, setReactProjectName] = useState(
    localStorage.getItem("reactProjectName") || ""
  );
  const [firebaseProjectName, setFirebaseProjectName] = useState(
    localStorage.getItem("firebaseProjectName") || ""
  );

  // Save the project names to the local storage
  useEffect(() => {
    localStorage.setItem("reactProjectName", reactProjectName);
  }, [reactProjectName]);

  useEffect(() => {
    localStorage.setItem("firebaseProjectName", firebaseProjectName);
  }, [firebaseProjectName]);

  /* TODO: Implement the createFirebaseProject function
  const [firebaseConfig, setFirebaseConfig] = useState(null);

  const createFirebaseProject = async () => {
    if (!firebaseProjectName) {
      alert("Please provide a Firebase project name!");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("User is not signed in.");
      return;
    }

    try {
      const accessToken = await auth.currentUser.getIdToken(true);

      const response = await fetch(
        import.meta.env.VITE_FIREBASE_CREATE_FUNCTION,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseProjectName,
            userId,
            accessToken,
          }),
        }
      );

      const data = await response.json();
      console.log("Response:", data);

      console.log("firebaseProjectName:", firebaseProjectName);
      console.log("userId:", userId);
      console.log("accessToken:", accessToken);

      if (data.success) {
        alert("Firebase project created successfully!");
        setFirebaseConfig(data.config);
      } else {
        alert(`Error creating Firebase project: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An unexpected error occurred while creating the Firebase project."
      );
    }
  };
  */
  return (
    <div>
      <section>
        <article className="my-20">
          <h2 className="text-2xl font-bold text-center">Create Project</h2>

          {/* React Project Name Input */}
          <div className="w-52 mx-auto">
            <h3 className="text-xl font-bold">React project</h3>
            <input
              className="rounded-md w-full p-2 my-8 mx-auto block text-black"
              type="text"
              placeholder="React project..."
              value={reactProjectName}
              onChange={(e) => setReactProjectName(e.target.value)}
            />
          </div>

          {/* Firebase Project Name Input */}
          <div className="w-52 mx-auto">
            <h3 className="text-xl font-bold">Firebase project</h3>
            <input
              className="rounded-md w-full p-2 my-8 mx-auto block text-black"
              type="text"
              placeholder="Firebase project..."
              value={firebaseProjectName}
              onChange={(e) => setFirebaseProjectName(e.target.value)}
            />
          </div>

          {/* Button to trigger Firebase project creation */}
          <div className="flex justify-center">
            <button
              /* onClick={createFirebaseProject} */
              onClick={navigate("/tool")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Firebase Project
            </button>
          </div>
        </article>
      </section>

      <LoggedUser />
    </div>
  );
};

export default ProjectPage;
