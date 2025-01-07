import { Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";

import FrontPage from "./views/FrontPage";

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
