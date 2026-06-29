import { useCallback, useEffect, useState } from "react";
import { Bell, BookOpen, Calendar, Gamepad2, Home, LogOut, Target, Timer, Trophy, User, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import studyBuddyApi, { BuddyNotification } from "@/api/studyBuddyApi";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<BuddyNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const refreshNotificationCount = useCallback(async () => {
    try {
      const count = await studyBuddyApi.notificationCount();
      setNotificationCount(count);
    } catch (error) {
      console.error("Failed to load notification count:", error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    refreshNotificationCount();
    const interval = window.setInterval(refreshNotificationCount, 5000);
    const handleFocus = () => {
      void refreshNotificationCount();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshNotificationCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, refreshNotificationCount]);

  if (!isAuthenticated) return null;

  const links = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/focus", icon: Timer, label: "Focus" },
    { to: "/courses", icon: BookOpen, label: "Courses" },
    { to: "/buddies", icon: Users, label: "Buddies" },
    { to: "/games", icon: Gamepad2, label: "Games" },
    { to: "/deadlines", icon: Calendar, label: "Deadlines" },
    { to: "/habits", icon: Target, label: "Habits" },
    { to: "/achievements", icon: Trophy, label: "Achievements" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const openNotifications = async () => {
    setNotificationsOpen(true);
    setNotificationsLoading(true);
    try {
      const items = await studyBuddyApi.notifications();
      setNotifications(items);
      if (items.length > 0) {
        await studyBuddyApi.markNotificationsRead();
      }
      setNotificationCount(0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      });
    } finally {
      setNotificationsLoading(false);
      refreshNotificationCount();
    }
  };

  const goToNotification = (item: BuddyNotification) => {
    setNotificationsOpen(false);
    if ((item.type === "MESSAGE" || item.type === "SESSION") && item.buddy_id) {
      navigate(`/buddies?tab=mybuddies&buddyId=${item.buddy_id}`);
      return;
    }

    if (item.request_id) {
      navigate(`/buddies?tab=requests&requestId=${item.request_id}`);
    } else {
      navigate("/buddies?tab=requests");
    }
  };

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
            <button
              type="button"
              onClick={openNotifications}
              aria-label="Open notifications"
              className="relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all text-muted-foreground hover:text-primary hover:bg-muted/50 appearance-none"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 text-white border-0 px-1 text-[10px]">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
            </button>
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2">
              <ThemeToggle />
            </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>

          {notificationsLoading ? (
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No new notifications.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToNotification(item)}
                  className="w-full text-left p-4 rounded-2xl glass space-y-1 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {item.sender_name ?? item.sender_username}
                        {item.sender_surname ? ` ${item.sender_surname}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">@{item.sender_username}</p>
                    </div>
                    <Badge className="gradient-primary border-0">
                      {item.type === "MESSAGE" ? "Message" : item.type === "SESSION" ? "Session" : "Request"}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {item.title ? `${item.title}: ` : ""}
                    {item.preview ?? "Open to view details."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.type === "MESSAGE" || item.type === "SESSION" ? "Open chat" : "Open request"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;
