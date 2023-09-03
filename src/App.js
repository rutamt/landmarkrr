import { Routes, Route, BrowserRouter } from "react-router-dom";

import PageWrapper from "./components/PageWrapper";
import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<PageWrapper page={<Index />} />} /> */}
        <Route path="/" element={<PageWrapper page={<Home />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
