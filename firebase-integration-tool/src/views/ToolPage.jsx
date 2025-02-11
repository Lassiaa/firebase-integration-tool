import { useEffect, useState } from "react";

import LoggedUser from "../components/LoggedUser";
import AISetup from "../components/AISetup";
import Download from "../components/Download";

const ToolPage = () => {
  const currentProject = localStorage.getItem("projectName");
  const [isManualSetup, setManualSetup] = useState(true);

  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const savedFeatures = localStorage.getItem("selectedFeatures");

    return savedFeatures
      ? JSON.parse(savedFeatures)
      : {
          Analytics: false,
          Authentication: false,
          "Firebase Performance Monitoring": false,
          "Firebase Remote Config": false,
          "Firestore Database": false,
          Functions: false,
          Messaging: false,
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
          "Firebase Performance Monitoring": [],
          "Firebase Remote Config": [],
          "Firestore Database": [],
          Functions: [],
          Messaging: [],
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

  const additionalSettings = {
    Analytics: ["Enable Debug Mode", "Set Reporting Threshold"],
    Authentication: [
      "Apple Auth",
      "Facebook Auth",
      "GitHub Auth",
      "Google Auth",
    ],
    "Firebase Performance Monitoring": [],
    "Firebase Remote Config": ["Set Config Parameters"],
    "Firestore Database": ["Enable Offline Persistence"],
    Functions: ["Enable Regions", "Set Environment Variables"],
    Messaging: [],
    "Realtime Database": ["Enable Offline Mode"],
    Storage: ["Enable File Versioning"],
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

  return (
    <main className="w-full px-2">
      <h1 className="text-center text-3xl font-bold mt-8">
        Firebase Integration Tool
      </h1>
      <h2 className="text-center text-2xl font-bold mb-8">{currentProject}</h2>

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

      <Download
        selectedFeatures={selectedFeatures}
        selectedSettings={selectedSettings}
      />

      <LoggedUser />
    </main>
  );
};

export default ToolPage;
