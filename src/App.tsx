import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/AuthPage";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import { useUserProfile } from "./hooks/useUserProfile";
import { PageLoader } from "./components/ui/loading-spinner";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, needsOnboarding, refetch } = useUserProfile();

  if (authLoading || (user && profileLoading)) {
    return <PageLoader message="Loading your workspace..." />;
  }

  if (!user) {
    return <AuthPage onAuthenticated={() => {}} />;
  }

  if (needsOnboarding) {
    return <OnboardingWizard onComplete={refetch} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
