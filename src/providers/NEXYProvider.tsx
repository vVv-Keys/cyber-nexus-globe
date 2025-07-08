import React, { createContext, useContext, useEffect, useState } from 'react';
import { NEXYIntegrationService, createNEXYIntegration, NEXYEnvironments } from '../services/nexy-integration';
import { NEXYAuth, NEXYConfig, NEXYHealthCheck } from '../types/nexy-integration';
import { useThreatStore } from '../store/threatStore';

interface NEXYContextType {
  service: NEXYIntegrationService | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  auth: NEXYAuth | null;
  config: NEXYConfig | null;
  health: NEXYHealthCheck | null;
  connect: (apiKey: string, environment?: keyof typeof NEXYEnvironments) => Promise<void>;
  disconnect: () => void;
  authenticate: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const NEXYContext = createContext<NEXYContextType | undefined>(undefined);

interface NEXYProviderProps {
  children: React.ReactNode;
  defaultEnvironment?: keyof typeof NEXYEnvironments;
  defaultApiKey?: string;
  autoConnect?: boolean;
}

export const NEXYProvider: React.FC<NEXYProviderProps> = ({
  children,
  defaultEnvironment = 'development',
  defaultApiKey,
  autoConnect = false
}) => {
  const [service, setService] = useState<NEXYIntegrationService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<NEXYAuth | null>(null);
  const [config, setConfig] = useState<NEXYConfig | null>(null);
  const [health, setHealth] = useState<NEXYHealthCheck | null>(null);
  
  const { addThreat, updateThreat, removeThreat, setThreats } = useThreatStore();

  // Initialize connection
  const connect = async (apiKey: string, environment: keyof typeof NEXYEnvironments = defaultEnvironment) => {
    try {
      const envConfig = NEXYEnvironments[environment];
      const integrationService = createNEXYIntegration({
        ...envConfig,
        apiKey
      });

      // Test connection
      const healthCheck = await integrationService.getHealthCheck();
      setHealth(healthCheck);

      if (healthCheck.status === 'unhealthy') {
        throw new Error('NEXY backend is unhealthy');
      }

      // Setup WebSocket connection
      await integrationService.connectWebSocket();

      // Setup event listeners
      integrationService.on('threat:new', (threat) => {
        addThreat(threat);
      });

      integrationService.on('threat:update', ({ id, updates }) => {
        updateThreat(id, updates);
      });

      integrationService.on('threat:resolved', ({ id }) => {
        removeThreat(id);
      });

      integrationService.on('system:status', (status) => {
        setHealth(prev => prev ? { 
          ...prev, 
          status: status.status === 'critical' ? 'unhealthy' : status.status,
          services: status.services,
          database: prev.database,
          external: prev.external
        } : null);
      });

      integrationService.on('alert:critical', (alert) => {
        // Handle critical alerts
        console.warn('Critical alert received:', alert);
      });

      setService(integrationService);
      setIsConnected(true);

      // Load initial configuration
      try {
        const configData = await integrationService.getConfig();
        setConfig(configData);
      } catch (error) {
        console.warn('Failed to load NEXY config:', error);
      }

      console.log('Successfully connected to NEXY backend');
    } catch (error) {
      console.error('Failed to connect to NEXY backend:', error);
      throw error;
    }
  };

  const disconnect = () => {
    if (service) {
      service.disconnectWebSocket();
      setService(null);
    }
    setIsConnected(false);
    setIsAuthenticated(false);
    setAuth(null);
    setConfig(null);
    setHealth(null);
  };

  const authenticate = async (credentials: { username: string; password: string }) => {
    if (!service) {
      throw new Error('Not connected to NEXY backend');
    }

    try {
      const authData = await service.authenticate(credentials);
      setAuth(authData);
      setIsAuthenticated(true);
      
      // Store auth token for subsequent requests
      localStorage.setItem('nexy_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAuth(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nexy_auth');
  };

  const refreshData = async () => {
    if (!service) return;

    try {
      // Refresh threat data
      const threatData = await service.getThreatData();
      setThreats(threatData.threats);

      // Refresh health status
      const healthData = await service.getHealthCheck();
      setHealth(healthData);

      // Refresh config if authenticated
      if (isAuthenticated) {
        const configData = await service.getConfig();
        setConfig(configData);
      }
    } catch (error) {
      console.error('Failed to refresh NEXY data:', error);
    }
  };

  // Auto-connect on mount if configured
  useEffect(() => {
    if (autoConnect && defaultApiKey) {
      connect(defaultApiKey, defaultEnvironment).catch(console.error);
    }

    // Check for stored auth
    const storedAuth = localStorage.getItem('nexy_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        const expiresAt = new Date(authData.expiresAt);
        if (expiresAt > new Date()) {
          setAuth(authData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('nexy_auth');
        }
      } catch (error) {
        localStorage.removeItem('nexy_auth');
      }
    }
  }, [autoConnect, defaultApiKey, defaultEnvironment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (service) {
        service.disconnectWebSocket();
      }
    };
  }, [service]);

  const value: NEXYContextType = {
    service,
    isConnected,
    isAuthenticated,
    auth,
    config,
    health,
    connect,
    disconnect,
    authenticate,
    logout,
    refreshData
  };

  return (
    <NEXYContext.Provider value={value}>
      {children}
    </NEXYContext.Provider>
  );
};

export const useNEXY = (): NEXYContextType => {
  const context = useContext(NEXYContext);
  if (context === undefined) {
    throw new Error('useNEXY must be used within a NEXYProvider');
  }
  return context;
};

// Convenience hooks for specific functionality
export const useNEXYAuth = () => {
  const { auth, isAuthenticated, authenticate, logout } = useNEXY();
  return { auth, isAuthenticated, authenticate, logout };
};

export const useNEXYConfig = () => {
  const { config, service } = useNEXY();
  
  const updateConfig = async (updates: Partial<NEXYConfig>) => {
    if (!service) throw new Error('Not connected to NEXY');
    return service.updateConfig(updates);
  };

  return { config, updateConfig };
};

export const useNEXYHealth = () => {
  const { health, refreshData } = useNEXY();
  return { health, refreshHealth: refreshData };
};

export const useNEXYRealtime = () => {
  const { service, isConnected } = useNEXY();
  
  const subscribe = <K extends keyof import('../types/nexy-integration').NEXYWebSocketEvents>(
    event: K,
    callback: (data: import('../types/nexy-integration').NEXYWebSocketEvents[K]) => void
  ) => {
    if (!service) return;
    service.on(event, callback);
    
    return () => {
      service.off(event, callback);
    };
  };

  return { subscribe, isConnected };
};