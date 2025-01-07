import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const navigate = useNavigate();

  return (
    <main className="w-full px-2">
      <section>
        <h1 className="text-center text-3xl font-bold my-8">
          Firebase Integration Tool
        </h1>
        <p className="text-center">
          This is the front page of the application.
        </p>
        <button
          className="bg-white text-black rounded-md my-8 px-6 py-2 mx-auto block hover:bg-gray-200 ease-in-out duration-150"
          onClick={() => {
            navigate("/tool");
          }}
        >
          Start!
        </button>
      </section>
    </main>
  );
};

export default FrontPage;
