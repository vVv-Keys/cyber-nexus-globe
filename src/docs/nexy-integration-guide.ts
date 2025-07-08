/**
 * NEXY Threat Intelligence Platform Integration Package
 * 
 * This package provides a complete threat intelligence visualization platform
 * ready for integration into the NEXY ecosystem.
 */

// ============================================================================
// QUICK START GUIDE
// ============================================================================

/**
 * 1. BASIC INTEGRATION:
 * 
 * import { ThreatIntelligence, NEXYProvider } from '@/threat-intelligence';
 * 
 * function App() {
 *   return (
 *     <NEXYProvider 
 *       defaultEnvironment="production"
 *       defaultApiKey="your-api-key"
 *       autoConnect={true}
 *     >
 *       <ThreatIntelligence.Dashboard />
 *     </NEXYProvider>
 *   );
 * }
 */

/**
 * 2. COMPONENT-LEVEL INTEGRATION:
 * 
 * import { ThreatGlobe, useThreatStore } from '@/threat-intelligence';
 * 
 * function MyComponent() {
 *   const { threats, isSimulationRunning } = useThreatStore();
 *   
 *   return (
 *     <div className="h-96">
 *       <ThreatGlobe />
 *     </div>
 *   );
 * }
 */

/**
 * 3. CUSTOM INTEGRATION WITH NEXY SERVICE:
 * 
 * import { useNEXY, createNEXYIntegration } from '@/threat-intelligence';
 * 
 * function CustomDashboard() {
 *   const { service, isConnected } = useNEXY();
 *   
 *   const handleExport = async () => {
 *     if (service) {
 *       const exportData = await service.exportData({
 *         format: 'json',
 *         filters: { severity: ['critical', 'high'] },
 *         includeMetadata: true
 *       });
 *     }
 *   };
 *   
 *   return <div>Custom implementation</div>;
 * }
 */

// ============================================================================
// NEXY BACKEND INTEGRATION CHECKLIST
// ============================================================================

/**
 * REQUIRED BACKEND ENDPOINTS:
 * 
 * Authentication:
 * - POST /auth/login
 * - POST /auth/refresh
 * - POST /auth/logout
 * 
 * Threat Management:
 * - GET /threats (with filtering, pagination)
 * - POST /threats
 * - PATCH /threats/:id
 * - DELETE /threats/:id
 * - POST /threats/batch
 * - POST /threats/search
 * 
 * Configuration:
 * - GET /config
 * - PATCH /config
 * 
 * Analytics:
 * - GET /analytics
 * - GET /health
 * 
 * Data Export:
 * - POST /export
 * - GET /export/:id/status
 * 
 * Files:
 * - POST /files/upload
 * - GET /files/:id/download
 * 
 * Notifications:
 * - GET /notifications
 * - POST /notifications/:id/read
 * 
 * WebSocket Events:
 * - threat:new
 * - threat:update
 * - threat:resolved
 * - system:status
 * - alert:critical
 */

// ============================================================================
// DEPLOYMENT CONFIGURATION
// ============================================================================

/**
 * ENVIRONMENT VARIABLES:
 * 
 * # API Configuration
 * VITE_NEXY_API_URL=https://api.nexy.com/v1
 * VITE_NEXY_WS_URL=wss://api.nexy.com/ws
 * VITE_NEXY_API_KEY=your-api-key
 * 
 * # Feature Flags
 * VITE_ENABLE_3D_VISUALIZATION=true
 * VITE_ENABLE_REAL_TIME=true
 * VITE_ENABLE_ANALYTICS=true
 * VITE_ENABLE_EXPORT=true
 * 
 * # Performance
 * VITE_MAX_CONCURRENT_REQUESTS=10
 * VITE_CACHE_TTL=300000
 * VITE_WS_RECONNECT_INTERVAL=5000
 * 
 * # Security
 * VITE_ENABLE_CSP=true
 * VITE_RATE_LIMIT_MAX=100
 * VITE_RATE_LIMIT_WINDOW=60000
 */

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Full Dashboard Integration
 */
export const NEXYThreatDashboardIntegration = `
import React from 'react';
import { NEXYProvider, ThreatIntelligence } from '@/threat-intelligence';

export function NEXYThreatIntelligencePlatform() {
  return (
    <NEXYProvider
      defaultEnvironment="production"
      defaultApiKey={process.env.VITE_NEXY_API_KEY}
      autoConnect={true}
    >
      <div className="min-h-screen bg-background">
        <ThreatIntelligence.Navigation />
        <main className="container mx-auto px-6 py-6">
          <ThreatIntelligence.Dashboard />
        </main>
        <ThreatIntelligence.SystemHealth />
      </div>
    </NEXYProvider>
  );
}
`;

/**
 * EXAMPLE 2: Custom Component Integration
 */
