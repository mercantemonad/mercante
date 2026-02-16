import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Jobs from "./pages/Jobs";
import ForAgents from "./pages/ForAgents";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="resources" element={<Resources />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="for-agents" element={<ForAgents />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
