import { Routes, Route } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Landing from "./components/Landing/Landing";
import CreateProject from "./features/project/pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User";
import Deployment from "./pages/Deployment";
import Service from "./pages/Service";
import Role from "./pages/Role";
import { useEffect } from "react";
// import { useUserStore } from '../../../store/userStore.js'
// import { useUserStore } from '../../../store/userStore.js'
import { useUserStore } from "./store/userStore";
import ViewProject from "./pages/ViewProject";
import Projects from "./features/project/pages/projectList";
import CreateThread from './features/thread/pages/CreateThread';
import Threads from "./pages/Threads";
import DashboardLayout from "./components/Layout/DashboardLayout";

function App() {
  const loadUser = useUserStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/role" element={<DashboardLayout><Role /></DashboardLayout>} />
      <Route path="/user" element={<DashboardLayout><User /></DashboardLayout>} />
      <Route path="/deployment" element={<DashboardLayout><Deployment /></DashboardLayout>} />
      <Route path="/service" element={<DashboardLayout><Service /></DashboardLayout>} />
      <Route path="/editor" element={<DashboardLayout><CreateProject /></DashboardLayout>} />
      <Route path="/view-project" element={<DashboardLayout><Projects /></DashboardLayout>} />
      <Route path="/project/view" element={<DashboardLayout><Projects /></DashboardLayout>} />
      <Route path="/project/:id" element={<DashboardLayout><ViewProject /></DashboardLayout>} />
      <Route path="/project/:projectId/create-thread" element={<DashboardLayout><CreateThread /></DashboardLayout>} />
      <Route path="/threads" element={<DashboardLayout><Threads /></DashboardLayout>} />
      <Route path="/threads/create" element={<DashboardLayout><CreateThread /></DashboardLayout>} />
      <Route path="/projects/:projectId/threads" element={<DashboardLayout><Threads /></DashboardLayout>} />
    </Routes>
  );
}

export default App;