export const NEXYCustomVisualizationIntegration = `
import React, { useEffect } from 'react';
import { 
  NEXYProvider, 
  useNEXY, 
  useThreatStore,
  ThreatIntelligence 
} from '@/threat-intelligence';

function CustomThreatAnalysis() {
  const { service, isConnected } = useNEXY();
  const { threats, setThreats } = useThreatStore();
  
  useEffect(() => {
    if (service && isConnected) {
      // Load custom filtered data
      service.getThreatData({
        severity: ['critical', 'high'],
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }).then(data => {
        setThreats(data.threats);
      });
    }
  }, [service, isConnected]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <ThreatIntelligence.Globe.Enhanced />
      <ThreatIntelligence.Visualizers.Correlation />
    </div>
  );
}

export function CustomNEXYIntegration() {
  return (
    <NEXYProvider defaultEnvironment="production">
      <CustomThreatAnalysis />
    </NEXYProvider>
  );
}
`;

/**
 * EXAMPLE 3: Real-time Event Handling
 */
export const NEXYRealtimeIntegration = `
import React, { useEffect } from 'react';
import { useNEXYRealtime, useToast } from '@/threat-intelligence';

function RealtimeAlertHandler() {
  const { subscribe } = useNEXYRealtime();
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribeCritical = subscribe('alert:critical', (alert) => {
      toast({
        title: "Critical Alert",
        description: alert.message,
        variant: "destructive",
      });
    });
    
    const unsubscribeStatus = subscribe('system:status', (status) => {
      if (status.status === 'critical') {
        toast({
          title: "System Alert",
          description: "NEXY system status is critical",
          variant: "destructive",
        });
      }
    });
    
    return () => {
      unsubscribeCritical?.();
      unsubscribeStatus?.();
    };
  }, [subscribe, toast]);
  
  return null; // This is just an event handler
}
`;

// ============================================================================
// PRODUCTION DEPLOYMENT GUIDE
// ============================================================================

/**
 * DOCKER CONFIGURATION:
 * 
 * FROM node:18-alpine
 * WORKDIR /app
 * COPY package*.json ./
 * RUN npm ci --only=production
 * COPY . .
 * RUN npm run build
 * EXPOSE 3000
 * CMD ["npm", "run", "preview"]
 */

/**
 * NGINX CONFIGURATION:
 * 
 * server {
 *   listen 80;
 *   server_name your-domain.com;
 *   
 *   location / {
 *     root /usr/share/nginx/html;
 *     try_files $uri $uri/ /index.html;
 *   }
 *   
 *   location /api {
 *     proxy_pass http://nexy-backend:3001;
 *     proxy_set_header Host $host;
 *     proxy_set_header X-Real-IP $remote_addr;
 *   }
 *   
 *   location /ws {
 *     proxy_pass http://nexy-backend:3001;
 *     proxy_http_version 1.1;
 *     proxy_set_header Upgrade $http_upgrade;
 *     proxy_set_header Connection "upgrade";
 *   }
 * }
 */

// ============================================================================
// MONITORING & OBSERVABILITY
// ============================================================================

/**
 * METRICS TO MONITOR:
 * - API response times
 * - WebSocket connection health
 * - Frontend performance metrics
 * - User interaction analytics
 * - Error rates and types
 * - Memory usage and cache efficiency
 * - Security event notifications
 */

/**
 * HEALTH CHECK ENDPOINTS:
 * - /health/live - Basic liveness check
 * - /health/ready - Readiness check with dependencies
 * - /health/metrics - Performance metrics
 * - /health/security - Security status
 */

// ============================================================================
// SECURITY CONSIDERATIONS
// ============================================================================

/**
 * SECURITY CHECKLIST:
 * ✓ API key rotation and management
 * ✓ CSP headers configuration
 * ✓ Input sanitization and validation
 * ✓ Rate limiting implementation
 * ✓ WebSocket authentication
 * ✓ CORS configuration
 * ✓ Audit logging
 * ✓ Data encryption in transit
 * ✓ Session management
 * ✓ Error message sanitization
 */

export const NEXYIntegrationGuide = {
  examples: {
    fullDashboard: NEXYThreatDashboardIntegration,
    customVisualization: NEXYCustomVisualizationIntegration,
    realtimeEvents: NEXYRealtimeIntegration
  },
  
  checklist: {
    backend: [
      'Implement authentication endpoints',
      'Create threat management APIs',
      'Setup WebSocket server',
      'Configure CORS for frontend domain',
      'Implement rate limiting',
      'Add health check endpoints',
      'Setup audit logging',
      'Configure data export functionality'
    ],
    
    frontend: [
      'Configure environment variables',
      'Setup NEXY provider in app root',
      'Implement error boundaries',
      'Configure routing for threat views',
      'Setup monitoring and analytics',
      'Implement user authentication flow',
      'Add export functionality',
      'Configure WebSocket reconnection'
    ],
    
    deployment: [
      'Configure Docker containers',
      'Setup reverse proxy (Nginx)',
      'Configure SSL certificates',
      'Setup monitoring dashboards',
      'Configure backup procedures',
      'Implement CI/CD pipelines',
      'Setup log aggregation',
      'Configure alerting systems'
    ]
  }
};

export default NEXYIntegrationGuide;