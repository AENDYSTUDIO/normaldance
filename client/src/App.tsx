import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SolanaWalletProvider } from "./contexts/SolanaWalletProvider";
import { EthereumWalletProvider } from "./contexts/EthereumWalletProvider";
import { TonWalletProvider } from "./contexts/TonWalletProvider";
import Feed from "./pages/Feed";
import Trends from "./pages/Trends";
import Explore from "./pages/Explore";
import Library from "./pages/Library";
import Upload from "./pages/Upload";
import Wallet from "./pages/Wallet";
import NFT from "./pages/NFT";
import Staking from "./pages/Staking";
import Statistics from "./pages/Statistics";
import GRave from "./pages/GRave";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Feed} />
      <Route path={"/trends"} component={Trends} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/library"} component={Library} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/nft"} component={NFT} />
      <Route path={"/staking"} component={Staking} />
      <Route path={"/stats"} component={Statistics} />
      <Route path={"/grave"} component={GRave} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SolanaWalletProvider>
          <EthereumWalletProvider>
            <TonWalletProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </TonWalletProvider>
          </EthereumWalletProvider>
        </SolanaWalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
