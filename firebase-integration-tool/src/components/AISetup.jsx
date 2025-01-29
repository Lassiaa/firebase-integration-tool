import { useState } from "react";

const AISetup = () => {
  const [isAISetup, setAISetup] = useState(false);

  const aiSetupSelection = () => {
    if (!isAISetup) {
      setAISetup(true);
    } else {
      setAISetup(false);
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
      {isAISetup ? (
        <>
          <p className="my-8 text-center">
            Tell about your new project to the AI. <br /> The AI will setup
            Firebase settings based on your description.
          </p>
          <textarea
            className="rounded-md w-1/2 h-32 p-2 my-8 mx-auto block text-black"
            name="Prompt"
            placeholder="Prompt"
          ></textarea>
          <button className="bg-white text-black rounded-md my-8 px-6 py-2 mx-auto block hover:bg-gray-200 ease-in-out duration-150">
            Submit
          </button>
        </>
      ) : (
        ""
      )}
    </article>
  );
};

export default AISetup;
