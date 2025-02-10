import axios from "axios";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const endpoint = "https://api.openai.com/v1/chat/completions";

const db = getFirestore();

// Headers for the API request
const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

// Roles for the AI tool
const roles = {
  setupManager: `As an AI tool, you read the given description of a web application. Then define useful firebase settings for the described web app and retrun true or false statements for the settings as a JSON object. Here is the response form with all included options. { "Analytics": state, "Enable Debug Mode": state, "Set Reporting Threshold": state, "Authentication": state, "Apple Auth": state, "Facebook Auth": state, "GitHub Auth": state, "Google Auth": state, "Firebase Performance Monitoring": state, "Firebase Remote Config": state, "Set Config Parameters": state, "Firestore Database": state, "Enable Offline Persistence": state, "Functions": state, "Enable Regions": state, "Set Environment Variables": state, "Messaging": state, "Realtime Database": state, "Enable Offline Mode": state, "Storage": state, "Enable File Versioning": state } ONLY RETURN THE JSON OBJECT! NO ADDITIONAL CHARACTERS!`,
};

// Request data for the API, define what model to use
const requestData = {
  model: "gpt-3.5-turbo-0125",
  messages: [
    {
      role: "user",
      content: " ",
    },
    {
      role: "system",
      content: " ",
    },
  ],
};

// Function to write to log file
const writeToLog = async (
  model,
  tokenTotal,
  role,
  prompt,
  tokenPrompt,
  response,
  tokenResponse
) => {
  const logEntry = {
    model,
    role,
    tokenTotal,
    fullPrompt: {
      prompt,
      tokenPrompt,
    },
    fullResponse: {
      response,
      tokenResponse,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const logCollection = collection(db, "aiLogs");
    const docRef = await addDoc(logCollection, logEntry);

    console.log("Log saved successfully with ID:", docRef.id);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
};

const makeApiRequest = async (prompt, role) => {
  const maxRetries = 1;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      requestData.messages[1].content = role;
      requestData.messages[0].content = prompt;

      // Make the API request
      const response = await axios.post(endpoint, requestData, { headers });

      // Process and log the response
      const responseModel = response.data.model;
      const tokenTotal = response.data.usage.total_tokens;
      const tokenPrompt = response.data.usage.prompt_tokens;
      const tokenResponse = response.data.usage.completion_tokens;
      const responseRole = role;
      const responseText = response.data.choices[0].message.content;
      const promptText = requestData.messages[0].content;

      writeToLog(
        responseModel,
        tokenTotal,
        responseRole,
        promptText,
        tokenPrompt,
        responseText,
        tokenResponse
      );
      return responseText;
    } catch (error) {
      console.error(
        "API error:",
        error.response ? error.response.data : error.message
      );
      retries++;
    }
  }
};

export { makeApiRequest, roles };
