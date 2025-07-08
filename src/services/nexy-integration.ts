import { 
  NEXYApiResponse, 
  NEXYThreatData, 
  NEXYWebSocketEvents,
  NEXYAuth,
  NEXYConfig,
  NEXYDataExport,
  NEXYAnalytics,
  NEXYHealthCheck,
  NEXYNotification
} from '../types/nexy-integration';
import { Threat } from '../store/threatStore';

/**
 * NEXY Backend Integration Service
 * 
 * This service provides a clean interface for integrating with the NEXY backend.
 * Replace the mock implementations with actual API calls.
 */

export class NEXYIntegrationService {
  private baseUrl: string;
  private wsUrl: string;
  private apiKey: string;
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: { baseUrl: string; wsUrl: string; apiKey: string }) {
    this.baseUrl = config.baseUrl;
    this.wsUrl = config.wsUrl;
    this.apiKey = config.apiKey;
  }

  // Authentication
  async authenticate(credentials: { username: string; password: string }): Promise<NEXYAuth> {
    const response = await this.request<NEXYAuth>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<NEXYAuth> {
    const response = await this.request<NEXYAuth>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    return response.data;
  }

  // Threat Data Management
  async getThreatData(filters?: {
    timeRange?: { start: Date; end: Date };
    severity?: string[];
    types?: string[];
    countries?: string[];
    limit?: number;
    offset?: number;
  }): Promise<NEXYThreatData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }

    const response = await this.request<NEXYThreatData>(`/threats?${params}`);
    return response.data;
  }

  async createThreat(threat: Omit<Threat, 'id'>): Promise<Threat> {
    const response = await this.request<Threat>('/threats', {
      method: 'POST',
      body: JSON.stringify(threat)
    });
    return response.data;
  }

  async updateThreat(id: string, updates: Partial<Threat>): Promise<Threat> {
    const response = await this.request<Threat>(`/threats/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  async deleteThreat(id: string): Promise<void> {
    await this.request(`/threats/${id}`, { method: 'DELETE' });
  }

  // Real-time WebSocket Connection
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.wsUrl}?token=${this.apiKey}`);

        this.ws.onopen = () => {
          console.log('NEXY WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('NEXY WebSocket disconnected');
          // Implement reconnection logic
          setTimeout(() => this.connectWebSocket(), 5000);
        };

        this.ws.onerror = (error) => {
          console.error('NEXY WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event Handling
  on<K extends keyof NEXYWebSocketEvents>(
    event: K, 
    callback: (data: NEXYWebSocketEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off<K extends keyof NEXYWebSocketEvents>(
    event: K, 
    callback: (data: NEXYWebSocketEvents[K]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private handleWebSocketMessage(message: any): void {
    const { type, data } = message;
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Configuration Management
  async getConfig(): Promise<NEXYConfig> {
    const response = await this.request<NEXYConfig>('/config');
    return response.data;
  }

  async updateConfig(config: Partial<NEXYConfig>): Promise<NEXYConfig> {
    const response = await this.request<NEXYConfig>('/config', {
      method: 'PATCH',
      body: JSON.stringify(config)
    });
    return response.data;
  }

  // Data Export
  async exportData(options: {
    format: 'json' | 'csv' | 'xml' | 'pdf';
    filters: Record<string, any>;
    includeMetadata: boolean;
  }): Promise<NEXYDataExport> {
    const response = await this.request<NEXYDataExport>('/export', {
      method: 'POST',
      body: JSON.stringify(options)
    });
    return response.data;
  }

  async getExportStatus(exportId: string): Promise<{ 
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
  }> {
    const response = await this.request(`/export/${exportId}/status`);
    return response.data;
  }

  // Analytics & Reporting
  async getAnalytics(timeRange?: { start: Date; end: Date }): Promise<NEXYAnalytics> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start', timeRange.start.toISOString());
      params.append('end', timeRange.end.toISOString());
    }

    const response = await this.request<NEXYAnalytics>(`/analytics?${params}`);
    return response.data;
  }

  // Health Monitoring
  async getHealthCheck(): Promise<NEXYHealthCheck> {
    const response = await this.request<NEXYHealthCheck>('/health');
    return response.data;
  }

  // Notifications
  async getNotifications(options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NEXYNotification[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.request<NEXYNotification[]>(`/notifications?${params}`);
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  // File Upload/Download
  async uploadFile(file: File, type: 'threat-data' | 'config' | 'report'): Promise<{
    id: string;
    url: string;
    metadata: Record<string, any>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Generic HTTP Request Handler
  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<NEXYApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Client-Version': '1.0.0',
      'X-Request-ID': this.generateRequestId()
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`NEXY API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Batch Operations
  async batchCreateThreats(threats: Omit<Threat, 'id'>[]): Promise<Threat[]> {
    const response = await this.request<Threat[]>('/threats/batch', {
      method: 'POST',
      body: JSON.stringify({ threats })
    });
    return response.data;
  }

  async batchUpdateThreats(updates: Array<{ id: string; data: Partial<Threat> }>): Promise<Threat[]> {
    const response = await this.request<Threat[]>('/threats/batch', {
      method: 'PATCH',
      body: JSON.stringify({ updates })
    });
    return response.data;
  }

  // Search & Filtering
  async searchThreats(query: {
    text?: string;
    filters?: Record<string, any>;
    sort?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
  }): Promise<{
    threats: Threat[];
    total: number;
    facets: Record<string, Array<{ value: string; count: number }>>;
  }> {
    const response = await this.request('/threats/search', {
      method: 'POST',
      body: JSON.stringify(query)
    });
    return response.data;
  }
}

// Factory function for easy integration
export function createNEXYIntegration(config: {
  baseUrl: string;
  wsUrl: string;
  apiKey: string;
}): NEXYIntegrationService {
  return new NEXYIntegrationService(config);
}

// Default configuration for different environments
export const NEXYEnvironments = {
  development: {
    baseUrl: 'http://localhost:3001/api/v1',
    wsUrl: 'ws://localhost:3001/ws'
  },
  staging: {
    baseUrl: 'https://staging-api.nexy.com/api/v1',
    wsUrl: 'wss://staging-api.nexy.com/ws'
  },
  production: {
    baseUrl: 'https://api.nexy.com/api/v1',
    wsUrl: 'wss://api.nexy.com/ws'
  }
};