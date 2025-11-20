import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useSidebarStore } from "@/zustand/sidebarStore";
import { isAuthenticated } from "@/lib/authVerification";
import { logout } from "@/lib/authHelpers";
import {
  Timer,
  Target,
  CheckSquare,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`${isCollapsed ? "w-16" : "w-64"} h-screen border-r bg-background transition-all duration-300 ease-in-out relative flex flex-col`}
    >
      {/* Toggle Button on Border - Desktop only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        {!isCollapsed && (
          <div className="mb-6">
            {/* <h1 className="text-lg font-semibold">Zendoro</h1>
            <p className="text-sm text-muted-foreground">
              Focus & Productivity
            </p> */}
            <img src="./public/logo.svg" alt="Zendoro Logo" />
          </div>
        )}

        {/* Navigation */}
        <nav className={`space-y-2 ${isCollapsed ? "mt-16" : ""}`}>
          {isCollapsed ? (
            // Collapsed view - only icons
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="Focus Time"
                asChild
              >
                <Link to="/">
                  <Timer className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="Habit Tracker"
                asChild
              >
                <Link to="/habit-tracker">
                  <Target className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="TODOs"
                asChild
              >
                <Link to="/todo">
                  <CheckSquare className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="Reminder"
                asChild
              >
                <Link to="/reminder">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="AI Assistant"
                asChild
              >
                <Link to="/agent">
                  <Bot className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            // Expanded view - full content
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0"
                asChild
              >
                <Link to="/">
                  <Timer className="h-4 w-4 mr-2" />
                  Focus Time
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0"
                asChild
              >
                <Link to="/habit-tracker">
                  <Target className="h-4 w-4 mr-2" />
                  Habit Tracker
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0"
                asChild
              >
                <Link to="/todo">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  TODOs
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0"
                asChild
              >
                <Link to="/reminder">
                  <Bell className="h-4 w-4 mr-2" />
                  Reminder
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0"
                asChild
              >
                <Link to="/agent">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Authentication Section - Bottom of Sidebar */}
        <div className="mt-auto pt-4 border-t">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-4">
              {!isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  title="Login"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive"
                  title="Logout"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {!isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-0"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-0 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
