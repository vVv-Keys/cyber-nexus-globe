import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { ThreatGlobe } from './ThreatGlobe';
import { EnhancedThreatGlobe } from './EnhancedThreatGlobe';
import { AttackHeatMap } from './AttackHeatMap';
import { MITREChainSimulator } from './MITREChainSimulator';
import { NetworkTopologyVisualizer } from './NetworkTopologyVisualizer';
import { ThreatTimelineVisualizer } from './ThreatTimelineVisualizer';
import { GeospatialAnalytics } from './GeospatialAnalytics';
import { ThreatTooltip } from './ThreatTooltip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ThreatDashboard: React.FC = () => {
  const { 
    isSimulationRunning, 
    startSimulation, 
    stopSimulation, 
    selectedThreat,
    threats,
    generateMockThreats
  } = useThreatStore();

  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize with mock data on mount
  useEffect(() => {
    generateMockThreats();
  }, [generateMockThreats]);

  // Update tooltip position when threat is selected
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    if (selectedThreat) {
      setShowTooltip(true);
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      setShowTooltip(false);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedThreat]);

  const activeThreatCount = threats.filter(t => t.isActive).length;
  const criticalThreatCount = threats.filter(t => t.severity === 'critical').length;
  const highThreatCount = threats.filter(t => t.severity === 'high').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header 
        className="border-b border-border bg-card/50 backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-cyber-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold text-primary uppercase tracking-wide">
                  Cyber Nexus Globe
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-Time Threat Intelligence Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status indicators */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isSimulationRunning ? 'bg-destructive animate-cyber-pulse' : 'bg-muted-foreground'
                  }`} />
                  <span className="font-mono">
                    {isSimulationRunning ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
                <div className="text-muted-foreground">|</div>
                <div className="font-mono">
                  {activeThreatCount} Active Threats
                </div>
              </div>

              {/* Control buttons */}
              <Button
                onClick={isSimulationRunning ? stopSimulation : startSimulation}
                variant={isSimulationRunning ? "destructive" : "default"}
                className="font-mono"
              >
                {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-6">
        {/* Threat overview cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Total Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-foreground">{threats.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-destructive">{activeThreatCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-destructive">{criticalThreatCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                High Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-warning">{highThreatCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main visualization tabs */}
        <Tabs defaultValue="globe" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card/50 border border-border">
            <TabsTrigger 
              value="globe" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              3D Globe
            </TabsTrigger>
            <TabsTrigger 
              value="enhanced" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Enhanced Globe
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Network
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Heat Map
            </TabsTrigger>
            <TabsTrigger 
              value="mitre" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              MITRE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="globe" className="space-y-6">
            <motion.div 
              className="h-[70vh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ThreatGlobe />
            </motion.div>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <motion.div 
              className="h-[70vh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <EnhancedThreatGlobe />
            </motion.div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <NetworkTopologyVisualizer />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <ThreatTimelineVisualizer />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttackHeatMap />
                
                {/* Additional metrics */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="font-mono text-primary uppercase">
                      Threat Distribution
                    </CardTitle>
                    <CardDescription>
                      Attack types and frequency analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['malware', 'ddos', 'phishing', 'ransomware', 'intrusion', 'dataexfil'].map(type => {
                        const count = threats.filter(t => t.threatType === type).length;
                        const percentage = threats.length > 0 ? (count / threats.length) * 100 : 0;
                        
                        return (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-mono text-foreground capitalize">{type}</span>
                              <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-cyber-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Geospatial Analytics */}
              <GeospatialAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="mitre" className="space-y-6">
            <MITREChainSimulator />
          </TabsContent>
        </Tabs>

        {/* Integration notes for developers */}
        <motion.div 
          className="mt-8 p-4 bg-muted/20 border border-border rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-sm font-mono text-primary mb-2 uppercase tracking-wide">
            Integration Notes
          </h3>
          <div className="text-xs text-muted-foreground space-y-1 font-mono">
            <div>• Replace mock data in <code>threatStore.ts</code> with real-time API endpoints</div>
            <div>• Implement WebSocket connection for live threat feeds in <code>startSimulation()</code></div>
            <div>• Add authentication and authorization for threat data access</div>
            <div>• Configure backend integration for MITRE ATT&CK framework data</div>
            <div>• Set up proper error handling and offline mode capabilities</div>
          </div>
        </motion.div>
      </main>

      {/* Tooltip */}
      <ThreatTooltip
        threat={selectedThreat}
        position={tooltipPosition}
        isVisible={showTooltip}
      />
    </div>
  );
};