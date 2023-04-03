import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import JoinCall from "./pages/JoinCall";
import Dashboard from "./pages/Dashboard";
import Authenticator from "./pages/Authenticator";
import StartCall from "./pages/StartCall";

function App() {
  return (
    <Router>
      <Routes>
      <Route path='/' element={<Authenticator/>} />
      <Route path='/join-call' element={<JoinCall/>} />
      <Route path='/start-call' element={<StartCall/>} />
      <Route path='/dashboard' element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
