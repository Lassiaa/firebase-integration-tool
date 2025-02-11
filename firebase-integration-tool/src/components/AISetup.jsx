/* eslint-disable react/prop-types */
import { useState } from "react";

import { makeApiRequest, roles } from "../utils/openai";

const AISetup = ({ setSelectedFeatures, setSelectedSettings }) => {
  const [loading, setLoading] = useState(false);
  const [isAISetup, setAISetup] = useState(true);
  const [scriptContent, setScriptContent] = useState("");
  const [aiResponse, setAiResponse] = useState(null);

  const aiSetupSelection = () => {
    setAISetup((prev) => !prev);
  };

  const handleGenerateClick = async () => {
    if (scriptContent.trim()) {
      try {
        const aiPrompt = scriptContent;
        const aiRole = roles.setupManager;
        const aiResult = await makeApiRequest(aiPrompt, aiRole);

        try {
          const aiResponseParsed = JSON.parse(aiResult);

          // Feature keys from AI response
          const featureKeys = [
            "Analytics",
            "Authentication",
            "Firebase Performance Monitoring",
            "Firebase Remote Config",
            "Firestore Database",
            "Functions",
            "Messaging",
            "Realtime Database",
            "Storage",
          ];

          // Settings keys from AI response
          const settingKeys = [
            "Enable Debug Mode",
            "Set Reporting Threshold",
            "Apple Auth",
            "Facebook Auth",
            "GitHub Auth",
            "Google Auth",
            "Set Config Parameters",
            "Enable Offline Persistence",
            "Enable Regions",
            "Set Environment Variables",
            "Enable Offline Mode",
            "Enable File Versioning",
          ];

          // Extract selected features
          const selectedFeatures = featureKeys.reduce((acc, key) => {
            acc[key] = aiResponseParsed[key] || false;
            return acc;
          }, {});

          // Map settings to features dynamically
          const selectedSettings = {
            Analytics: aiResponseParsed["Analytics"]
              ? settingKeys.filter(
                  (key) =>
                    ["Enable Debug Mode", "Set Reporting Threshold"].includes(
                      key
                    ) && aiResponseParsed[key]
                )
              : [],
            Authentication: aiResponseParsed["Authentication"]
              ? settingKeys.filter(
                  (key) =>
                    [
                      "Apple Auth",
                      "Facebook Auth",
                      "GitHub Auth",
                      "Google Auth",
                    ].includes(key) && aiResponseParsed[key]
                )
              : [],
            "Firebase Remote Config": aiResponseParsed["Firebase Remote Config"]
              ? settingKeys.filter(
                  (key) =>
                    ["Set Config Parameters"].includes(key) &&
                    aiResponseParsed[key]
                )
              : [],
            "Firestore Database": aiResponseParsed["Firestore Database"]
              ? settingKeys.filter(
                  (key) =>
                    ["Enable Offline Persistence"].includes(key) &&
                    aiResponseParsed[key]
                )
              : [],
            Functions: aiResponseParsed["Functions"]
              ? settingKeys.filter(
                  (key) =>
                    ["Enable Regions", "Set Environment Variables"].includes(
                      key
                    ) && aiResponseParsed[key]
                )
              : [],
            "Realtime Database": aiResponseParsed["Realtime Database"]
              ? settingKeys.filter(
                  (key) =>
                    ["Enable Offline Mode"].includes(key) &&
                    aiResponseParsed[key]
                )
              : [],
            Storage: aiResponseParsed["Storage"]
              ? settingKeys.filter(
                  (key) =>
                    ["Enable File Versioning"].includes(key) &&
                    aiResponseParsed[key]
                )
              : [],
          };

          // Update states
          setSelectedFeatures(selectedFeatures);
          setSelectedSettings(selectedSettings);
          setAiResponse(aiResult);
        } catch (error) {
          console.error("Error parsing AI response:", error);
          setAiResponse({
            error: "Failed to parse AI response. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error generating response:", error);
        setAiResponse({
          error: "Failed to generate response. Please try again later.",
        });
      }
    } else {
      console.warn("No script content available to generate AI response.");
    }
  };

  return (
    <article className="my-20">
      <div
        className="flex justify-center items-center cursor-pointer"
        onClick={aiSetupSelection}
      >
        <h2 className="text-2xl font-bold text-center mx-2">AI Setup</h2>
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
      {isAISetup && (
        <>
          <p className="my-8 text-center">
            Tell about your new project idea to the AI. <br /> The AI will setup
            Firebase settings based on your description. <br /> Selected
            settings can be edited in Manual Setup.
          </p>
          <textarea
            className="rounded-md w-1/2 h-32 p-2 my-8 mx-auto block text-black max-w-big"
            name="Prompt"
            placeholder="Prompt"
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
          ></textarea>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mx-auto block hover:bg-blue-600 ease-in-out duration-150"
            onClick={handleGenerateClick}
          >
            Submit
          </button>
          {loading && (
            <div className="flex flex-col items-center justify-center mt-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </article>
  );
};

export default AISetup;
