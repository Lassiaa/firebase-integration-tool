import { Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";

import FrontPage from "./views/FrontPage";
import LoginPage from "./views/LoginPage";
import ToolPage from "./views/ToolPage";

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tool" element={<ToolPage />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
