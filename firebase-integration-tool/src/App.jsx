import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";

import FrontPage from "./views/FrontPage";
import ToolPage from "./views/ToolPage";
import ProjectPage from "./views/ProjectPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/tool" element={<ToolPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
