import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Focus from "./pages/Focus";
import Courses from "./pages/Courses";
import StudyBuddies from "./pages/StudyBuddies";
import Deadlines from "./pages/Deadlines";
import Habits from "./pages/Habits";
import Achievements from "./pages/Achievements";
import Certificates from "./pages/Certificates";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <div className="pb-20 md:pb-0 md:pt-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/buddies" element={<StudyBuddies />} />
              <Route path="/deadlines" element={<Deadlines />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
