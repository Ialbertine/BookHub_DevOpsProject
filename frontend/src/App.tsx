import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/pages/librarian/Layout";
import LandingPage from "@/pages/librarian/LandingPage";
import CreateBook from "@/pages/librarian/CreateBook";
import ViewBook from "@/pages/librarian/ViewBook";
import Profile from "@/pages/librarian/Profile";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* private routes */}
          <Route
            path="/librarian-dashboard"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<LandingPage />} />
            <Route path="create-book" element={<CreateBook />} />
            <Route path="view/:id" element={<ViewBook />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;