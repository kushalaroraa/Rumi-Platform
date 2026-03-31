import { createBrowserRouter } from "react-router";
import { MainApp } from './MainApp';
import { AdminPanel } from './components/AdminPanel';
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainApp />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
  },
]);
