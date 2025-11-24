import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import LeadsPage from "./pages/Leads";
import DevisPage from "./pages/Devis";
import ChantiersPage from "./pages/Chantiers";
import StatistiquesPage from "./pages/Statistiques";
import ConfigurationPage from "./pages/Configuration";
import UsersPage from "./pages/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Index />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="devis" element={<DevisPage />} />
                <Route path="chantiers" element={<ChantiersPage />} />
                <Route path="statistiques" element={<StatistiquesPage />} />
                <Route path="utilisateurs" element={<UsersPage />} />
                <Route path="configuration" element={<ConfigurationPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
