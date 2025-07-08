import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Shield, 
  Activity, 
  Wifi,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
// import { logger } from '../utils/logger';
// import { telemetryManager } from '../utils/telemetry';
// import { securityManager } from '../utils/security';
// import { performanceMonitor } from '../utils/performance';
import { useToast } from '@/hooks/use-toast';

interface AppConfig {
  apiEndpoints: {
    threatFeed: string;
    webSocket: string;
    analytics: string;
  };
  features: {
    realTimeUpdates: boolean;
    soundNotifications: boolean;
    darkMode: boolean;
    performanceMonitoring: boolean;
    telemetryEnabled: boolean;
  };
  security: {
    rateLimitEnabled: boolean;
    cspEnabled: boolean;
    inputSanitization: boolean;
  };
  performance: {
    maxCacheSize: number;
    renderOptimization: boolean;
    webWorkerEnabled: boolean;
  };
}

export const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AppConfig>({
    apiEndpoints: {
      threatFeed: '',
      webSocket: '',
      analytics: ''
    },
    features: {
      realTimeUpdates: true,
      soundNotifications: true,
      darkMode: true,
      performanceMonitoring: true,
      telemetryEnabled: true
    },
    security: {
      rateLimitEnabled: true,
      cspEnabled: true,
      inputSanitization: true
    },
    performance: {
      maxCacheSize: 50,
      renderOptimization: true,
      webWorkerEnabled: false
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    [key: string]: 'connected' | 'disconnected' | 'error' | 'testing'
  }>({});

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('threatIntel_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        // logger.warn('Failed to load saved config', { error }, 'AdminPanel');
      }
    }

    // Start performance monitoring if enabled
    // if (config.features.performanceMonitoring) {
    //   performanceMonitor.startMonitoring();
    // }
  }, []);

  const saveConfig = () => {
    try {
      localStorage.setItem('threatIntel_config', JSON.stringify(config));
      
      // Apply configuration changes
      applyConfiguration();
      
      toast({
        title: "Configuration Saved",
        description: "Settings have been applied successfully.",
      });

      // telemetryManager.track('config_saved', { config }, 'business');
      // logger.info('Configuration saved', config, 'AdminPanel');
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
      // logger.error('Failed to save config', { error }, 'AdminPanel');
    }
  };

  const resetConfig = () => {
    const defaultConfig: AppConfig = {
      apiEndpoints: { threatFeed: '', webSocket: '', analytics: '' },
      features: {
        realTimeUpdates: true,
        soundNotifications: true,
        darkMode: true,
        performanceMonitoring: true,
        telemetryEnabled: true
      },
      security: {
        rateLimitEnabled: true,
        cspEnabled: true,
        inputSanitization: true
      },
      performance: {
        maxCacheSize: 50,
        renderOptimization: true,
        webWorkerEnabled: false
      }
    };
    
    setConfig(defaultConfig);
    toast({
      title: "Configuration Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const testConnection = async (endpoint: string, type: string) => {
    if (!endpoint) return;
    
    setConnectionStatus(prev => ({ ...prev, [type]: 'testing' }));
    
    try {
      const response = await fetch(endpoint, { 
        method: 'HEAD',
        mode: 'no-cors' // For CORS-enabled endpoints
      });
      
      setConnectionStatus(prev => ({ ...prev, [type]: 'connected' }));
      toast({
        title: "Connection Test",
        description: `${type} endpoint is reachable.`,
      });
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [type]: 'error' }));
      toast({
        title: "Connection Failed",
        description: `Failed to reach ${type} endpoint.`,
        variant: "destructive",
      });
    }
  };

  const applyConfiguration = () => {
    // Apply security settings
    // securityManager.updateConfig({
    //   enableCSP: config.security.cspEnabled,
    //   rateLimitRequests: config.security.rateLimitEnabled ? 100 : 1000,
    //   sanitizeInputs: config.security.inputSanitization
    // });

    // Apply telemetry settings
    // if (config.features.telemetryEnabled) {
    //   telemetryManager.enable();
    //   if (config.apiEndpoints.analytics) {
    //     telemetryManager.setEndpoint('primary', config.apiEndpoints.analytics);
    //   }
    // } else {
    //   telemetryManager.disable();
    // }

    // Apply performance settings
    // if (config.features.performanceMonitoring) {
    //   performanceMonitor.startMonitoring();
    // } else {
    //   performanceMonitor.stopMonitoring();
    // }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'testing': return <Activity className="w-4 h-4 text-warning animate-spin" />;
      default: return <Wifi className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-intel-config.json';
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
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-mono text-primary uppercase tracking-wide flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>System Administration</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={exportConfig} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={resetConfig} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveConfig} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border">
          <TabsTrigger value="endpoints" className="font-mono">API Endpoints</TabsTrigger>
          <TabsTrigger value="features" className="font-mono">Features</TabsTrigger>
          <TabsTrigger value="security" className="font-mono">Security</TabsTrigger>
          <TabsTrigger value="performance" className="font-mono">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.apiEndpoints).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-mono capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()} URL
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={value}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        apiEndpoints: { ...prev.apiEndpoints, [key]: e.target.value }
                      }))}
                      placeholder={`Enter ${key} endpoint URL`}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => testConnection(value, key)}
                      variant="outline"
                      size="sm"
                      disabled={!value || connectionStatus[key] === 'testing'}
                    >
                      {getStatusIcon(connectionStatus[key])}
                    </Button>
                  </div>
                  {connectionStatus[key] && (
                    <Badge variant={connectionStatus[key] === 'connected' ? 'default' : 'destructive'}>
                      {connectionStatus[key]}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary">Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-mono capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, [key]: checked }
                    }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.security).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-mono capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, [key]: checked }
                    }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-primary flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Performance Tuning</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-mono">Max Cache Size (MB)</Label>
                <Input
                  type="number"
                  value={config.performance.maxCacheSize}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    performance: { ...prev.performance, maxCacheSize: parseInt(e.target.value) || 50 }
                  }))}
                  min="10"
                  max="500"
                />
              </div>
              {Object.entries(config.performance).filter(([key]) => key !== 'maxCacheSize').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-mono capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      performance: { ...prev.performance, [key]: checked }
                    }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};