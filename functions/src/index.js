/* eslint-disable quote-props */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { fetch } = require("undici");
const cors = require("cors");

admin.initializeApp();

const corsHandler = cors({ origin: true });

const GOOGLE_CLOUD_API_URL =
  "https://cloudresourcemanager.googleapis.com/v1/projects";
const FIREBASE_API_URL = "https://firebase.googleapis.com/v1beta1/projects";

exports.createFirebaseProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
    }

    try {
      const { projectName, accessToken } = req.body;

      console.log("Request Body:", req.body);

      if (!projectName || !accessToken) {
        return res
          .status(400)
          .json({ success: false, message: "Missing parameters" });
      }

      // Unique timestamp-based project ID
      const generateUniqueProjectId = (name) => {
        const timestamp = Date.now();
        return `${name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;
      };

      const projectId = generateUniqueProjectId(projectName);

      // Step 1: Create a Google Cloud Project
      const createProjectResponse = await fetch(GOOGLE_CLOUD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          projectId,
          name: projectName,
        }),
      });

      const createProjectData = await createProjectResponse.json();

      if (!createProjectResponse.ok) {
        const errorData = await createProjectResponse.json();
        return res
          .status(500)
          .json({ success: false, message: errorData.error.message });
      }

      console.log("Project creation response:", createProjectData);

      // Wait for the project to become active
      const checkProjectStatus = async (projectId) => {
        let attempts = 0;
        const maxAttempts = 10;
        const delay = 5000;

        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `${GOOGLE_CLOUD_API_URL}/${projectId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const statusData = await statusResponse.json();

          if (statusData.lifecycleState === "ACTIVE") {
            return true;
          }

          attempts++;
          console.log(
            `Waiting for project to be active... Attempt ${attempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        return false;
      };

      const projectActive = await checkProjectStatus(projectId);
      if (!projectActive) {
        return res.status(500).json({
          success: false,
          message: "Project creation timed out or failed to become active.",
        });
      }

      // Step 2: Enable Firebase Services
      const enableFirebaseResponse = await fetch(
        `${FIREBASE_API_URL}/${projectId}:addFirebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!enableFirebaseResponse.ok) {
        const errorData = await enableFirebaseResponse.json();
        return res
          .status(500)
          .json({ success: false, message: errorData.error.message });
      }

      console.log("Firebase services enabled successfully.");

      res.json({
        success: true,
        message: "Firebase project created successfully",
        firebaseProjectId: projectId,
      });
    } catch (error) {
      console.error("Error creating Firebase project:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });
});
