import { useEffect, useState } from "react";
// import { auth } from "../utils/firebase";

import LoggedUser from "../components/LoggedUser";
import AISetup from "../components/AISetup";

const ToolPage = () => {
  const [isManualSetup, setManualSetup] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const savedFeatures = localStorage.getItem("selectedFeatures");

    return savedFeatures
      ? JSON.parse(savedFeatures)
      : {
          Analytics: false,
          Authentication: false,
          "Firestore Database": false,
          Functions: false,
          "Realtime Database": false,
          Storage: false,
        };
  });

  const [selectedSettings, setSelectedSettings] = useState(() => {
    const savedSettings = localStorage.getItem("selectedSettings");

    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          Analytics: [],
          Authentication: [],
          "Firestore Database": [],
          Functions: [],
          "Realtime Database": [],
          Storage: [],
        };
  });

  useEffect(() => {
    localStorage.setItem("selectedFeatures", JSON.stringify(selectedFeatures));
  }, [selectedFeatures]);

  useEffect(() => {
    localStorage.setItem("selectedSettings", JSON.stringify(selectedSettings));
  }, [selectedSettings]);

  const featureConfigs = {
    Analytics: {
      import: `import { getAnalytics } from "firebase/analytics";`,
      init: `const analytics = getAnalytics(app);`,
      settings: {
        "Enable Debug Mode": `analytics.setAnalyticsCollectionEnabled(true);`,
        "Set Reporting Threshold": `analytics.setReportMode(2);`,
      },
      export: "analytics",
    },
    Authentication: {
      import: `import { getAuth, GoogleAuthProvider } from "firebase/auth";`,
      init: `const auth = getAuth(app);`,
      settings: {
        "Google Auth": `const provider = new GoogleAuthProvider();`,
        "Facebook Auth": `const provider = new FacebookAuthProvider();`,
      },
      export: "auth, provider",
    },
    "Firestore Database": {
      import: `import { getFirestore } from "firebase/firestore";`,
      init: `const firestore = getFirestore(app);`,
      settings: {
        "Enable Offline Persistence": `firestore.enablePersistence();`,
        "Set Rules": `firestore.setRules({/* Custom rules here */});`,
      },
      export: "firestore",
    },
    Functions: {
      import: `import { getFunctions } from "firebase/functions";`,
      init: `const functions = getFunctions(app);`,
      settings: {
        "Enable Regions": `functions.useFunctionsEmulator("localhost", 5001);`,
      },
      export: "functions",
    },
    "Realtime Database": {
      import: `import { getDatabase } from "firebase/database";`,
      init: `const database = getDatabase(app);`,
      settings: {
        "Enable Offline Mode": `database.goOffline();`,
        "Set Database Rules": `database.setRules({/* Custom rules here */});`,
      },
      export: "database",
    },
    Storage: {
      import: `import { getStorage } from "firebase/storage";`,
      init: `const storage = getStorage(app);`,
      settings: {
        "Enable File Versioning": `storage.enableVersioning();`,
        "Storage Set Rules": `storage.setRules({/* Custom rules here */});`,
      },
      export: "storage",
    },
  };

  const downloadFirebaseConfig = () => {
    const imports = [`import { initializeApp } from "firebase/app";`];
    const initializations = [`const app = initializeApp(firebaseConfig);`];
    const exports = ["app"];

    Object.entries(featureConfigs).forEach(([feature, config]) => {
      if (selectedFeatures[feature]) {
        imports.push(config.import);
        initializations.push(config.init);
        exports.push(...config.export.split(", "));
        Object.entries(config.settings).forEach(([setting, code]) => {
          if (selectedSettings[feature]?.includes(setting)) {
            initializations.push(code);
          }
        });
      }
    });

    const fileContent = `
${imports.join("\n")}
  
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "Testi.firebaseapp.com",
  projectId: "Testi",
  storageBucket: "Testi.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
    
// Firebase initialization
${initializations.join("\n")}
  
export { ${exports.join(", ")} };
`;

    const blob = new Blob([fileContent], { type: "application/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "firebase.js";
    link.click();
  };

  // Toggle the selected features in Manual Setup
  const toggleFeature = (feature) => {
    setSelectedFeatures((prevState) => {
      const newState = { ...prevState, [feature]: !prevState[feature] };
      return newState;
    });
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

      return updatedSettings;
    });
  };

  const manualSetupSelection = () => {
    setManualSetup(!isManualSetup);
  };

  const additionalSettings = {
    Analytics: ["Enable Debug Mode", "Set Reporting Threshold"],
    Authentication: ["Google Auth", "Facebook Auth"],
    "Firestore Database": ["Enable Offline Persistence", "Set Rules"],
    Functions: ["Enable Regions", "Set Environment Variables"],
    "Realtime Database": ["Enable Offline Mode", "Set Database Rules"],
    Storage: ["Set Rules", "Enable File Versioning"],
  };

  return (
    <main className="w-full px-2">
      <h1 className="text-center text-3xl font-bold my-8">
        Firebase Integration Tool
      </h1>

      <section>
        <AISetup
          setSelectedFeatures={setSelectedFeatures}
          setSelectedSettings={setSelectedSettings}
        />
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

      {/* Button to download firebase.js */}
      <div className="flex justify-center">
        <button
          onClick={downloadFirebaseConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download Firebase.js
        </button>
      </div>

      <LoggedUser />
    </main>
  );
};

export default ToolPage;
