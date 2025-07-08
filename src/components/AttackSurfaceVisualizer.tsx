import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Server, 
  Globe, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'web' | 'database' | 'api' | 'infrastructure' | 'application';
  ip: string;
  ports: number[];
  vulnerabilities: Vulnerability[];
  riskScore: number;
  status: 'online' | 'offline' | 'maintenance';
  lastScan: Date;
  location: string;
  protocols: string[];
}

interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvss: number;
  description: string;
  cve?: string;
  category: string;
  exploitable: boolean;
}

export const AttackSurfaceVisualizer: React.FC = () => {
  const { threats } = useThreatStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState<'all' | Asset['type']>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  // Mock attack surface data - replace with real data source
  const attackSurface = useMemo((): Asset[] => {
    const mockAssets: Asset[] = [
      {
        id: 'web-1',
        name: 'Main Web Server',
        type: 'web',
        ip: '192.168.1.100',
        ports: [80, 443, 8080],
        vulnerabilities: [
          {
            id: 'vuln-1',
            severity: 'high',
            cvss: 7.5,
            description: 'SQL Injection vulnerability in login form',
            cve: 'CVE-2023-1234',
            category: 'Injection',
            exploitable: true
          },
          {
            id: 'vuln-2',
            severity: 'medium',
            cvss: 5.3,
            description: 'Outdated SSL/TLS configuration',
            category: 'Cryptographic',
            exploitable: false
          }
        ],
        riskScore: 8.5,
        status: 'online',
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: 'DMZ',
        protocols: ['HTTP', 'HTTPS', 'WebSocket']
      },
      {
        id: 'db-1',
        name: 'Customer Database',
        type: 'database',
        ip: '10.0.1.50',
        ports: [3306, 33060],
        vulnerabilities: [
          {
            id: 'vuln-3',
            severity: 'critical',
            cvss: 9.8,
            description: 'Default credentials detected',
            category: 'Authentication',
            exploitable: true
          }
        ],
        riskScore: 9.8,
        status: 'online',
        lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000),
        location: 'Internal Network',
        protocols: ['MySQL', 'MySQL X Protocol']
      },
      {
        id: 'api-1',
        name: 'REST API Gateway',
        type: 'api',
        ip: '192.168.1.101',
        ports: [443, 8443],
        vulnerabilities: [
          {
            id: 'vuln-4',
            severity: 'medium',
            cvss: 6.1,
            description: 'Missing rate limiting on authentication endpoint',
            category: 'Business Logic',
            exploitable: true
          },
          {
            id: 'vuln-5',
            severity: 'low',
            cvss: 3.7,
            description: 'Information disclosure in error messages',
            category: 'Information Disclosure',
            exploitable: false
          }
        ],
        riskScore: 6.1,
        status: 'online',
        lastScan: new Date(Date.now() - 4 * 60 * 60 * 1000),
        location: 'DMZ',
        protocols: ['HTTPS', 'REST', 'GraphQL']
      },
      {
        id: 'infra-1',
        name: 'Load Balancer',
        type: 'infrastructure',
        ip: '192.168.1.10',
        ports: [80, 443, 22],
        vulnerabilities: [
          {
            id: 'vuln-6',
            severity: 'high',
            cvss: 7.2,
            description: 'SSH service exposed to internet',
            category: 'Network Security',
            exploitable: true
          }
        ],
        riskScore: 7.2,
        status: 'online',
        lastScan: new Date(Date.now() - 6 * 60 * 60 * 1000),
        location: 'Edge Network',
        protocols: ['HTTP', 'HTTPS', 'SSH']
      },
      {
        id: 'app-1',
        name: 'Mobile App Backend',
        type: 'application',
        ip: '10.0.2.30',
        ports: [8080, 8443],
        vulnerabilities: [
          {
            id: 'vuln-7',
            severity: 'medium',
            cvss: 5.9,
            description: 'Weak JWT signature validation',
            category: 'Authentication',
            exploitable: true
          }
        ],
        riskScore: 5.9,
        status: 'maintenance',
        lastScan: new Date(Date.now() - 12 * 60 * 60 * 1000),
        location: 'Internal Network',
        protocols: ['HTTP', 'HTTPS', 'WebSocket']
      }
    ];

    return mockAssets.filter(asset => {
      if (filterType !== 'all' && asset.type !== filterType) return false;
      if (filterRisk !== 'all') {
        const riskLevel = asset.riskScore >= 9 ? 'critical' :
                         asset.riskScore >= 7 ? 'high' :
                         asset.riskScore >= 4 ? 'medium' : 'low';
        if (riskLevel !== filterRisk) return false;
      }
      return true;
    });
  }, [filterType, filterRisk]);

  const surfaceMetrics = useMemo(() => {
    const total = attackSurface.length;
    const critical = attackSurface.filter(a => a.riskScore >= 9).length;
    const high = attackSurface.filter(a => a.riskScore >= 7 && a.riskScore < 9).length;
    const medium = attackSurface.filter(a => a.riskScore >= 4 && a.riskScore < 7).length;
    const exposedPorts = attackSurface.reduce((sum, asset) => sum + asset.ports.length, 0);
    const totalVulns = attackSurface.reduce((sum, asset) => sum + asset.vulnerabilities.length, 0);
    const exploitableVulns = attackSurface.reduce((sum, asset) => 
      sum + asset.vulnerabilities.filter(v => v.exploitable).length, 0);

    return {
      total,
      critical,
      high,
      medium,
      exposedPorts,
      totalVulns,
      exploitableVulns,
      averageRisk: total > 0 ? attackSurface.reduce((sum, a) => sum + a.riskScore, 0) / total : 0
    };
  }, [attackSurface]);

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'web': return <Globe className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'api': return <Wifi className="w-4 h-4" />;
      case 'infrastructure': return <Server className="w-4 h-4" />;
      case 'application': return <Shield className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 9) return 'text-destructive';
    if (score >= 7) return 'text-orange-500';
    if (score >= 4) return 'text-warning';
    return 'text-success';
  };

  const getStatusIcon = (status: Asset['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-3 h-3 text-success" />;
      case 'offline': return <XCircle className="w-3 h-3 text-destructive" />;
      case 'maintenance': return <AlertTriangle className="w-3 h-3 text-warning" />;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-xl font-mono text-primary uppercase tracking-wide flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Attack Surface Analysis</span>
          </CardTitle>
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-foreground">{surfaceMetrics.total}</div>
              <div className="text-xs text-muted-foreground uppercase">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-destructive">{surfaceMetrics.critical}</div>
              <div className="text-xs text-muted-foreground uppercase">Critical Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-warning">{surfaceMetrics.exposedPorts}</div>
              <div className="text-xs text-muted-foreground uppercase">Exposed Ports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-info">{surfaceMetrics.exploitableVulns}</div>
              <div className="text-xs text-muted-foreground uppercase">Exploitable</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border">
          <TabsTrigger value="assets" className="font-mono">Assets</TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="font-mono">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="exposure" className="font-mono">Exposure Map</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assets List */}
            <Card className="lg:col-span-2 bg-card/50 border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono text-primary">Asset Inventory</CardTitle>
                  <div className="flex space-x-2">
                    <select 
                      className="text-xs bg-input border border-border rounded px-2 py-1"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="all">All Types</option>
                      <option value="web">Web</option>
                      <option value="database">Database</option>
                      <option value="api">API</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="application">Application</option>
                    </select>
                    <select 
                      className="text-xs bg-input border border-border rounded px-2 py-1"
                      value={filterRisk}
                      onChange={(e) => setFilterRisk(e.target.value as any)}
                    >
                      <option value="all">All Risk</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {attackSurface.map((asset) => (
                  <motion.div
                    key={asset.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAsset?.id === asset.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-muted/20 hover:bg-muted/40'
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getAssetIcon(asset.type)}
                        <div>
                          <div className="font-mono text-sm text-foreground">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.ip} • {asset.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(asset.status)}
                        <div className="text-right">
                          <div className={`text-sm font-mono ${getRiskColor(asset.riskScore)}`}>
                            {asset.riskScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">Risk Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4">
                      <div className="text-xs text-muted-foreground">
                        Ports: {asset.ports.join(', ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vulns: {asset.vulnerabilities.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last Scan: {asset.lastScan.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Asset Details */}
            <div className="space-y-4">
              {selectedAsset ? (
                <>
                  <Card className="bg-card/50 border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-mono text-primary uppercase flex items-center space-x-2">
                        {getAssetIcon(selectedAsset.type)}
                        <span>Asset Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div className="text-sm font-mono text-foreground">{selectedAsset.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">IP Address</div>
                        <div className="text-sm font-mono text-foreground">{selectedAsset.ip}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Type</div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedAsset.type}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedAsset.status)}
                          <span className="text-sm capitalize">{selectedAsset.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Open Ports</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAsset.ports.map(port => (
                            <Badge key={port} variant="secondary" className="text-xs">
                              {port}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Protocols</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAsset.protocols.map(protocol => (
                            <Badge key={protocol} variant="outline" className="text-xs">
                              {protocol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-mono text-primary uppercase">
                        Vulnerabilities ({selectedAsset.vulnerabilities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedAsset.vulnerabilities.map((vuln) => (
                        <div key={vuln.id} className="p-3 rounded border border-border bg-muted/10">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={vuln.severity === 'critical' ? 'destructive' : 
                                     vuln.severity === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {vuln.severity.toUpperCase()}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-warning">CVSS: {vuln.cvss}</span>
                              {vuln.exploitable ? (
                                <Unlock className="w-3 h-3 text-destructive" />
                              ) : (
                                <Lock className="w-3 h-3 text-success" />
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-foreground mt-2">{vuln.description}</div>
                          {vuln.cve && (
                            <div className="text-xs text-muted-foreground mt-1">CVE: {vuln.cve}</div>
                          )}
                          <div className="text-xs text-muted-foreground">Category: {vuln.category}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-muted-foreground text-sm">
                      Select an asset to view details
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary">Vulnerability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['critical', 'high', 'medium', 'low'].map(severity => {
                  const vulns = attackSurface.flatMap(asset => 
                    asset.vulnerabilities.filter(v => v.severity === severity)
                  );
                  
                  return (
                    <div key={severity} className="p-4 rounded-lg border border-border bg-muted/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-mono text-foreground uppercase">{severity}</h3>
                        <div className="text-lg font-mono text-warning">{vulns.length}</div>
                      </div>
                      <div className="space-y-2">
                        {vulns.slice(0, 3).map((vuln, index) => (
                          <div key={`${vuln.id}-${index}`} className="text-xs">
                            <div className="text-foreground">{vuln.description.substring(0, 40)}...</div>
                            <div className="text-muted-foreground">CVSS: {vuln.cvss}</div>
                          </div>
                        ))}
                        {vulns.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{vulns.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exposure" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary">Network Exposure Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-sm">Network topology visualization coming soon</div>
                <div className="text-xs mt-2">
                  This will show asset relationships and network exposure paths
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};