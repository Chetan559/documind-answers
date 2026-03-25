import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/hooks/useTheme";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/config";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {/* <SmoothCursor /> */}
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/chat/:documentId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/quiz/:documentId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
