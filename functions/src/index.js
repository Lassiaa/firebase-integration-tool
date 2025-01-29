/* eslint-disable object-curly-spacing */
/* eslint-disable quote-props */
/* eslint-disable comma-dangle */
/* eslint-disable indent */

const fetch = require("node-fetch");
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

admin.initializeApp();

// Verify the Google ID token from the client
const verifyAccessToken = async (accessToken) => {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Access token verification failed: ${data.error_description}`
      );
    }

    // The ID token is valid, return the data
    return data;
  } catch (error) {
    throw new Error("Error verifying access token: " + error.message);
  }
};

exports.createFirebaseProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { firebaseProjectName, userId, accessToken } = req.body;

    if (!firebaseProjectName || !userId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Project name, user ID, and access token are required.",
      });
    }

    try {
      // Step 1: Verify the access token
      const verifiedUser = await verifyAccessToken(accessToken);
      console.log("Verified User:", verifiedUser);

      // Step 2: Check if the user has a folder (can act as their organization)
      let folderId = await getFolderIdForUser(userId, accessToken);

      // Step 3: If no folder exists, create a new folder
      if (!folderId) {
        const folderName = `${userId}-folder`;
        const createFolderResponse = await createFolder(
          folderName,
          accessToken
        );

        if (createFolderResponse.data && createFolderResponse.data.name) {
          folderId = createFolderResponse.data.name.split("/").pop();
        } else {
          console.error("Folder name is not available in the response.");
          throw new Error("Folder creation failed, name is missing.");
        }

        console.log("New folder created with ID:", folderId);
        await saveFolderIdForUser(userId, folderId);
      }

      // Step 4: Create the GCP project under the folder
      const projectId = await createGCPProject(
        firebaseProjectName,
        folderId,
        accessToken
      );

      // Step 5: Add Firebase to the project
      await addFirebaseToProject(projectId, accessToken);

      // Step 6: Retrieve the Firebase web app configuration
      const configResponse = await getFirebaseConfig(
        projectId,
        firebaseProjectName,
        accessToken
      );

      return res.status(200).json({
        success: true,
        config: configResponse,
      });
    } catch (error) {
      console.error("Error creating project or retrieving config:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

// Function to get a folder ID for the user
const getFolderIdForUser = async (userId, accessToken) => {
  try {
    const response = await fetch(
      "https://cloudresourcemanager.googleapis.com/v3/folders",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();

    if (data.folders) {
      const folder = data.folders.find(
        (folder) => folder.displayName === `${userId}-folder`
      );
      return folder ? folder.name.split("/").pop() : null;
    }

    return null;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return null;
  }
};

// Function to create a new folder in GCP
const createFolder = async (folderName, accessToken) => {
  const response = await fetch(
    "https://cloudresourcemanager.googleapis.com/v3/folders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: folderName,
        parent: "organizations/",
      }),
    }
  );

  const data = await response.json();
  if (data.error) {
    console.error("Error creating folder:", data.error);
    throw new Error(`Folder creation failed: ${data.error.message}`);
  }

  console.log("Folder creation response:", data);
  return data;
};

// Function to create a GCP project under a folder
const createGCPProject = async (firebaseProjectName, folderId, accessToken) => {
  const response = await fetch(
    "https://cloudresourcemanager.googleapis.com/v1/projects",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: firebaseProjectName,
        name: firebaseProjectName,
        parent: {
          type: "folder",
          id: folderId,
        },
      }),
    }
  );

  const data = await response.json();
  return data.projectId;
};

// Function to add Firebase to a project
const addFirebaseToProject = async (projectId, accessToken) => {
  const response = await fetch(
    `https://firebase.googleapis.com/v1beta1/projects/${projectId}:addFirebase`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

// Function to get Firebase config for a web app
const getFirebaseConfig = async (
  projectId,
  firebaseProjectName,
  accessToken
) => {
  const response = await fetch(
    `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: firebaseProjectName,
      }),
    }
  );

  const data = await response.json();
  const appId = data.name.split("/").pop();

  const configResponse = await fetch(
    `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const configData = await configResponse.json();
  return configData;
};

// Function to save folder ID for the user
const saveFolderIdForUser = async (userId, folderId) => {
  const db = admin.firestore();
  await db.collection("userFolders").doc(userId).set({ folderId });
};
