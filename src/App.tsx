import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";
import { EnhancedThreatGlobe } from "./components/EnhancedThreatGlobe";
import { NetworkTopologyVisualizer } from "./components/NetworkTopologyVisualizer";
import { ThreatTimelineVisualizer } from "./components/ThreatTimelineVisualizer";
import { AttackHeatMap } from "./components/AttackHeatMap";
import { GeospatialAnalytics } from "./components/GeospatialAnalytics";
import { MITREChainSimulator } from "./components/MITREChainSimulator";
import { ThreatCorrelationMatrix } from "./components/ThreatCorrelationMatrix";
import { AttackSurfaceVisualizer } from "./components/AttackSurfaceVisualizer";
import { RealTimeAlertStream } from "./components/RealTimeAlertStream";
import { AdminPanel } from "./components/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main className="container mx-auto px-6 py-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/globe" element={
                <div className="h-[80vh]">
                  <EnhancedThreatGlobe />
                </div>
              } />
              <Route path="/network" element={<NetworkTopologyVisualizer />} />
              <Route path="/timeline" element={<ThreatTimelineVisualizer />} />
              <Route path="/heatmap" element={
                <div className="space-y-6">
                  <AttackHeatMap />
                  <GeospatialAnalytics />
                </div>
              } />
              <Route path="/mitre" element={<MITREChainSimulator />} />
              <Route path="/correlation" element={<ThreatCorrelationMatrix />} />
              <Route path="/surface" element={<AttackSurfaceVisualizer />} />
              <Route path="/alerts" element={<RealTimeAlertStream />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;