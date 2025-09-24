import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useSidebarStore } from "@/zustand/sidebarStore";
import {
  Timer,
  Target,
  CheckSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={`${isCollapsed ? "w-16" : "w-64"} h-screen border-r bg-background transition-all duration-300 ease-in-out relative`}
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

      <div className="p-4">
        {/* Header */}
        {!isCollapsed && (
          <div className="mb-6">
            <h1 className="text-lg font-semibold">Zendoro</h1>
            <p className="text-sm text-muted-foreground">
              Focus & Productivity
            </p>
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
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
