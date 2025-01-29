import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";

import LoggedUser from "../components/LoggedUser";
import AISetup from "../components/AISetup";

const ToolPage = () => {
  const [isManualSetup, setManualSetup] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState({
    Analytics: false,
    Authentication: false,
    "Firestore Database": false,
    Functions: false,
    "Realtime Database": false,
    Storage: false,
  });
  const [selectedSettings, setSelectedSettings] = useState({
    Analytics: [],
    Authentication: [],
    "Firestore Database": [],
    Functions: [],
    "Realtime Database": [],
    Storage: [],
  });
  const [reactProjectName, setReactProjectName] = useState(
    localStorage.getItem("reactProjectName") || ""
  );
  const [firebaseProjectName, setFirebaseProjectName] = useState(
    localStorage.getItem("firebaseProjectName") || ""
  );
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

  const downloadFirebaseConfig = () => {
    if (!firebaseConfig) {
      alert("Firebase project is not set up yet.");
      return;
    }

    const configContent = JSON.stringify(firebaseConfig, null, 2);

    const imports = [`import { initializeApp } from "firebase/app";`];
    const initializations = [`const app = initializeApp(firebaseConfig);`];

    if (selectedFeatures.Analytics) {
      imports.push(`import { getAnalytics } from "firebase/analytics";`);
      initializations.push(`const analytics = getAnalytics(app);`);
      if (selectedSettings.Analytics.includes("Enable Debug Mode")) {
        initializations.push(`analytics.setAnalyticsCollectionEnabled(true);`);
      }
      if (selectedSettings.Analytics.includes("Set Reporting Threshold")) {
        initializations.push(`analytics.setReportMode(2);`);
      }
    }

    if (selectedFeatures.Authentication) {
      imports.push(`import { getAuth } from "firebase/auth";`);
      initializations.push(`const auth = getAuth(app);`);
      if (selectedSettings.Authentication.includes("Google Auth")) {
        imports.push(`import { GoogleAuthProvider } from "firebase/auth";`);
        initializations.push(`const provider = new GoogleAuthProvider();`);
      }
    }

    if (selectedFeatures["Firestore Database"]) {
      imports.push(`import { getFirestore } from "firebase/firestore";`);
      initializations.push(`const firestore = getFirestore(app);`);
      if (
        selectedSettings["Firestore Database"].includes(
          "Enable Offline Persistence"
        )
      ) {
        initializations.push(`firestore.enablePersistence();`);
      }
      if (selectedSettings["Firestore Database"].includes("Set Rules")) {
        initializations.push(`firestore.setRules({/* Custom rules here */});`);
      }
    }

    if (selectedFeatures.Functions) {
      imports.push(`import { getFunctions } from "firebase/functions";`);
      initializations.push(`const functions = getFunctions(app);`);
      if (selectedSettings.Functions.includes("Enable Regions")) {
        initializations.push(
          `functions.useFunctionsEmulator("localhost", 5001);`
        );
      }
    }

    if (selectedFeatures["Realtime Database"]) {
      imports.push(`import { getDatabase } from "firebase/database";`);
      initializations.push(`const database = getDatabase(app);`);
      if (
        selectedSettings["Realtime Database"].includes("Enable Offline Mode")
      ) {
        initializations.push(`database.goOffline();`);
      }
    }

    if (selectedFeatures.Storage) {
      imports.push(`import { getStorage } from "firebase/storage";`);
      initializations.push(`const storage = getStorage(app);`);
      if (selectedSettings.Storage.includes("Enable File Versioning")) {
        initializations.push(`storage.enableVersioning();`);
      }
    }

    // Generate the content for the firebase.js file
    const fileContent = `
    ${imports.join("\n")}

    // Firebase configuration
    const firebaseConfig = ${configContent};
    
    // Firebase initialization
    ${initializations.join("\n")}

    export { ${initializations
      .map((init) => init.split(" ")[1])
      .filter(Boolean)
      .join(", ")} };
  `;

    const blob = new Blob([fileContent], { type: "application/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "firebase.js";
    link.click();
  };

  // Toggle the selected features in Manual Setup
  const toggleFeature = (feature) => {
    setSelectedFeatures((prevState) => ({
      ...prevState,
      [feature]: !prevState[feature],
    }));
  };

  // Toggle additional setting for a feature
  const toggleSetting = (feature, setting) => {
    setSelectedSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings };
      const featureSettings = updatedSettings[feature] || [];

      if (featureSettings.includes(setting)) {
        updatedSettings[feature] = featureSettings.filter((s) => s !== setting);
      } else {
        updatedSettings[feature] = [...featureSettings, setting];
      }

      // Log the updated state
      console.log(updatedSettings);

      return updatedSettings;
    });
  };

  const manualSetupSelection = () => {
    setManualSetup(!isManualSetup);
  };

  const additionalSettings = {
    Analytics: ["Enable Debug Mode", "Set Reporting Threshold"],
    Authentication: ["Email/Password Auth", "Google Auth", "Facebook Auth"],
    "Firestore Database": ["Enable Offline Persistence", "Set Rules"],
    Functions: ["Enable Regions", "Set Environment Variables"],
    "Realtime Database": ["Enable Offline Mode", "Set Database Rules"],
    Storage: ["Set Rules", "Enable File Versioning"],
  };

  // Save the project names to the local storage
  useEffect(() => {
    localStorage.setItem("reactProjectName", reactProjectName);
  }, [reactProjectName]);

  useEffect(() => {
    localStorage.setItem("firebaseProjectName", firebaseProjectName);
  }, [firebaseProjectName]);

  return (
    <main className="w-full px-2">
      <h1 className="text-center text-3xl font-bold my-8">
        Firebase Integration Tool
      </h1>

      <section>
        <AISetup />
        <article className="my-20">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={manualSetupSelection}
          >
            <h2 className="text-2xl font-bold text-center mx-2">
              Manual Setup
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
                {Object.keys(selectedFeatures).map((feature, index) => (
                  <li key={index} className="flex flex-col my-4">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={selectedFeatures[feature]}
                          onChange={() => toggleFeature(feature)}
                        />
                        <div className="mr-2 w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                      <h3 className="text-xl font-bold">{feature}</h3>
                    </div>

                    {selectedFeatures[feature] &&
                      additionalSettings[feature] && (
                        <ul className="ml-6 mt-2">
                          {additionalSettings[feature].map(
                            (setting, subIndex) => (
                              <li key={subIndex} className="my-2">
                                <div className="flex items-center">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={selectedSettings[
                                        feature
                                      ].includes(setting)}
                                      onChange={() =>
                                        toggleSetting(feature, setting)
                                      }
                                    />
                                    <div className="mr-2 w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                  </label>
                                  {setting}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            ""
          )}
        </article>
      </section>

      <section>
        <article className="my-20">
          <h2 className="text-2xl font-bold text-center">Final Steps</h2>

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
              onClick={createFirebaseProject} // Trigger the function here
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Firebase Project
            </button>
          </div>

          {/* Button to download firebase.js */}
          <div className="flex justify-center">
            <button
              onClick={downloadFirebaseConfig}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Download Firebase.js
            </button>
          </div>
        </article>
      </section>

      <LoggedUser />
    </main>
  );
};

export default ToolPage;
