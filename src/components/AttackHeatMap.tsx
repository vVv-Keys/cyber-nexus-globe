import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';

export const AttackHeatMap: React.FC = () => {
  const { threats, attackMetrics } = useThreatStore();

  // Calculate heat map data
  const heatMapData = useMemo(() => {
    const countryData = new Map<string, { count: number; severity: number }>();
    
    threats.forEach(threat => {
      const country = threat.destination.country;
      const existing = countryData.get(country) || { count: 0, severity: 0 };
      
      const severityWeight = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      }[threat.severity];

      countryData.set(country, {
        count: existing.count + 1,
        severity: existing.severity + severityWeight
      });
    });

    return Array.from(countryData.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        avgSeverity: data.severity / data.count,
        intensity: Math.min(data.count / Math.max(...Array.from(countryData.values()).map(d => d.count)), 1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries
  }, [threats]);

  const getIntensityColor = (intensity: number, avgSeverity: number) => {
    if (avgSeverity >= 3.5) return `rgba(255, 0, 0, ${0.3 + intensity * 0.7})`; // Red for critical
    if (avgSeverity >= 2.5) return `rgba(255, 136, 0, ${0.3 + intensity * 0.7})`; // Orange for high
    if (avgSeverity >= 1.5) return `rgba(255, 255, 0, ${0.3 + intensity * 0.7})`; // Yellow for medium
    return `rgba(0, 255, 0, ${0.3 + intensity * 0.7})`; // Green for low
  };

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-mono text-primary uppercase tracking-wide">
          Attack Heat Map
        </h2>
        <div className="text-sm text-muted-foreground">
          Top targets by volume & severity
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Intensity:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-3 bg-gradient-to-r from-green-500/30 to-red-500/100 rounded" />
            <span className="text-muted-foreground">Low → High</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Severity:</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-success/60 rounded" />
            <div className="w-3 h-3 bg-warning/60 rounded" />
            <div className="w-3 h-3 bg-orange-500/60 rounded" />
            <div className="w-3 h-3 bg-destructive/60 rounded" />
          </div>
        </div>
      </div>

      {/* Heat map bars */}
      <div className="space-y-3">
        {heatMapData.map((item, index) => (
          <motion.div
            key={item.country}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono text-foreground">
                {item.country}
              </span>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span>{item.count} attacks</span>
                <span className="font-mono">
                  Avg: {item.avgSeverity.toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="relative h-6 bg-muted rounded-md overflow-hidden">
              <motion.div
                className="h-full rounded-md border border-border/30"
                style={{ 
                  backgroundColor: getIntensityColor(item.intensity, item.avgSeverity),
                  width: `${item.intensity * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${item.intensity * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
              
              {/* Pulse effect for high-threat countries */}
              {item.avgSeverity >= 2.5 && (
                <div 
                  className="absolute inset-0 animate-cyber-pulse"
                  style={{ 
                    backgroundColor: getIntensityColor(item.intensity, item.avgSeverity),
                  }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-mono text-primary">
            {Object.keys(attackMetrics.activeThreatsByCountry).length}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Countries Affected
          </div>
        </div>
        <div>
          <div className="text-2xl font-mono text-warning">
            {Math.max(...Object.values(attackMetrics.activeThreatsByCountry)) || 0}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Max Attacks/Country
          </div>
        </div>
        <div>
          <div className="text-2xl font-mono text-destructive">
            {threats.filter(t => t.severity === 'critical').length}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Critical Threats
          </div>
        </div>
      </div>
    </motion.div>
  );
};