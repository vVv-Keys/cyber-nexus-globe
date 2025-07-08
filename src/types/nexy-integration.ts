import { Threat, ThreatType, ThreatSeverity } from '../store/threatStore';

/**
 * NEXY Backend Integration Interfaces
 * 
 * These interfaces define the contract between the NEXY backend
 * and the threat intelligence frontend components.
 */

// Core API Response Types
export interface NEXYApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface NEXYError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

// Threat Data Integration
export interface NEXYThreatData {
  threats: Threat[];
  metadata: {
    source: string;
    confidence: number;
    lastUpdated: string;
    feedVersion: string;
  };
  statistics: {
    totalThreats: number;
    activeThreatsByType: Record<ThreatType, number>;
    severityDistribution: Record<ThreatSeverity, number>;
    geographicDistribution: Record<string, number>;
  };
}

// Real-time WebSocket Events
export interface NEXYWebSocketEvents {
  'threat:new': Threat;
  'threat:update': { id: string; updates: Partial<Threat> };
  'threat:resolved': { id: string; resolution: string };
  'system:status': {
    status: 'healthy' | 'degraded' | 'critical';
    services: Record<string, 'up' | 'down' | 'degraded'>;
    metrics: {
      activeConnections: number;
      processingLatency: number;
      memoryUsage: number;
    };
  };
  'alert:critical': {
    id: string;
    message: string;
    severity: 'critical' | 'high';
    source: string;
    timestamp: string;
  };
}

// Authentication & Authorization
export interface NEXYAuth {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
    organization: string;
  };
  session: {
    id: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
  };
}

// Configuration Management
export interface NEXYConfig {
  apiEndpoints: {
    rest: string;
    websocket: string;
    auth: string;
    files: string;
  };
  features: {
    realTimeUpdates: boolean;
    threeDVisualization: boolean;
    advancedAnalytics: boolean;
    exportCapabilities: boolean;
    mlPredictions: boolean;
  };
  security: {
    encryption: boolean;
    rateLimiting: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
    csrf: boolean;
    cors: {
      enabled: boolean;
      origins: string[];
    };
  };
  performance: {
    cacheEnabled: boolean;
    cacheTtl: number;
    maxConcurrentRequests: number;
    requestTimeout: number;
  };
}

// Data Export & Import
export interface NEXYDataExport {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  data: any;
  metadata: {
    exportId: string;
    timestamp: string;
    requestedBy: string;
    filters: Record<string, any>;
    recordCount: number;
  };
  downloadUrl?: string;
  expiresAt: string;
}

// Analytics & Reporting
export interface NEXYAnalytics {
  metrics: {
    threatVolume: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    responseTime: {
      average: number;
      p95: number;
      p99: number;
    };
    userActivity: {
      activeUsers: number;
      sessionsToday: number;
      popularFeatures: Array<{
        feature: string;
        usage: number;
      }>;
    };
  };
  reports: Array<{
    id: string;
    name: string;
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    lastGenerated: string;
    downloadUrl: string;
  }>;
}

// ML/AI Integration
export interface NEXYMachineLearning {
  models: Array<{
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection';
    status: 'training' | 'ready' | 'error';
    accuracy: number;
    lastTrained: string;
  }>;
  predictions: Array<{
    id: string;
    type: string;
    confidence: number;
    prediction: any;
    timestamp: string;
  }>;
  training: {
    inProgress: boolean;
    progress: number;
    estimatedCompletion?: string;
  };
}

// Audit & Compliance
export interface NEXYAudit {
  logs: Array<{
    id: string;
    action: string;
    userId: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    resource: string;
    details: Record<string, any>;
  }>;
  compliance: {
    gdpr: boolean;
    sox: boolean;
    hipaa: boolean;
    pci: boolean;
    customFrameworks: string[];
  };
  retention: {
    policy: string;
    duration: number;
    autoDelete: boolean;
  };
}

// Integration Health Monitoring
export interface NEXYHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    lastCheck: string;
    error?: string;
  }>;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connectionPool: {
      active: number;
      idle: number;
      waiting: number;
    };
  };
  external: {
    threatFeeds: Record<string, 'active' | 'inactive' | 'error'>;
    apis: Record<string, 'responsive' | 'slow' | 'timeout'>;
  };
}

// Notification System
export interface NEXYNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: Record<string, any>;
}

// Workflow & Automation
export interface NEXYWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: Array<{
    type: 'schedule' | 'event' | 'webhook' | 'manual';
    config: Record<string, any>;
  }>;
  actions: Array<{
    type: 'notification' | 'api_call' | 'data_export' | 'analysis';
    config: Record<string, any>;
  }>;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  nextRun?: string;
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageRunTime: number;
  };
}