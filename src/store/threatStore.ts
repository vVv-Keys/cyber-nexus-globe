import { create } from 'zustand';

// Types for threat intelligence data
export interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  ip: string;
}

export interface ThreatEvent {
  id: string;
  source: ThreatLocation;
  destination: ThreatLocation;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threatType: 'malware' | 'ddos' | 'phishing' | 'ransomware' | 'intrusion' | 'dataexfil';
  timestamp: Date;
  description: string;
  mitreId?: string;
  isActive: boolean;
}

export interface AttackMetrics {
  totalThreats: number;
  activeThreatsByCountry: Record<string, number>;
  threatTypesDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
  threatsOverTime: Array<{ timestamp: Date; count: number }>;
}

export interface MITREAttackPhase {
  id: string;
  name: string;
  techniques: string[];
  description: string;
  isActive: boolean;
  progress: number;
}

interface ThreatStore {
  // State
  threats: ThreatEvent[];
  selectedThreat: ThreatEvent | null;
  isSimulationRunning: boolean;
  currentTime: Date;
  timeRange: { start: Date; end: Date };
  attackMetrics: AttackMetrics;
  mitreChain: MITREAttackPhase[];
  globeSettings: {
    autoRotate: boolean;
    showArcs: boolean;
    showHeatmap: boolean;
    animationSpeed: number;
  };

  // Actions
  addThreat: (threat: ThreatEvent) => void;
  removeThreat: (threatId: string) => void;
  updateThreat: (threatId: string, updates: Partial<ThreatEvent>) => void;
  setThreats: (threats: ThreatEvent[]) => void;
  selectThreat: (threat: ThreatEvent | null) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setCurrentTime: (time: Date) => void;
  setTimeRange: (range: { start: Date; end: Date }) => void;
  updateGlobeSettings: (settings: Partial<typeof this['globeSettings']>) => void;
  updateMITREPhase: (phaseId: string, updates: Partial<MITREAttackPhase>) => void;
  generateMockThreats: () => void;
  calculateMetrics: () => void;
}

