// NEXY Integration Package - Main Exports
// Simplified version for immediate integration

// Core Components (working)
export { ThreatDashboard } from './components/ThreatDashboard';
export { EnhancedThreatGlobe } from './components/EnhancedThreatGlobe';
export { NetworkTopologyVisualizer } from './components/NetworkTopologyVisualizer';
export { ThreatTimelineVisualizer } from './components/ThreatTimelineVisualizer';
export { AttackHeatMap } from './components/AttackHeatMap';
export { GeospatialAnalytics } from './components/GeospatialAnalytics';
export { MITREChainSimulator } from './components/MITREChainSimulator';
export { ThreatCorrelationMatrix } from './components/ThreatCorrelationMatrix';
export { AttackSurfaceVisualizer } from './components/AttackSurfaceVisualizer';
export { RealTimeAlertStream } from './components/RealTimeAlertStream';
export { AdminPanel } from './components/AdminPanel';
export { Navigation } from './components/Navigation';

// Store
export { useThreatStore } from './store/threatStore';

// Integration Services
export * from './services/nexy-integration';
export * from './providers/NEXYProvider';
export * from './types/nexy-integration';

// Import components for the library
import { ThreatDashboard } from './components/ThreatDashboard';
import { EnhancedThreatGlobe } from './components/EnhancedThreatGlobe';
import { NetworkTopologyVisualizer } from './components/NetworkTopologyVisualizer';
import { ThreatTimelineVisualizer } from './components/ThreatTimelineVisualizer';
import { AttackHeatMap } from './components/AttackHeatMap';
import { GeospatialAnalytics } from './components/GeospatialAnalytics';
import { MITREChainSimulator } from './components/MITREChainSimulator';
import { ThreatCorrelationMatrix } from './components/ThreatCorrelationMatrix';
import { AttackSurfaceVisualizer } from './components/AttackSurfaceVisualizer';
import { RealTimeAlertStream } from './components/RealTimeAlertStream';
import { AdminPanel } from './components/AdminPanel';
import { Navigation } from './components/Navigation';
import { useThreatStore } from './store/threatStore';

// Component Library for NEXY
export const NEXYThreatIntelligence = {
  // Main Dashboard
  Dashboard: ThreatDashboard,
  
  // 3D Visualizations
  Globe: {
    Enhanced: EnhancedThreatGlobe
  },
  
  // Analytical Visualizations
  Visualizers: {
    Network: NetworkTopologyVisualizer,
    Timeline: ThreatTimelineVisualizer,
    HeatMap: AttackHeatMap,
    Geospatial: GeospatialAnalytics,
    MITRE: MITREChainSimulator,
    Correlation: ThreatCorrelationMatrix,
    AttackSurface: AttackSurfaceVisualizer,
    AlertStream: RealTimeAlertStream
  },
  
  // Administration
  Admin: AdminPanel,
  
  // Navigation
  Navigation: Navigation,
  
  // Store
  Store: useThreatStore
};

// Ready-to-use integration patterns
export const NEXYIntegrationPatterns = {
  // Full platform integration
  FullDashboard: `
    import { NEXYProvider, NEXYThreatIntelligence } from '@/threat-intelligence';
    
    function App() {
      return (
        <NEXYProvider apiKey="your-key" environment="production">
          <NEXYThreatIntelligence.Navigation />
          <NEXYThreatIntelligence.Dashboard />
        </NEXYProvider>
      );
    }
  `,
  
  // Individual component integration
  SingleComponent: `
    import { NEXYThreatIntelligence } from '@/threat-intelligence';
    
    function ThreatView() {
      return (
        <div className="h-96">
          <NEXYThreatIntelligence.Globe.Enhanced />
        </div>
      );
    }
  `,
  
  // Custom visualization grid
  CustomGrid: `
    import { NEXYThreatIntelligence } from '@/threat-intelligence';
    
    function CustomAnalysis() {
      return (
        <div className="grid grid-cols-2 gap-4">
          <NEXYThreatIntelligence.Visualizers.Timeline />
          <NEXYThreatIntelligence.Visualizers.Correlation />
          <NEXYThreatIntelligence.Visualizers.HeatMap />
          <NEXYThreatIntelligence.Visualizers.AlertStream />
        </div>
      );
    }
  `
};

export default NEXYThreatIntelligence;