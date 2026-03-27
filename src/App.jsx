import { Routes, Route } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Landing from "./components/Landing/Landing";
import CreateProject from "./features/project/pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import User from './features/user/pages/User'
import Deployment from "./pages/Deployment";
import Service from "./pages/Service";
import Role from "./features/role/pages/Role";
import { useEffect } from "react";
import { useUserStore } from "./store/userStore";
import ViewProject from "./pages/ViewProject";
import Projects from "./features/project/pages/projectList";
import DashboardLayout from "./components/Layout/DashboardLayout";
import CreateTask from './features/task/pages/CreateTask';
import Tasks from "./features/task/pages/Tasks"; // Make sure this exists
import Threads from './features/thread/pages/Threads';
import CreateThread from './features/thread/pages/CreateThread';
import ViewThread from './features/thread/pages/viewThread';
import EditThread from './features/thread/pages/EditThread'; // Create this component
import EditTask from './features/task/pages/EditTask'; // Create this component
import ViewUsers from "./features/user/pages/ViewUsers";
import CreateRole from "./features/role/pages/Role";
import ViewRoles from "./features/role/pages/ViewRoles";

function App() {
  const loadUser = useUserStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Layout Routes */}
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
      
      {/* Thread Routes */}
      <Route path="/threads" element={<DashboardLayout><Threads /></DashboardLayout>} />
      <Route path="/threads/create" element={<DashboardLayout><CreateThread /></DashboardLayout>} />
      <Route path="/thread/:threadId" element={<DashboardLayout><ViewThread /></DashboardLayout>} />
      <Route path="/threads/:threadId/edit" element={<DashboardLayout><EditThread /></DashboardLayout>} />
      
      {/* Task Routes */}
      <Route path="/threads/:threadId/create-task" element={<DashboardLayout><CreateTask /></DashboardLayout>} />
      <Route path="/threads/:threadId/tasks/:taskId/edit" element={<DashboardLayout><EditTask /></DashboardLayout>} />
      <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
      <Route path="/my-tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
      <Route path="/projects/:projectId/threads" element={<DashboardLayout><Threads /></DashboardLayout>} />
      <Route path="/users" element={
        <DashboardLayout>
          <ViewUsers />
        </DashboardLayout>
      } />

      <Route path="/user" element={
        <DashboardLayout>
          <User />
        </DashboardLayout>
      } />
      <Route path="/role" element={<DashboardLayout><CreateRole /></DashboardLayout>} />
      <Route path="/view-role" element={<DashboardLayout><ViewRoles /></DashboardLayout>} />
    </Routes>
  );
}

export default App;