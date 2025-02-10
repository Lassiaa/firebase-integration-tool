import { useState } from "react";

const Download = ({ selectedFeatures, selectedSettings }) => {
  const [loading, setLoading] = useState(false);

  let importList = [];
  let exportList = [];

  const checkAuthProviders = async () => {
    if (selectedSettings.Authentication.includes("Apple Auth")) {
      importList.push(" OAuthProvider");
    }
    if (selectedSettings.Authentication.includes("Facebook Auth")) {
      importList.push(" FacebookAuthProvider");
    }
    if (selectedSettings.Authentication.includes("GitHub Auth")) {
      importList.push(" GithubAuthProvider");
    }
    if (selectedSettings.Authentication.includes("Google Auth")) {
      importList.push(" GoogleAuthProvider");
    }

    if (selectedSettings.Authentication.includes("Apple Auth")) {
      exportList.push("appleProvider ");
    }
    if (selectedSettings.Authentication.includes("Facebook Auth")) {
      exportList.push("facebookProvider");
    }
    if (selectedSettings.Authentication.includes("GitHub Auth")) {
      exportList.push("githubProvider");
    }
    if (selectedSettings.Authentication.includes("Google Auth")) {
      exportList.push("googleProvider");
    }
  };

  // Download the firebase.js file
  const downloadFirebaseConfig = async (firebaseConfig) => {
    await checkAuthProviders();

    const imports = [`import { initializeApp } from "firebase/app";`];
    const initializations = [`const app = initializeApp(firebaseConfig);`];
    const exports = ["app"];

    // Feature configurations for Firebase
    const featureConfigs = {
      Analytics: {
        import: "",
        init: `const analytics = getAnalytics(app);`,
        settings: {
          "Enable Debug Mode": `analytics.setAnalyticsCollectionEnabled(true);`,
          "Set Reporting Threshold": `analytics.setReportMode(2);`,
        },
        export: "analytics",
      },
      Authentication: {
        import: `import { getAuth, ${importList} } from "firebase/auth";`,
        init: `const auth = getAuth(app);`,
        settings: {
          "Apple Auth": `const appleProvider = new OAuthProvider("apple.com");`,
          "Facebook Auth": `const facebookProvider = new FacebookAuthProvider();`,
          "GitHub Auth": `const githubProvider = new GithubAuthProvider();`,
          "Google Auth": `const googleProvider = new GoogleAuthProvider();`,
        },
        export: `auth, ${exportList}`,
      },
      "Firebase Performance Monitoring": {
        import: `import { getPerformance } from "firebase/performance";`,
        init: `const performance = getPerformance(app);`,
        export: "performance",
      },
      "Firebase Remote Config": {
        import: `import { getRemoteConfig } from "firebase/remote-config";`,
        init: `const remoteConfig = getRemoteConfig(app);`,
        settings: {
          "Set Config Parameters": `remoteConfig.settings = { ... }`,
        },
        export: "remoteConfig",
      },
      "Firestore Database": {
        import: `import { getFirestore } from "firebase/firestore";`,
        init: `const firestore = getFirestore(app);`,
        settings: {
          "Enable Offline Persistence": `firestore.enablePersistence();`,
          "Firestore caching": ``,
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
      Messaging: {
        import: `import { getMessaging } from "firebase/messaging";`,
        init: `const messaging = getMessaging(app);`,
        export: "messaging",
      },
      "Realtime Database": {
        import: `import { getDatabase } from "firebase/database";`,
        init: `const database = getDatabase(app);`,
        settings: {
          "Enable Offline Mode": `database.goOffline();`,
        },
        export: "database",
      },
      Storage: {
        import: `import { getStorage } from "firebase/storage";`,
        init: `const storage = getStorage(app);`,
        settings: {
          "Enable File Versioning": `storage.enableVersioning();`,
        },
        export: "storage",
      },
    };

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
  // Imports
  ${imports.join("\n")}
    
  // Firebase configurations
  const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
      
  // Firebase initializations
  ${initializations.join("\n")}
    
  // Exports
  export { ${exports.join(", ")} };
  `;

    const blob = new Blob([fileContent], { type: "application/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "firebase.js";
    link.click();
  };

  // Call the backend to fetch Firebase config
  const fetchFirebaseConfig = async () => {
    setLoading(true);

    const projectId = localStorage.getItem("projectId");
    const accessToken = localStorage.getItem("accessToken");

    if (!projectId || !accessToken) {
      alert("Project ID or access token is missing.");
      setLoading(false);
      return;
    }

    // Request to backend to fetch Firebase config
    try {
      const response = await fetch(
        import.meta.env.VITE_FIREBASE_FETCH_FUNCTION,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            projectId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        downloadFirebaseConfig(data.firebaseConfig);
      } else {
        throw new Error(data.message || "Failed to fetch Firebase config");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        `An error occurred: ${
          error.message || "Unable to fetch Firebase config"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-20">
      {/* Button to download firebase.js */}
      <div className="flex justify-center">
        <button
          onClick={fetchFirebaseConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Download Firebase.js
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </section>
  );
};

export default Download;
