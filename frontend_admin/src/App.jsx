import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminRegister from "./pages/Register";
import AdminLogin from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import ArticleList from "./pages/Articles/ArticleList";
import EditArticle from "./pages/Articles/EditArticle";
import AddArticle from "./pages/Articles/AddArticle";
import ActivityTable from "./components/ActivityTable";
import ProgressDetail from "./components/ProgressDetail";
import AddTryout from "./pages/tryout/AddTryout";
import GenerateTryout from "./pages/tryout/GenerateTryout";
import Sidebar from "./components/Sidebar";
import ModuleUpload from "./pages/moduls/ModuleUpload";
import ModuleList from "./pages/moduls/ModuleList";
import ModuleEdit from "./pages/moduls/ModuleEdit";
import Essay from "./pages/SoalEssay/essay";

// 🔹 Middleware untuk halaman yang butuh login admin
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect ke halaman login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes (Login & Register tidak butuh token) */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />

        {/* Protected Routes (harus sudah login admin) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <ActivityTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <ProgressDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/tryout/add"
          element={
            <PrivateRoute>
              <AddTryout />
            </PrivateRoute>
          }
        />

        <Route
          path="/tryout/generate"
          element={
            <PrivateRoute>
              <GenerateTryout />
            </PrivateRoute>
          }
        />

        <Route
          path="/articles/list"
          element={
            <PrivateRoute>
              <ArticleList />
            </PrivateRoute>
          }
        />

        <Route
          path="/articles/add"
          element={
            <PrivateRoute>
              <AddArticle />
            </PrivateRoute>
          }
        />

        <Route
          path="/articles/edit/:articleId"
          element={
            <PrivateRoute>
              <EditArticle />
            </PrivateRoute>
          }
        />

        {/*route untuk module*/}

        <Route
          path="/modules/list"
          element={
            <PrivateRoute>
              <ModuleList />
            </PrivateRoute>
          }
        />

        <Route
          path="/modules/upload"
          element={
            <PrivateRoute>
              <ModuleUpload />
            </PrivateRoute>
          }
        />

        <Route
          path="/modules/edit/:moduleId"
          element={
            <PrivateRoute>
              <ModuleEdit/>
            </PrivateRoute>
          }
        />

        {/* Essay */}
        <Route
          path="/soalessay/essay"
          element={
            <PrivateRoute>
              <Essay />
            </PrivateRoute>
          }
        />



        <Route path="/sidebar" element={<Sidebar />} />

        {/* Not Found */}
        <Route path="*" element={<h1 className="p-6 text-2xl">404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
