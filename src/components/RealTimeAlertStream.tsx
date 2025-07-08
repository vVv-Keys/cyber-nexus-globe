import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  MapPin, 
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface Alert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'intrusion' | 'malware' | 'ddos' | 'phishing' | 'dataexfil' | 'ransomware';
  source: {
    ip: string;
    country: string;
    city: string;
  };
  target: {
    ip: string;
    service: string;
    port: number;
  };
  message: string;
  details: string;
  confidence: number;
  acknowledged: boolean;
  falsePositive: boolean;
}

export const RealTimeAlertStream: React.FC = () => {
  const { threats, isSimulationRunning } = useThreatStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | Alert['severity']>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate mock alerts based on threats
  useEffect(() => {
    if (!isSimulationRunning || isPaused) return;

    const generateAlert = () => {
      const alertTypes: Alert['type'][] = ['intrusion', 'malware', 'ddos', 'phishing', 'dataexfil', 'ransomware'];
      const severities: Alert['severity'][] = ['low', 'medium', 'high', 'critical'];
      const services = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS', 'MySQL', 'PostgreSQL'];
      
      const randomThreat = threats[Math.floor(Math.random() * threats.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      
      const messages = {
        intrusion: `Suspicious ${service} access pattern detected`,
        malware: `Malware signature detected in ${service} traffic`,
        ddos: `High volume ${service} requests indicating DDoS attack`,
        phishing: `Phishing attempt detected via ${service}`,
        dataexfil: `Unusual data transfer detected on ${service}`,
        ransomware: `Ransomware behavior detected targeting ${service}`
      };

      const newAlert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity,
        type,
        source: randomThreat ? {
          ip: randomThreat.source.ip,
          country: randomThreat.source.country,
          city: randomThreat.source.city
        } : {
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          country: 'Unknown',
          city: 'Unknown'
        },
        target: {
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          service,
          port: service === 'HTTP' ? 80 : service === 'HTTPS' ? 443 : service === 'SSH' ? 22 : Math.floor(Math.random() * 65535)
        },
        message: messages[type],
        details: `Detected by IDS sensor at ${new Date().toLocaleTimeString()}. Confidence: ${60 + Math.floor(Math.random() * 40)}%`,
        confidence: 60 + Math.floor(Math.random() * 40),
        acknowledged: false,
        falsePositive: false
      };

      setAlerts(prev => {
        const updated = [newAlert, ...prev];
        // Keep only last 100 alerts
        return updated.slice(0, 100);
      });

      // Play sound for critical alerts
      if (soundEnabled && (severity === 'critical' || severity === 'high')) {
        playAlertSound(severity);
      }
    };

    // Generate alerts at varying intervals
    const getNextInterval = () => {
      return Math.random() * 5000 + 1000; // 1-6 seconds
    };

    const scheduleNextAlert = () => {
      setTimeout(() => {
        generateAlert();
        if (isSimulationRunning && !isPaused) {
          scheduleNextAlert();
        }
      }, getNextInterval());
    };

    scheduleNextAlert();
  }, [isSimulationRunning, isPaused, threats, soundEnabled]);

  // Auto-scroll to top when new alerts arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [alerts, autoScroll]);

  const playAlertSound = (severity: Alert['severity']) => {
    try {
      // Create audio context for beep sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different severities
      const frequencies = {
        low: 440,
        medium: 550,
        high: 660,
        critical: 880
      };
      
      oscillator.frequency.setValueAtTime(frequencies[severity], audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const markFalsePositive = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, falsePositive: true } : alert
    ));
  };

  const exportAlerts = () => {
    const csvData = alerts.map(alert => 
      `${alert.timestamp.toISOString()},${alert.severity},${alert.type},${alert.source.ip},${alert.target.ip},${alert.target.service},${alert.message.replace(/,/g, ';')}`
    ).join('\n');
    
    const blob = new Blob([`Timestamp,Severity,Type,Source IP,Target IP,Service,Message\n${csvData}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAlerts = alerts.filter(alert => 
    filterSeverity === 'all' || alert.severity === filterSeverity
  );

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive bg-destructive/10';
      case 'high': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'medium': return 'text-warning border-warning bg-warning/10';
      case 'low': return 'text-success border-success bg-success/10';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'intrusion': return <Shield className="w-4 h-4" />;
      case 'malware': return <AlertTriangle className="w-4 h-4" />;
      case 'ddos': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    unacknowledged: alerts.filter(a => !a.acknowledged && !a.falsePositive).length,
    falsePositives: alerts.filter(a => a.falsePositive).length
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-mono text-primary uppercase tracking-wide flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Real-Time Alert Stream</span>
              {isSimulationRunning && !isPaused && (
                <div className="w-2 h-2 bg-destructive rounded-full animate-cyber-pulse ml-2"></div>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setAutoScroll(!autoScroll)}
                variant="outline"
                size="sm"
                className={autoScroll ? "border-primary text-primary" : ""}
              >
                {autoScroll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                size="sm"
                className={soundEnabled ? "border-primary text-primary" : ""}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                size="sm"
                className={isPaused ? "border-warning text-warning" : "border-success text-success"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                onClick={exportAlerts}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-foreground">{alertStats.total}</div>
              <div className="text-xs text-muted-foreground uppercase">Total Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-destructive">{alertStats.critical}</div>
              <div className="text-xs text-muted-foreground uppercase">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-warning">{alertStats.unacknowledged}</div>
              <div className="text-xs text-muted-foreground uppercase">Unacknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-info">{alertStats.falsePositives}</div>
              <div className="text-xs text-muted-foreground uppercase">False Positives</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by severity:</span>
            </div>
            <div className="flex space-x-2">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(severity => (
                <Button
                  key={severity}
                  onClick={() => setFilterSeverity(severity)}
                  variant={filterSeverity === severity ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Stream */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-mono text-primary">
            Live Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[600px] w-full">
            <div className="space-y-2">
              <AnimatePresence>
                {filteredAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    } ${alert.falsePositive ? 'opacity-40' : ''}`}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs uppercase">
                              {alert.type}
                            </Badge>
                            <Badge 
                              variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs uppercase"
                            >
                              {alert.severity}
                            </Badge>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {alert.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          
                          <div className="text-sm text-foreground font-medium mb-2">
                            {alert.message}
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                Source: {alert.source.ip} ({alert.source.country})
                              </div>
                              <div>
                                Target: {alert.target.ip}:{alert.target.port} ({alert.target.service})
                              </div>
                            </div>
                            <div>
                              {alert.details}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-xs text-muted-foreground">
                          {alert.confidence}%
                        </div>
                        {!alert.acknowledged && !alert.falsePositive && (
                          <>
                            <Button
                              onClick={() => acknowledgeAlert(alert.id)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              ACK
                            </Button>
                            <Button
                              onClick={() => markFalsePositive(alert.id)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              FP
                            </Button>
                          </>
                        )}
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-xs text-success">
                            ACK
                          </Badge>
                        )}
                        {alert.falsePositive && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            FP
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No alerts to display</div>
                  <div className="text-xs mt-1">
                    {isPaused ? 'Stream is paused' : 'Waiting for new alerts...'}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};
