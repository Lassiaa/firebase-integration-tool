import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoggedUser from "../components/LoggedUser";

const ProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [projectName, setProjectName] = useState(
    localStorage.getItem("projectName") || ""
  );

  useEffect(() => {
    if (projectName) {
      localStorage.setItem("projectName", projectName);
    }
  }, [projectName]);

  // Call the backend to create a Firebase project
  const createFirebaseProject = async () => {
    if (!projectName) {
      alert("Please provide a Firebase project name!");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        import.meta.env.VITE_FIREBASE_CREATE_FUNCTION,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({ projectName, accessToken }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        console.log("Response JSON:", data);
        localStorage.setItem("projectId", data.firebaseProjectId);
        navigate("/tool");
      } else {
        alert(`Error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      return;
    }
    const countdown = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [loading]);

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
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={createFirebaseProject}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Create Firebase Project
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center mt-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-center mt-4" id="timer">
                {timeLeft > 0
                  ? `Estimated time: ${timeLeft}s`
                  : "Finishing up!"}
              </p>
            </div>
          )}
        </article>
      </section>

      <LoggedUser />
    </div>
  );
};

export default ProjectPage;
