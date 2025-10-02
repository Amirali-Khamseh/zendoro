import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sidebar } from "@/componenets/Sidebar";
import { useSidebarStore } from "@/zustand/sidebarStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import "../index.css";

const RootLayout = () => {
  const { isCollapsed } = useSidebarStore();

  useDocumentTitle("Zendoro");

  return (
    <main className="w-full min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => useSidebarStore.getState().toggleSidebar()}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Zendoro</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Layout */}
      <div className="flex w-full h-full pt-14 md:pt-0">
        {/* Desktop/Tablet Sidebar */}
        <div
          className={`hidden md:block ${isCollapsed ? "w-16" : "w-64"} bg-white rounded-r-2xl shadow-md transition-all duration-300 ease-in-out`}
        >
          <Sidebar />
        </div>

        {/* Mobile Sidebar - Overlay */}
        <div
          className={`md:hidden fixed inset-y-0 left-0 z-50 ${isCollapsed ? "-translate-x-full" : "translate-x-0"} w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out pt-14`}
        >
          <Sidebar />
        </div>

        {/* Mobile Backdrop */}
        {!isCollapsed && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => useSidebarStore.getState().toggleSidebar()}
          />
        )}

        <div
          className={`flex-1 p-2 md:p-4 overflow-x-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "" : "md:max-w-4xl md:mx-auto"}`}
        >
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </main>
  );
};

export const Route = createRootRoute({ component: RootLayout });
