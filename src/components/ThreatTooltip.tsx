import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatEvent } from '../store/threatStore';

interface ThreatTooltipProps {
  threat: ThreatEvent | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const ThreatTooltip: React.FC<ThreatTooltipProps> = ({
  threat,
  position,
  isVisible,
}) => {
  if (!threat) return null;

  const severityColors = {
    low: 'text-success',
    medium: 'text-warning', 
    high: 'text-warning',
    critical: 'text-destructive'
  };

  const threatTypeIcons = {
    malware: '🦠',
    ddos: '⚡',
    phishing: '🎣',
    ransomware: '🔒',
    intrusion: '🚪',
    dataexfil: '📤'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x + 10,
            top: position.y - 10,
            transform: 'translate(0, -100%)'
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{threatTypeIcons[threat.threatType]}</span>
                <h3 className="text-sm font-mono text-primary uppercase tracking-wide">
                  {threat.threatType}
                </h3>
              </div>
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full border ${severityColors[threat.severity]}`}>
                {threat.severity}
              </span>
            </div>

            {/* Threat Details */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-muted-foreground">SOURCE</div>
                  <div className="font-mono text-foreground">
                    <div>{threat.source.ip}</div>
                    <div className="text-muted-foreground">
                      {threat.source.city}, {threat.source.country}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">TARGET</div>
                  <div className="font-mono text-foreground">
                    <div>{threat.destination.ip}</div>
                    <div className="text-muted-foreground">
                      {threat.destination.city}, {threat.destination.country}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="pt-2 border-t border-border">
                <div className="text-muted-foreground">TIMESTAMP</div>
                <div className="font-mono text-foreground">
                  {threat.timestamp.toLocaleDateString()} {threat.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Description */}
              {threat.description && (
                <div className="pt-2 border-t border-border">
                  <div className="text-muted-foreground">DESCRIPTION</div>
                  <div className="text-foreground text-wrap">
                    {threat.description}
                  </div>
                </div>
              )}

              {/* MITRE ID */}
              {threat.mitreId && (
                <div className="pt-2 border-t border-border">
                  <div className="text-muted-foreground">MITRE ATT&CK</div>
                  <div className="font-mono text-primary">
                    {threat.mitreId}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div className="text-muted-foreground">STATUS</div>
                <div className={`flex items-center space-x-1 ${
                  threat.isActive ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    threat.isActive ? 'bg-destructive animate-cyber-pulse' : 'bg-muted-foreground'
                  }`} />
                  <span className="text-xs font-mono">
                    {threat.isActive ? 'ACTIVE' : 'RESOLVED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cyberpunk border effect */}
            <div className="absolute inset-0 rounded-lg border border-primary/30 animate-cyber-glow pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};