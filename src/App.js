import "./App.css";

import Login from "./components/auth/login";
import Register from "./components/auth/register";

import Header from "./components/header";
import Home from './pages/home';
import CalendarPage from "./pages/calendarPage";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import AllAvailabilityPage from './pages/AllAvailabilityPage';



function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/calendar/:groupID",
      element: <CalendarPage />,
    },
      {
    path: "/calendar/:groupID/all",  
    element: <AllAvailabilityPage />,
  },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;