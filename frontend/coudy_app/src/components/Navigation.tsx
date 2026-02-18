import { Home, Users, Calendar, Target, Trophy, User, Timer, BookOpen, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  const links = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/focus", icon: Timer, label: "Focus" },
    { to: "/courses", icon: BookOpen, label: "Courses" },
    { to: "/buddies", icon: Users, label: "Buddies" },
    { to: "/deadlines", icon: Calendar, label: "Deadlines" },
    { to: "/habits", icon: Target, label: "Habits" },
    { to: "/achievements", icon: Trophy, label: "Achievements" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50">
      <div className="glass-card border-0 rounded-none md:rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex justify-around md:justify-center md:gap-6 py-3 flex-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all",
                    isActive
                      ? "gradient-primary text-white shadow-lg scale-105"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs md:text-sm font-medium">Logout</span>
            </button>
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2">
              <ThemeToggle />
            </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
