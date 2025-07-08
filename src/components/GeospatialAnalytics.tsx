import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GeospatialMetric {
  country: string;
  coordinates: [number, number];
  incomingThreats: number;
  outgoingThreats: number;
  riskScore: number;
  threatTypes: Record<string, number>;
  avgSeverity: number;
}

export const GeospatialAnalytics: React.FC = () => {
  const { threats } = useThreatStore();

  // Advanced geospatial analysis
  const geospatialData = useMemo(() => {
    const countryMetrics = new Map<string, GeospatialMetric>();

    threats.forEach(threat => {
      const sourceCountry = threat.source.country;
      const destCountry = threat.destination.country;
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[threat.severity];

      // Initialize source country
      if (!countryMetrics.has(sourceCountry)) {
        countryMetrics.set(sourceCountry, {
          country: sourceCountry,
          coordinates: [threat.source.lng, threat.source.lat],
          incomingThreats: 0,
          outgoingThreats: 0,
          riskScore: 0,
          threatTypes: {},
          avgSeverity: 0
        });
      }

      // Initialize destination country
      if (!countryMetrics.has(destCountry)) {
        countryMetrics.set(destCountry, {
          country: destCountry,
          coordinates: [threat.destination.lng, threat.destination.lat],
          incomingThreats: 0,
          outgoingThreats: 0,
          riskScore: 0,
          threatTypes: {},
          avgSeverity: 0
        });
      }

      // Update metrics
      const sourceMetric = countryMetrics.get(sourceCountry)!;
      const destMetric = countryMetrics.get(destCountry)!;

      sourceMetric.outgoingThreats++;
      destMetric.incomingThreats++;

      sourceMetric.riskScore += severityWeight;
      destMetric.riskScore += severityWeight * 1.5; // Targets get higher risk score

      // Track threat types
      sourceMetric.threatTypes[threat.threatType] = (sourceMetric.threatTypes[threat.threatType] || 0) + 1;
      destMetric.threatTypes[threat.threatType] = (destMetric.threatTypes[threat.threatType] || 0) + 1;
    });

    // Calculate average severity
    countryMetrics.forEach(metric => {
      const totalThreats = metric.incomingThreats + metric.outgoingThreats;
      if (totalThreats > 0) {
        metric.avgSeverity = metric.riskScore / totalThreats;
      }
    });

    return Array.from(countryMetrics.values());
  }, [threats]);

  // Regional analysis
  const regionalAnalysis = useMemo(() => {
    const regions = {
      'North America': ['United States', 'Canada', 'Mexico'],
      'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
      'Asia': ['China', 'Japan', 'India', 'South Korea', 'Singapore', 'Thailand'],
      'Middle East': ['Saudi Arabia', 'UAE', 'Israel', 'Iran', 'Turkey'],
      'Africa': ['South Africa', 'Nigeria', 'Egypt', 'Kenya'],
      'Oceania': ['Australia', 'New Zealand'],
      'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia']
    };

    const regionMetrics = Object.entries(regions).map(([region, countries]) => {
      const regionData = geospatialData.filter(data => 
        countries.includes(data.country)
      );

      return {
        region,
        countries: regionData.length,
        totalThreats: regionData.reduce((sum, d) => sum + d.incomingThreats + d.outgoingThreats, 0),
        avgRiskScore: regionData.length > 0 ? 
          regionData.reduce((sum, d) => sum + d.riskScore, 0) / regionData.length : 0,
        topThreatType: Object.entries(
          regionData.reduce((acc, d) => {
            Object.entries(d.threatTypes).forEach(([type, count]) => {
              acc[type] = (acc[type] || 0) + count;
            });
            return acc;
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      };
    }).sort((a, b) => b.avgRiskScore - a.avgRiskScore);

    return regionMetrics;
  }, [geospatialData]);

  // Threat vector analysis
  const threatVectors = useMemo(() => {
    const vectors = new Map<string, { count: number; avgSeverity: number; countries: Set<string> }>();

    threats.forEach(threat => {
      const vector = `${threat.source.country} → ${threat.destination.country}`;
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[threat.severity];

      if (!vectors.has(vector)) {
        vectors.set(vector, { count: 0, avgSeverity: 0, countries: new Set() });
      }

      const data = vectors.get(vector)!;
      data.count++;
      data.avgSeverity = (data.avgSeverity * (data.count - 1) + severityWeight) / data.count;
      data.countries.add(threat.source.country);
      data.countries.add(threat.destination.country);
    });

    return Array.from(vectors.entries())
      .map(([vector, data]) => ({ vector, ...data, uniqueCountries: data.countries.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [threats]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Regional Risk Assessment */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="font-mono text-primary uppercase tracking-wide">
            Regional Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {regionalAnalysis.slice(0, 4).map((region, index) => (
                <motion.div
                  key={region.region}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <div className="font-mono text-foreground">{region.region}</div>
                    <div className="text-xs text-muted-foreground">
                      {region.countries} countries • {region.totalThreats} threats
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Top threat: <span className="text-warning">{region.topThreatType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-mono ${
                      region.avgRiskScore > 10 ? 'text-destructive' :
                      region.avgRiskScore > 5 ? 'text-warning' : 'text-success'
                    }`}>
                      {region.avgRiskScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">risk score</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              {regionalAnalysis.slice(4).map((region, index) => (
                <motion.div
                  key={region.region}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 4) * 0.1 }}
                >
                  <div>
                    <div className="font-mono text-foreground">{region.region}</div>
                    <div className="text-xs text-muted-foreground">
                      {region.countries} countries • {region.totalThreats} threats
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Top threat: <span className="text-warning">{region.topThreatType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-mono ${
                      region.avgRiskScore > 10 ? 'text-destructive' :
                      region.avgRiskScore > 5 ? 'text-warning' : 'text-success'
                    }`}>
                      {region.avgRiskScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">risk score</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Attack Vectors */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="font-mono text-primary uppercase tracking-wide">
            Critical Attack Vectors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threatVectors.map((vector, index) => (
              <motion.div
                key={vector.vector}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex-1">
                  <div className="font-mono text-sm text-foreground">{vector.vector}</div>
                  <div className="text-xs text-muted-foreground">
                    {vector.count} attacks • Avg severity: {vector.avgSeverity.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-mono text-primary">{vector.count}</div>
                    <div className="text-xs text-muted-foreground">attacks</div>
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-cyber-danger rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((vector.count / Math.max(...threatVectors.map(v => v.count))) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Country Risk Matrix */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="font-mono text-primary uppercase tracking-wide">
            Country Risk Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geospatialData
              .sort((a, b) => b.riskScore - a.riskScore)
              .slice(0, 12)
              .map((country, index) => (
                <motion.div
                  key={country.country}
                  className="p-3 bg-muted/20 rounded-lg border border-border/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm text-foreground">{country.country}</div>
                    <div className={`text-sm font-mono ${
                      country.riskScore > 15 ? 'text-destructive' :
                      country.riskScore > 10 ? 'text-warning' : 'text-success'
                    }`}>
                      {country.riskScore.toFixed(0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Incoming:</span>
                      <span className="text-destructive">{country.incomingThreats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outgoing:</span>
                      <span className="text-warning">{country.outgoingThreats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top threat:</span>
                      <span className="text-primary">
                        {Object.entries(country.threatTypes)
                          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};