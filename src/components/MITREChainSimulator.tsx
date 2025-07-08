import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreatStore, MITREAttackPhase } from '../store/threatStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const MITREChainSimulator: React.FC = () => {
  const { mitreChain, updateMITREPhase } = useThreatStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  // Simulate attack progression
  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentPhaseIndex(0);
    
    // Reset all phases
    mitreChain.forEach(phase => {
      updateMITREPhase(phase.id, { isActive: false, progress: 0 });
    });

    // Start progression
    simulatePhase(0);
  };

  const simulatePhase = (index: number) => {
    if (index >= mitreChain.length) {
      setIsSimulating(false);
      return;
    }

    const phase = mitreChain[index];
    updateMITREPhase(phase.id, { isActive: true, progress: 0 });
    setCurrentPhaseIndex(index);

    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress between 5-20%
      updateMITREPhase(phase.id, { progress: Math.min(progress, 100) });

      if (progress >= 100) {
        clearInterval(interval);
        updateMITREPhase(phase.id, { isActive: false, progress: 100 });
        
        // Move to next phase after a brief delay
        setTimeout(() => {
          simulatePhase(index + 1);
        }, 1000);
      }
    }, 200);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    // Reset all phases
    mitreChain.forEach(phase => {
      updateMITREPhase(phase.id, { isActive: false, progress: 0 });
    });
  };

  const resetSimulation = () => {
    stopSimulation();
    setCurrentPhaseIndex(0);
  };

  // Technique descriptions for tooltips
  const techniqueDescriptions: Record<string, string> = {
    'T1595': 'Active Scanning',
    'T1592': 'Gather Victim Host Information',
    'T1589': 'Gather Victim Identity Information',
    'T1566': 'Phishing',
    'T1190': 'Exploit Public-Facing Application',
    'T1133': 'External Remote Services',
    'T1059': 'Command and Scripting Interpreter',
    'T1204': 'User Execution',
    'T1053': 'Scheduled Task/Job',
    'T1547': 'Boot or Logon Autostart Execution',
    'T1543': 'Create or Modify System Process',
    'T1574': 'Hijack Execution Flow',
    'T1548': 'Abuse Elevation Control Mechanism',
    'T1055': 'Process Injection',
    'T1068': 'Exploitation for Privilege Escalation',
    'T1027': 'Obfuscated Files or Information',
    'T1070': 'Indicator Removal on Host',
    'T1003': 'OS Credential Dumping',
    'T1552': 'Unsecured Credentials',
    'T1110': 'Brute Force',
    'T1083': 'File and Directory Discovery',
    'T1057': 'Process Discovery',
    'T1018': 'Remote System Discovery',
    'T1021': 'Remote Services',
    'T1210': 'Exploitation of Remote Services',
    'T1534': 'Internal Spearphishing',
    'T1005': 'Data from Local System',
    'T1039': 'Data from Network Shared Drive',
    'T1113': 'Screen Capture',
    'T1041': 'Exfiltration Over C2 Channel',
    'T1052': 'Exfiltration Over Physical Medium',
    'T1567': 'Exfiltration Over Web Service',
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
          MITRE ATT&CK Chain Simulator
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={startSimulation}
            disabled={isSimulating}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10"
          >
            {isSimulating ? 'Simulating...' : 'Start Attack'}
          </Button>
          <Button
            onClick={stopSimulation}
            disabled={!isSimulating}
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Stop
          </Button>
          <Button
            onClick={resetSimulation}
            variant="outline"
            size="sm"
            className="border-muted-foreground text-muted-foreground hover:bg-muted/10"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Attack chain visualization */}
      <div className="space-y-4">
        {mitreChain.map((phase, index) => (
          <motion.div
            key={phase.id}
            className={`border rounded-lg p-4 transition-all duration-300 ${
              phase.isActive 
                ? 'border-destructive bg-destructive/5 shadow-glow-danger' 
                : phase.progress > 0 
                ? 'border-success bg-success/5'
                : 'border-border bg-card'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  phase.isActive 
                    ? 'bg-destructive animate-cyber-pulse' 
                    : phase.progress > 0 
                    ? 'bg-success' 
                    : 'bg-muted-foreground'
                }`} />
                <div>
                  <h3 className="font-mono text-foreground font-medium">
                    {phase.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-mono text-foreground">
                  {phase.progress.toFixed(0)}%
                </div>
                {index === currentPhaseIndex && isSimulating && (
                  <div className="text-xs text-destructive animate-cyber-pulse">
                    ACTIVE
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <Progress 
                value={phase.progress} 
                className={`h-2 ${
                  phase.isActive ? 'bg-destructive/20' : 'bg-muted'
                }`}
              />
            </div>

            {/* Techniques */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Associated Techniques
              </div>
              <div className="flex flex-wrap gap-2">
                {phase.techniques.map(technique => (
                  <motion.span
                    key={technique}
                    className={`px-2 py-1 rounded text-xs font-mono border ${
                      phase.isActive
                        ? 'border-destructive text-destructive bg-destructive/10'
                        : phase.progress > 0
                        ? 'border-success text-success bg-success/10'
                        : 'border-border text-muted-foreground bg-muted/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    title={techniqueDescriptions[technique] || technique}
                  >
                    {technique}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Attack phase details */}
            {phase.isActive && (
              <motion.div
                className="mt-3 pt-3 border-t border-destructive/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="text-xs text-destructive space-y-1">
                  <div>⚠️ Phase in progress - monitoring defensive systems</div>
                  <div>🔍 Analyzing attack vectors and potential countermeasures</div>
                  <div>📊 Real-time threat assessment active</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Simulation status */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Simulation Status:</span>
            <span className={`font-mono ${
              isSimulating ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {isSimulating ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-mono text-foreground">
              {currentPhaseIndex + (isSimulating ? 1 : 0)}/{mitreChain.length}
            </span>
          </div>
        </div>

        {isSimulating && (
          <motion.div
            className="mt-2 text-xs text-destructive animate-cyber-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🚨 Attack simulation in progress - monitor defensive posture
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};