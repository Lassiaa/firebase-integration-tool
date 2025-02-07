/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
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

// Function to create Google Cloud and Firebase project, then register a web app
exports.createFirebaseProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    console.log("Received request:", req.method);

    if (req.method !== "POST") {
      console.log("Method Not Allowed");
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
    }

    try {
      const { projectName, accessToken } = req.body;
      console.log("Request body:", req.body);

      if (!projectName || !accessToken) {
        console.log("Missing parameters: projectName or accessToken");
        return res
          .status(400)
          .json({ success: false, message: "Missing parameters" });
      }

      // Generate a unique project ID
      const generateUniqueProjectId = (name) =>
        `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const projectId = generateUniqueProjectId(projectName);
      console.log("Generated projectId:", projectId);

      // Create the project
      const createProjectResponse = await fetch(GOOGLE_CLOUD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ projectId, name: projectName }),
      });

      if (!createProjectResponse.ok) {
        const errorData = await createProjectResponse.json();
        console.log("Failed to create project:", errorData);
        return res.status(500).json({
          success: false,
          message:
            errorData.error && errorData.error.message
              ? errorData.error.message
              : "Failed to create project",
        });
      }

      console.log("Project created, checking status...");

      // Check the status of the project
      const checkProjectStatus = async () => {
        for (let attempts = 0; attempts < 10; attempts++) {
          try {
            const statusResponse = await fetch(
              `${GOOGLE_CLOUD_API_URL}/${projectId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const statusData = await statusResponse.json();
            console.log("Project status:", statusData);
            if (statusData.lifecycleState === "ACTIVE") return true;
          } catch (err) {
            console.error("Error checking project status:", err);
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        return false;
      };

      if (!(await checkProjectStatus())) {
        console.log("Project creation timed out");
        return res
          .status(500)
          .json({ success: false, message: "Project creation timed out." });
      }

      console.log("Enabling Firebase services...");

      // Enable Firebase services
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
        console.log("Failed to enable Firebase:", errorData);
        return res.status(500).json({
          success: false,
          message:
            errorData.error && errorData.error.message
              ? errorData.error.message
              : "Failed to enable Firebase services",
        });
      }

      console.log("Waiting for Firebase to initialize...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Register the web app
      console.log("Registering web app...");
      const registerWebAppResponse = await fetch(
        `${FIREBASE_API_URL}/${projectId}/webApps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ displayName: projectName }),
        }
      );

      // Wait a bit for the web app to register
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (registerWebAppResponse.ok) {
        const webAppData = await registerWebAppResponse.json();
        console.log("Full webAppData:", webAppData);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return res.json({
          success: true,
          message: "Firebase project and web app created successfully",
          firebaseProjectId: projectId,
        });
      } else {
        const errorText = await registerWebAppResponse.text();
        console.log("Failed to register web app:", errorText);
        return res.status(500).json({
          success: false,
          message: "Error registering web app",
          details: errorText,
        });
      }
    } catch (error) {
      console.error("Error creating Firebase project:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });
});

// Function to fetch Firebase Web App config
exports.fetchConfig = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
    }

    // Fetch the Firebase web app config
    try {
      const { projectId } = req.body;
      console.log(`Fetching config for project: ${projectId}`);

      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing projectId" });
      }

      // Extract the Bearer token from the Authorization header
      const accessToken =
        req.headers.authorization && req.headers.authorization.split(" ")[1];

      console.log("Access Token:", accessToken);

      if (!accessToken) {
        return res
          .status(400)
          .json({ success: false, message: "Missing access token" });
      }

      // Get the web app ID from the list of web apps
      const listAppsResponse = await fetch(
        `${FIREBASE_API_URL}/${projectId}/webApps`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!listAppsResponse.ok) {
        const errorText = await listAppsResponse.text();
        console.log("Failed to list web apps:", errorText);
        return res.status(500).json({
          success: false,
          message: "Error listing web apps",
          details: errorText,
        });
      }

      const appsData = await listAppsResponse.json();
      console.log("List of web apps:", appsData);

      const appId = appsData.apps[0].appId;
      console.log("App ID from list:", appId);

      // Now fetch the config using the web app ID
      const firebaseConfigResponse = await fetch(
        `${FIREBASE_API_URL}/${projectId}/webApps/${appId}/config`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!firebaseConfigResponse.ok) {
        const errorData = await firebaseConfigResponse.json();
        console.error("Firebase API Error:", errorData);
        return res.status(500).json({
          success: false,
          message: "Error fetching web app config",
          details: errorData,
        });
      }

      // Extract the Firebase web app config
      const firebaseConfigData = await firebaseConfigResponse.json();
      return res.json({
        success: true,
        message: "Firebase web app config retrieved",
        firebaseConfig: firebaseConfigData,
      });
    } catch (error) {
      console.error("Error fetching Firebase web app config:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });
});
