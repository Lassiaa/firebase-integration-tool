import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoggedUser from "../components/LoggedUser";

const ProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState(
    localStorage.getItem("projectName") || ""
  );

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const handleChange = (e) => {
    let value = e.target.value;

    if (!/^[a-zA-Z -]*$/.test(value)) {
      setError("Only english letters (A-Z, a-z) are allowed.");
    } else if (value.length > 30) {
      setError("Project name cannot be more than 30 characters.");
    } else {
      setError("");
    }

    const sanitizedValue = value.replace(/[^a-zA-Z -]/g, "").slice(0, 30);
    setProjectName(sanitizedValue);
  };

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

      if (data.success) {
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

  // Fetch the list of Firebase projects with web apps
  useEffect(() => {
    const fetchProjects = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_FIREBASE_LIST_PROJECTS_FUNCTION}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ accessToken }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching projects:", errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received projects data:", data);

        if (data.success && data.results) {
          setProjects(data.results);
        } else {
          setError("No Firebase projects with web apps found.");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("An error occurred while fetching projects.");
      }
    };

    fetchProjects();
  }, []);

  const handleProjectSelection = async () => {
    if (!selectedProject) {
      alert("Please select a Firebase project!");
      return;
    }

    const selectedProjectData = projects.find(
      (project) => project.projectId === selectedProject
    );

    if (selectedProjectData) {
      localStorage.setItem("projectId", selectedProjectData.projectId);
      localStorage.setItem(
        "projectName",
        selectedProjectData.displayName || selectedProjectData.projectId
      );
    }

    navigate("/tool");
  };

  return (
    <div>
      <section>
        <h1 className="text-center text-3xl font-bold my-8">
          Firebase Integration Tool
        </h1>

        {/* Project Creation */}
        <article className="mt-32 mb-20">
          <h2 className="text-2xl font-bold text-center">Create Project</h2>

          <div className="mx-auto">
            <p className="text-center my-8 ">
              Give a name for your new Firebase project.
            </p>
            {error && (
              <p className="text-red-500 text-sm text-center my-2">{error}</p>
            )}
            <input
              className="rounded-md w-52 p-2 my-8 mx-auto block text-black"
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={createFirebaseProject}
              className={`px-4 py-2 rounded text-white ease-in-out duration-150 ${
                error || !projectName
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading || error || !projectName}
            >
              Create Project
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

        {/* Project Selection */}
        <article className="mx-auto">
          <h2 className="text-2xl font-bold text-center">Select Project</h2>
          <p className="text-center my-8 ">
            Select from your existing Firebase projects.
          </p>
          {projects.length > 0 ? (
            <select
              className="rounded-md w-52 p-2 my-8 mx-auto block text-black"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.displayName || project.projectId}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-center my-4">
              No projects available with web apps.
            </p>
          )}

          <div>
            <button
              onClick={handleProjectSelection}
              className={`px-4 py-2 rounded text-white mx-auto block ${
                !selectedProject
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={!selectedProject}
            >
              Use Project
            </button>
          </div>
        </article>
      </section>

      <LoggedUser />
    </div>
  );
};

export default ProjectPage;
