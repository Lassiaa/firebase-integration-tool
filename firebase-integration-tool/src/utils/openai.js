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
  setupManager:
    "As an AI tool, you read the given a description of a web application. Then you define useful firebase settings based on the description and retrun true or false statements for the settings as a JSON object. Here are all of the functions that you need to define: Analytics, Authentication, Firestore Database, Functions, Realtime Database, Storage. And settings: Enable Debug Mode, Set Reporting Threshold, Google Auth, Facebook Auth, Enable Offline Persistence, Set Rules, Enable Regions, Set Environment Variables, Enable Offline Mode, Set Database Rules, Storage Set Rules, Enable File Versioning. Do not write anything else but the JSON object.",
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
