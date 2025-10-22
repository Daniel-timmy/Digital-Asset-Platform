// src/components/CreatorLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import CreatorSidebar from "./CreatorSidebar";

const CreatorLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatorLayout;
