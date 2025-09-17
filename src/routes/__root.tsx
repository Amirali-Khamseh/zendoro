import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sidebar } from "@/componenets/Sidebar";
import { useSidebarStore } from "@/zustand/sidebarStore";
import "../index.css";

const RootLayout = () => {
  const { isCollapsed } = useSidebarStore();

  return (
    <main className="w-full min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>

      {/* Layout */}
      <div className="flex w-full h-full">
        <div
          className={`${isCollapsed ? "w-16" : "w-64"} bg-white rounded-r-2xl shadow-md transition-all duration-300 ease-in-out`}
        >
          <Sidebar />
        </div>
        <div
          className={`flex-1 p-4 overflow-x-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "max-w-4xl mx-auto" : ""}`}
        >
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </main>
  );
};

export const Route = createRootRoute({ component: RootLayout });
