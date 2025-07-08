import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Network, Filter, Download } from 'lucide-react';

interface CorrelationData {
  source: string;
  target: string;
  strength: number;
  count: number;
  types: string[];
}

export const ThreatCorrelationMatrix: React.FC = () => {
  const { threats } = useThreatStore();
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [correlationType, setCorrelationType] = useState<'ip' | 'country' | 'threatType'>('ip');
  const [selectedCell, setSelectedCell] = useState<CorrelationData | null>(null);

  const correlationData = useMemo(() => {
    const windowMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeWindow];

    const now = Date.now();
    const recentThreats = threats.filter(threat => 
      now - threat.timestamp.getTime() < windowMs
    );

    const correlations = new Map<string, CorrelationData>();
    const entityCounts = new Map<string, number>();

    // Count entities
    recentThreats.forEach(threat => {
      const entity = correlationType === 'ip' ? threat.source.ip :
                    correlationType === 'country' ? threat.source.country :
                    threat.threatType;
      entityCounts.set(entity, (entityCounts.get(entity) || 0) + 1);
    });

    // Calculate correlations
    recentThreats.forEach(threat1 => {
      recentThreats.forEach(threat2 => {
        if (threat1.id === threat2.id) return;

        const entity1 = correlationType === 'ip' ? threat1.source.ip :
                       correlationType === 'country' ? threat1.source.country :
                       threat1.threatType;
        const entity2 = correlationType === 'ip' ? threat2.source.ip :
                       correlationType === 'country' ? threat2.source.country :
                       threat2.threatType;

        if (entity1 === entity2) return;

        const key = [entity1, entity2].sort().join('::');
        if (!correlations.has(key)) {
          correlations.set(key, {
            source: entity1,
            target: entity2,
            strength: 0,
            count: 0,
            types: []
          });
        }

        const correlation = correlations.get(key)!;
        correlation.count++;
        
        if (!correlation.types.includes(threat1.threatType)) {
          correlation.types.push(threat1.threatType);
        }
        if (!correlation.types.includes(threat2.threatType)) {
          correlation.types.push(threat2.threatType);
        }
      });
    });

    // Calculate correlation strength (normalized)
    const maxCount = Math.max(...Array.from(correlations.values()).map(c => c.count));
    correlations.forEach(correlation => {
      correlation.strength = maxCount > 0 ? correlation.count / maxCount : 0;
    });

    return {
      correlations: Array.from(correlations.values())
        .filter(c => c.count > 1)
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 50), // Top 50 correlations
      entities: Array.from(entityCounts.keys()).slice(0, 20) // Top 20 entities
    };
  }, [threats, timeWindow, correlationType]);

  const getCorrelationStrength = (source: string, target: string): number => {
    const correlation = correlationData.correlations.find(c => 
      (c.source === source && c.target === target) ||
      (c.source === target && c.target === source)
    );
    return correlation?.strength || 0;
  };

  const getCorrelationData = (source: string, target: string): CorrelationData | null => {
    return correlationData.correlations.find(c => 
      (c.source === source && c.target === target) ||
      (c.source === target && c.target === source)
    ) || null;
  };

  const getIntensityColor = (strength: number): string => {
    if (strength > 0.8) return 'bg-destructive';
    if (strength > 0.6) return 'bg-orange-500';
    if (strength > 0.4) return 'bg-warning';
    if (strength > 0.2) return 'bg-info';
    if (strength > 0) return 'bg-success/50';
    return 'bg-muted';
  };

  const exportData = () => {
    const csvData = correlationData.correlations.map(c => 
      `${c.source},${c.target},${c.strength},${c.count},"${c.types.join(';')}"`
    ).join('\n');
    
    const blob = new Blob([`Source,Target,Strength,Count,Types\n${csvData}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-correlations-${timeWindow}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Controls */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-mono text-primary uppercase tracking-wide flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Threat Correlation Matrix</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={timeWindow} onValueChange={(value: any) => setTimeWindow(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={correlationType} onValueChange={(value: any) => setCorrelationType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="threatType">Threat Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matrix Visualization */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-4">
                Correlation matrix showing relationships between {correlationType === 'ip' ? 'IP addresses' : correlationType === 'country' ? 'countries' : 'threat types'}
              </div>
              
              {/* Matrix Grid */}
              <div className="relative overflow-auto max-h-96">
                <div className="grid gap-1" style={{ 
                  gridTemplateColumns: `repeat(${Math.min(correlationData.entities.length + 1, 16)}, minmax(0, 1fr))` 
                }}>
                  {/* Header row */}
                  <div></div>
                  {correlationData.entities.slice(0, 15).map((entity, index) => (
                    <div 
                      key={entity}
                      className="text-xs text-muted-foreground p-1 rotate-45 origin-bottom-left h-16 flex items-end"
                      title={entity}
                    >
                      {entity.length > 8 ? `${entity.substring(0, 8)}...` : entity}
                    </div>
                  ))}
                  
                  {/* Matrix cells */}
                  {correlationData.entities.slice(0, 15).map((sourceEntity, i) => (
                    <React.Fragment key={sourceEntity}>
                      <div className="text-xs text-muted-foreground p-1 flex items-center" title={sourceEntity}>
                        {sourceEntity.length > 12 ? `${sourceEntity.substring(0, 12)}...` : sourceEntity}
                      </div>
                      {correlationData.entities.slice(0, 15).map((targetEntity, j) => {
                        const strength = getCorrelationStrength(sourceEntity, targetEntity);
                        const data = getCorrelationData(sourceEntity, targetEntity);
                        
                        return (
                          <motion.div
                            key={`${sourceEntity}-${targetEntity}`}
                            className={`w-6 h-6 rounded-sm cursor-pointer border border-border/30 ${getIntensityColor(strength)}`}
                            style={{ opacity: i === j ? 0.3 : strength * 0.7 + 0.3 }}
                            onClick={() => setSelectedCell(data)}
                            whileHover={{ scale: 1.2, zIndex: 10 }}
                            transition={{ duration: 0.2 }}
                            title={data ? `${data.count} correlations, strength: ${(data.strength * 100).toFixed(1)}%` : 'No correlation'}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Correlation Strength:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-success/50 rounded"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-warning rounded"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-destructive rounded"></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div className="space-y-4">
          {/* Selected Correlation Details */}
          {selectedCell ? (
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-primary uppercase">
                  Correlation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Source</div>
                  <div className="text-sm font-mono text-foreground">{selectedCell.source}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="text-sm font-mono text-foreground">{selectedCell.target}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Correlation Count</div>
                  <div className="text-lg font-mono text-warning">{selectedCell.count}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Strength</div>
                  <div className="text-lg font-mono text-info">{(selectedCell.strength * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Threat Types</div>
                  <div className="space-y-1">
                    {selectedCell.types.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground text-sm">
                  Click on a matrix cell to view correlation details
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Correlations */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-primary uppercase">
                Strongest Correlations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {correlationData.correlations.slice(0, 8).map((correlation, index) => (
                <motion.div
                  key={`${correlation.source}-${correlation.target}`}
                  className="flex items-center justify-between p-2 rounded bg-muted/20 cursor-pointer hover:bg-muted/40"
                  onClick={() => setSelectedCell(correlation)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-foreground truncate">
                      {correlation.source} ↔ {correlation.target}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {correlation.count} occurrences
                    </div>
                  </div>
                  <div className="text-xs font-mono text-warning">
                    {(correlation.strength * 100).toFixed(0)}%
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};