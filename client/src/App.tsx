import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Memorials from "./pages/Memorials";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";
import UploadTrack from "./pages/UploadTrack";
import MemorialDetail from "./pages/MemorialDetail";
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/memorials"} component={Memorials} />
      <Route path={"/player"} component={Player} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/upload"} component={UploadTrack} />
      <Route path={"/memorials/:id"} component={MemorialDetail} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
