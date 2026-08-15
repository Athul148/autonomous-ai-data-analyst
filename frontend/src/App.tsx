import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import AnalyticsDashboard from "./pages/dashboard/AnalyticsDashboard";

import DatasetList from "./pages/dataset/DatasetList";
import DatasetWorkspace from "./pages/dataset/DatasetWorkspace";
import UploadDataset from "./pages/dataset/UploadDataset";

import ReportDetailsPage from "./pages/reports/ReportDetailsPage";
import ReportsPage from "./pages/reports/ReportsPage";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected routes */}
        <Route
          element={<ProtectedRoute />}
        >
          <Route
            element={<MainLayout />}
          >
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/datasets"
              element={<DatasetList />}
            />

            <Route
              path="/datasets/upload"
              element={<UploadDataset />}
            />

            <Route
              path="/datasets/:id"
              element={<DatasetWorkspace />}
            />

            <Route
              path="/reports"
              element={<ReportsPage />}
            />

            <Route
              path="/reports/:id"
              element={<ReportDetailsPage />}
            />

            <Route
              path="/analytics-dashboard"
              element={<AnalyticsDashboard />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;