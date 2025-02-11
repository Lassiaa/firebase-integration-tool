import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Download = ({ selectedFeatures, selectedSettings }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  let projectName = localStorage.getItem("projectName");

  let importList = [];
  let exportList = [];

  const checkAuthProviders = async () => {
    importList = [];
    exportList = [];

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
  const generateFirebaseConfig = async (firebaseConfig) => {
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

        if (config.settings && selectedSettings[feature]?.length > 0) {
          selectedSettings[feature].forEach((setting) => {
            if (config.settings[setting]) {
              initializations.push(config.settings[setting]);
            }
          });
        }
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

    return fileContent;
  };

  const createZipAndDownload = async (firebaseConfig) => {
    const zip = new JSZip();

    // Utils folder content
    const firebaseConfigContent = await generateFirebaseConfig(firebaseConfig);
    zip.file("src/utils/firebase.js", firebaseConfigContent);

    zip.file(
      "src/views/FrontPage.jsx",
      `const FrontPage = () => {
  return (
    <div>
      <h1>Front page of ${projectName}</h1>
      <p>Start development</p>
    </div>
  );
};
export default FrontPage;
`
    );

    // Src folder content
    zip.file(
      "src/App.css",
      `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`
    );
    zip.file(
      "src/App.jsx",
      `import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import FrontPage from "./views/FrontPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
`
    );
    zip.file(
      "src/index.css",
      `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
    );
    zip.file(
      "src/main.jsx",
      `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`
    );

    // Root folder content
    zip.file(
      ".gitignore",
      `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
    );
    zip.file(
      "eslint.config.js",
      `import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
`
    );
    zip.file(
      "index.html",
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    );
    zip.file(
      "package.json",
      `{
    "name": "${projectName}",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "lint": "eslint .",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "latest",
      "react-dom": "latest",
      "react-router-dom": "latest"
    },
    "devDependencies": {
      "@eslint/js": "latest",
      "@types/react": "latest",
      "@types/react-dom": "latest",
      "@vitejs/plugin-react": "latest",
      "eslint": "latest",
      "eslint-plugin-react": "latest",
      "eslint-plugin-react-hooks": "latest",
      "eslint-plugin-react-refresh": "latest",
      "globals": "latest",
      "vite": "latest"
    }
}`
    );
    zip.file(
      "README.md",
      `# ${projectName}
#React + Vite
        
This is a React Vite Project made using Firebase Integration Tool.

Run the following commands and start development:
npm i
npm run dev

npm i downloads all of the newest dependencies for the project.
npm run dev starts the development server.`
    );
    zip.file(
      "vite.config.js",
      `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
`
    );

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${projectName}.zip`);
    });
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
        createZipAndDownload(data.firebaseConfig);
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
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ease-in-out duration-150"
        >
          Review Project
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-black relative">
              <span
                className="cursor-pointer text-gray-500 absolute top-6 right-6"
                onClick={() => setShowModal(false)}
              >
                ✕
              </span>
              <div className="">
                <h2 className="text-lg font-semibold text-center">
                  Review Project
                </h2>
                <h3 className="flex-grow text-center mb-6">{projectName}</h3>
              </div>
              <div className="mt-2 mb-6">
                <h3 className="font-semibold">Enabled Firebase Settings</h3>
                <div className="m-2">
                  {Object.keys(selectedFeatures || {}).map((key) => {
                    if (selectedFeatures[key]) {
                      if (selectedSettings[key]?.length > 0) {
                        return (
                          <div key={key}>
                            <p className="font-semibold">{key}</p>
                            <ul>
                              {selectedSettings[key].map((setting) => (
                                <li key={setting} className="ml-2">
                                  {setting}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return <p key={key}>{key}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                {/* Button to download the project */}
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ease-in-out duration-150"
                  disabled={loading}
                  onClick={() => {
                    setShowModal(false);
                    fetchFirebaseConfig();
                  }}
                >
                  Download
                </button>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center mt-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Download;
