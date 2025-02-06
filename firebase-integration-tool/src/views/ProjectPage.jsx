import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoggedUser from "../components/LoggedUser";

const ProjectPage = () => {
  const navigate = useNavigate();

  const [projectName, setprojectName] = useState(
    localStorage.getItem("projectName") || ""
  );
  // const [firebaseConfig, setFirebaseConfig] = useState(null);

  useEffect(() => {
    if (projectName) {
      localStorage.setItem("projectName", projectName);
    }
  }, [projectName]);

  const createFirebaseProject = async () => {
    if (!projectName) {
      alert("Please provide a Firebase project name!");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("Access token is missing. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_FIREBASE_CREATE_FUNCTION,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectName, accessToken }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Firebase project created successfully!");
        // setFirebaseConfig(data.firebaseConfig);
        navigate("/tool");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div>
      <section>
        <article className="my-20">
          <h2 className="text-2xl font-bold text-center">Create Project</h2>

          <div className="w-52 mx-auto">
            <h3 className="text-xl font-bold text-center my-8 ">
              Firebase project
            </h3>
            <input
              className="rounded-md w-full p-2 my-8 mx-auto block text-black"
              type="text"
              placeholder="Firebase project..."
              value={projectName}
              onChange={(e) => setprojectName(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={createFirebaseProject}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Firebase Project
            </button>
          </div>

          {/*
          {firebaseConfig && (
            <div className="mt-4 p-4 border rounded bg-gray-100 text-black">
              <h3 className="text-lg font-bold">Firebase Config</h3>
              <pre className="text-sm">
                {JSON.stringify(firebaseConfig, null, 2)}
              </pre>

              <button
                onClick={() => navigate("/tool")}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              >
                Continue
              </button>
            </div>
          )}*/}
        </article>
      </section>

      <LoggedUser />
    </div>
  );
};

export default ProjectPage;