// Mock data generators
const generateMockLocation = (): ThreatLocation => {
  const locations = [
    { country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
    { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6176 },
    { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
    { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  ];
  
  const location = locations[Math.floor(Math.random() * locations.length)];
  return {
    id: Math.random().toString(36),
    ...location,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  };
};

const initialMITREChain: MITREAttackPhase[] = [
  {
    id: 'reconnaissance',
    name: 'Reconnaissance',
    techniques: ['T1595', 'T1592', 'T1589'],
    description: 'Gathering information about target',
    isActive: false,
    progress: 0,
  },
  {
    id: 'initial-access',
    name: 'Initial Access',
    techniques: ['T1566', 'T1190', 'T1133'],
    description: 'Gaining initial foothold',
    isActive: false,
    progress: 0,
  },
  {
    id: 'execution',
    name: 'Execution',
    techniques: ['T1059', 'T1204', 'T1053'],
    description: 'Running malicious code',
    isActive: false,
    progress: 0,
  },
  {
    id: 'persistence',
    name: 'Persistence',
    techniques: ['T1547', 'T1543', 'T1574'],
    description: 'Maintaining foothold',
    isActive: false,
    progress: 0,
  },
  {
    id: 'privilege-escalation',
    name: 'Privilege Escalation',
    techniques: ['T1548', 'T1055', 'T1068'],
    description: 'Gaining higher privileges',
    isActive: false,
    progress: 0,
  },
  {
    id: 'defense-evasion',
    name: 'Defense Evasion',
    techniques: ['T1027', 'T1055', 'T1070'],
    description: 'Avoiding detection',
    isActive: false,
    progress: 0,
  },
  {
    id: 'credential-access',
    name: 'Credential Access',
    techniques: ['T1003', 'T1552', 'T1110'],
    description: 'Stealing credentials',
    isActive: false,
    progress: 0,
  },
  {
    id: 'discovery',
    name: 'Discovery',
    techniques: ['T1083', 'T1057', 'T1018'],
    description: 'Exploring environment',
    isActive: false,
    progress: 0,
  },
  {
    id: 'lateral-movement',
    name: 'Lateral Movement',
    techniques: ['T1021', 'T1210', 'T1534'],
    description: 'Moving through network',
    isActive: false,
    progress: 0,
  },
  {
    id: 'collection',
    name: 'Collection',
    techniques: ['T1005', 'T1039', 'T1113'],
    description: 'Gathering data',
    isActive: false,
    progress: 0,
  },
  {
    id: 'exfiltration',
    name: 'Exfiltration',
    techniques: ['T1041', 'T1052', 'T1567'],
    description: 'Stealing data',
    isActive: false,
    progress: 0,
  },
];

export const useThreatStore = create<ThreatStore>((set, get) => ({
  // Initial state
  threats: [],
  selectedThreat: null,
  isSimulationRunning: false,
  currentTime: new Date(),
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date(),
  },
  attackMetrics: {
    totalThreats: 0,
    activeThreatsByCountry: {},
    threatTypesDistribution: {},
    severityDistribution: {},
    threatsOverTime: [],
  },
  mitreChain: initialMITREChain,
  globeSettings: {
    autoRotate: true,
    showArcs: true,
    showHeatmap: true,
    animationSpeed: 1,
  },

  // Actions
  addThreat: (threat) => {
    set((state) => ({
      threats: [...state.threats, threat],
    }));
    get().calculateMetrics();
  },

  removeThreat: (threatId) => {
    set((state) => ({
      threats: state.threats.filter((t) => t.id !== threatId),
      selectedThreat: state.selectedThreat?.id === threatId ? null : state.selectedThreat,
    }));
    get().calculateMetrics();
  },

  updateThreat: (threatId, updates) => {
    set((state) => ({
      threats: state.threats.map((t) => 
        t.id === threatId ? { ...t, ...updates } : t
      ),
    }));
    get().calculateMetrics();
  },

  setThreats: (threats) => {
    set({ threats });
    get().calculateMetrics();
  },

  selectThreat: (threat) => {
    set({ selectedThreat: threat });
  },

  startSimulation: () => {
    set({ isSimulationRunning: true });
    
    // Generate initial threats
    get().generateMockThreats();
    
    // Set up interval for continuous threat generation
    // In a real app, this would be replaced with WebSocket connection
    const interval = setInterval(() => {
      const state = get();
      if (!state.isSimulationRunning) {
        clearInterval(interval);
        return;
      }
      
      // Generate new threat every 2-5 seconds
      if (Math.random() < 0.7) {
        const threat: ThreatEvent = {
          id: Math.random().toString(36),
          source: generateMockLocation(),
          destination: generateMockLocation(),
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          threatType: ['malware', 'ddos', 'phishing', 'ransomware', 'intrusion', 'dataexfil'][Math.floor(Math.random() * 6)] as any,
          timestamp: new Date(),
          description: `Threat detected from ${generateMockLocation().country}`,
          isActive: true,
        };
        
        state.addThreat(threat);
        
        // Automatically deactivate threat after 30 seconds
        setTimeout(() => {
          set((currentState) => ({
            threats: currentState.threats.map((t) =>
              t.id === threat.id ? { ...t, isActive: false } : t
            ),
          }));
        }, 30000);
      }
    }, Math.random() * 3000 + 2000);
  },

  stopSimulation: () => {
    set({ isSimulationRunning: false });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setTimeRange: (range) => {
    set({ timeRange: range });
  },

  updateGlobeSettings: (settings) => {
    set((state) => ({
      globeSettings: { ...state.globeSettings, ...settings },
    }));
  },

  updateMITREPhase: (phaseId, updates) => {
    set((state) => ({
      mitreChain: state.mitreChain.map((phase) =>
        phase.id === phaseId ? { ...phase, ...updates } : phase
      ),
    }));
  },

  generateMockThreats: () => {
    const mockThreats: ThreatEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: `threat-${i}`,
      source: generateMockLocation(),
      destination: generateMockLocation(),
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      threatType: ['malware', 'ddos', 'phishing', 'ransomware', 'intrusion', 'dataexfil'][Math.floor(Math.random() * 6)] as any,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      description: `Mock threat #${i + 1}`,
      isActive: Math.random() > 0.3,
    }));

    set({ threats: mockThreats });
    get().calculateMetrics();
  },

  calculateMetrics: () => {
    const { threats } = get();
    
    const metrics: AttackMetrics = {
      totalThreats: threats.length,
      activeThreatsByCountry: {},
      threatTypesDistribution: {},
      severityDistribution: {},
      threatsOverTime: [],
    };

    threats.forEach((threat) => {
      // Count by country
      const country = threat.destination.country;
      metrics.activeThreatsByCountry[country] = (metrics.activeThreatsByCountry[country] || 0) + 1;

      // Count by type
      metrics.threatTypesDistribution[threat.threatType] = (metrics.threatTypesDistribution[threat.threatType] || 0) + 1;

      // Count by severity
      metrics.severityDistribution[threat.severity] = (metrics.severityDistribution[threat.severity] || 0) + 1;
    });

    set({ attackMetrics: metrics });
  },
}));

// Export store types for component usage
export type { ThreatStore };

// Export types for NEXY integration
export type Threat = ThreatEvent;
export type ThreatType = ThreatEvent['threatType'];
export type ThreatSeverity = ThreatEvent['severity'];