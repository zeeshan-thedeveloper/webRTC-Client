import { BrowserRouter as Router, Link } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import HostCall from "./pages/HostCall";
import JoinCall from "./pages/JoinCall";

function Home() {
  return (
    <div style={{textAlign:"center",marginTop:"5%"}}>
      <h1>RBW-MEET</h1>
      <div>
        <Link to="/hostCall">
          <h3>Host Call</h3> 
        </Link>
      </div>
      <div>
        <Link to="/joinCall">
        <h3>Join Call</h3> 
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/hostCall" element={<HostCall />} />
          <Route path="/joinCall" element={<JoinCall />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
