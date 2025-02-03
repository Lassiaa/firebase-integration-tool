import { Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";

import FrontPage from "./views/FrontPage";
import ToolPage from "./views/ToolPage";
import ProjectPage from "./views/ProjectPage";

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/tool" element={<ToolPage />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
