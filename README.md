# Cyber Nexus Globe - Real-Time Threat Intelligence Platform

A sophisticated, production-ready cyber threat intelligence visualization platform built with React, React-Three-Fiber, Three.js, Zustand, and Tailwind CSS. Features real-time 3D globe visualization, attack heat maps, and MITRE ATT&CK chain simulation.

![Cyber Nexus Globe](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80)

## 🌐 Live Demo

**URL**: https://cyber-nexus-globe.loveable.app/

## 🚀 Features

### Core Capabilities
- **3D Interactive Globe**: Real-time threat visualization with orbital controls
- **Threat Arcs**: Animated attack paths between source and destination locations
- **Heat Map Visualization**: Country-based attack intensity mapping
- **MITRE ATT&CK Chain Simulator**: Interactive attack progression simulation
- **Real-Time Simulation**: Mock threat data with live updates
- **Interactive Tooltips**: Detailed threat information on hover
- **Cyberpunk UI**: Dark-themed, neon-accented interface

### Technical Features
- **React Three Fiber**: Hardware-accelerated 3D rendering
- **Zustand State Management**: Lightweight, scalable state handling
- **Framer Motion**: Smooth animations and transitions
- **TypeScript**: Full type safety and developer experience
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Efficient rendering and state updates

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: React-Three-Fiber + Three.js + Drei
- **State Management**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Deployment**: Vercel/Railway ready

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with WebGL support

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd cyber-nexus-globe

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Quick Start with Lovable

1. Visit the [Lovable Project](https://lovable.dev/projects/2646ddb4-94f1-4351-8019-c6e050b6b9e6)
2. Start editing with natural language prompts
3. Changes are automatically committed and deployed

## 🔧 Configuration & Integration

### Real-Time Data Integration

The application currently uses mock data for demonstration. To integrate with real threat intelligence feeds:

#### 1. Replace Mock Data Sources

In `src/store/threatStore.ts`, update the `startSimulation()` function:

```typescript
// Replace this mock implementation:
const interval = setInterval(() => {
  // Mock threat generation
}, 2000);

// With real WebSocket connection:
const ws = new WebSocket('wss://your-threat-api.com/feed');
ws.onmessage = (event) => {
  const threatData = JSON.parse(event.data);
  addThreat(threatData);
};
```

#### 2. API Integration Points

Update these functions in `threatStore.ts`:
- `generateMockThreats()` → Connect to REST API
- `startSimulation()` → WebSocket for real-time feeds
- `calculateMetrics()` → Analytics endpoints

#### 3. Authentication Setup

Add authentication headers to API calls:

```typescript
const headers = {
  'Authorization': `Bearer ${process.env.THREAT_API_TOKEN}`,
  'Content-Type': 'application/json'
};
```

### Backend Requirements

For production deployment, implement:

1. **Threat Intelligence API**
   - REST endpoints for historical data
   - WebSocket for real-time feeds
   - MITRE ATT&CK framework data

2. **Authentication & Authorization**
   - JWT token management
   - Role-based access control
   - API rate limiting

3. **Data Processing**
   - Geolocation services for IP addresses
   - Threat classification algorithms
   - Real-time aggregation and filtering

## 📊 Data Models

### Threat Event Structure
```typescript
interface ThreatEvent {
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
```

### Location Data Structure
```typescript
interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  ip: string;
}
```

## 🎨 Customization

### Theme Customization

Modify cyberpunk colors in `src/index.css`:

```css
:root {
  --primary: 191 100% 50%;        /* Electric Blue */
  --secondary: 120 100% 40%;      /* Matrix Green */
  --accent: 270 100% 60%;         /* Electric Purple */
  --destructive: 0 100% 60%;      /* Neon Red */
}
```

### Globe Appearance

Update globe materials in `src/components/ThreatGlobe.tsx`:

```typescript
const globeMaterial = new THREE.MeshPhongMaterial({
  color: new THREE.Color(0x0a1128),
  emissive: new THREE.Color(0x002244),
  // Customize appearance
});
```

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
vercel --prod
```

### Railway Deployment
```bash
railway login
railway init
railway up
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔐 Security Considerations

- **API Security**: Use HTTPS and proper authentication
- **Rate Limiting**: Implement request throttling
- **Input Validation**: Sanitize all threat data inputs
- **CSP Headers**: Configure Content Security Policy
- **Error Handling**: Don't expose sensitive information

## 📈 Performance Optimization

- **3D Rendering**: Uses instanced meshes for performance
- **State Management**: Selective re-rendering with Zustand
- **Code Splitting**: Lazy loading of 3D components
- **Memory Management**: Proper cleanup of Three.js objects
- **Responsive Breakpoints**: Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Lovable Docs](https://docs.lovable.dev)
- **Issues**: Create an issue in this repository
- **Discord**: Join our community for real-time help

## 🙏 Acknowledgments

- MITRE ATT&CK Framework for cybersecurity intelligence
- Three.js community for 3D web graphics
- React Three Fiber team for React integration
- shadcn/ui for beautiful UI components

---

Built with ❤️ using [Lovable](https://lovable.dev)

- Vision enhanced by @Keys
