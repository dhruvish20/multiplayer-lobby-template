import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegistrationPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import GameComponent from "./components/GameComponent.tsx"; // Import GameComponent
import React from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/game/:officeCode" element={<GameComponent />} /> 
        {/* Game route with officeCode */}
      </Routes>
    </Router>
  );
}

export default App;
