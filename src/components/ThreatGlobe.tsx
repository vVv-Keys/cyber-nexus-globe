import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useThreatStore } from '../store/threatStore';
import { ThreatArc } from './ThreatArc';
import { motion } from 'framer-motion';

// Globe component with Earth texture and atmosphere
const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const { globeSettings } = useThreatStore();

  useFrame((state) => {
    if (globeRef.current && globeSettings.autoRotate) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  // Create Earth-like material with cyberpunk twist
  const globeMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x0a1128),
      emissive: new THREE.Color(0x002244),
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });

    // Add simple grid pattern for cyberpunk feel
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Dark base
      ctx.fillStyle = '#0a1128';
      ctx.fillRect(0, 0, 512, 512);
      
      // Grid lines
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      // Longitude lines
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
      
      // Latitude lines
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    material.map = texture;
    
    return material;
  }, []);

  return (
    <mesh ref={globeRef} material={globeMaterial}>
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  );
};

// Atmosphere effect
const Atmosphere = () => {
  return (
    <mesh scale={[2.1, 2.1, 2.1]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial
        color={new THREE.Color(0x00ffff)}
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Threat point markers on globe
const ThreatMarker = ({ 
  position, 
  severity, 
  onClick 
}: { 
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  onClick: () => void;
}) => {
  const markerRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.02;
    }
  });

  const color = useMemo(() => {
    switch (severity) {
      case 'low': return '#00ff00';
      case 'medium': return '#ffff00';
      case 'high': return '#ff8800';
      case 'critical': return '#ff0000';
      default: return '#ffffff';
    }
  }, [severity]);

  return (
    <mesh ref={markerRef} position={position} onClick={onClick}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color={color} />
      <Html distanceFactor={8}>
        <div className={`w-2 h-2 rounded-full animate-cyber-pulse shadow-glow-primary`} 
             style={{ backgroundColor: color }} />
      </Html>
    </mesh>
  );
};

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 2): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return [x, y, z];
};

// Loading component
const GlobeLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-primary animate-cyber-pulse">
      <div className="text-lg font-mono">INITIALIZING THREAT GLOBE...</div>
      <div className="mt-2 h-1 bg-muted rounded overflow-hidden">
        <div className="h-full bg-gradient-cyber-primary animate-pulse" />
      </div>
    </div>
  </div>
);

// Main ThreatGlobe component
export const ThreatGlobe: React.FC = () => {
  const { threats, selectThreat, globeSettings } = useThreatStore();
  
  const activeThreats = threats.filter(threat => threat.isActive);

  return (
    <motion.div 
      className="w-full h-full relative bg-background border border-border rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Globe Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <motion.div 
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-mono text-foreground mb-2">GLOBE CONTROLS</h3>
          <div className="space-y-2 text-xs">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={globeSettings.autoRotate}
                onChange={(e) => useThreatStore.getState().updateGlobeSettings({ autoRotate: e.target.checked })}
                className="rounded border-border bg-background"
              />
              <span className="text-muted-foreground">Auto Rotate</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={globeSettings.showArcs}
                onChange={(e) => useThreatStore.getState().updateGlobeSettings({ showArcs: e.target.checked })}
                className="rounded border-border bg-background"
              />
              <span className="text-muted-foreground">Show Attack Arcs</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={globeSettings.showHeatmap}
                onChange={(e) => useThreatStore.getState().updateGlobeSettings({ showHeatmap: e.target.checked })}
                className="rounded border-border bg-background"
              />
              <span className="text-muted-foreground">Heat Map</span>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Stats panel */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div 
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 min-w-[200px]"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-mono text-primary mb-2">THREAT INTELLIGENCE</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Threats:</span>
              <span className="text-destructive font-mono">{activeThreats.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Events:</span>
              <span className="text-foreground font-mono">{threats.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">High Severity:</span>
              <span className="text-warning font-mono">
                {threats.filter(t => t.severity === 'high' || t.severity === 'critical').length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <Suspense fallback={<GlobeLoader />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} color={0x404040} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.5} 
            color={0x00ffff}
          />
          <pointLight 
            position={[-5, -5, -5]} 
            intensity={0.3} 
            color={0xff00ff}
          />

          {/* Globe and atmosphere */}
          <Globe />
          <Atmosphere />

          {/* Threat markers */}
          {activeThreats.map((threat) => {
            const sourcePos = latLngToVector3(threat.source.lat, threat.source.lng);
            const destPos = latLngToVector3(threat.destination.lat, threat.destination.lng);
            
            return (
              <group key={threat.id}>
                <ThreatMarker
                  position={sourcePos}
                  severity={threat.severity}
                  onClick={() => selectThreat(threat)}
                />
                <ThreatMarker
                  position={destPos}
                  severity={threat.severity}
                  onClick={() => selectThreat(threat)}
                />
                {globeSettings.showArcs && (
                  <ThreatArc
                    start={sourcePos}
                    end={destPos}
                    severity={threat.severity}
                  />
                )}
              </group>
            );
          })}

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.8}
            rotateSpeed={0.4}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </Suspense>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <motion.div 
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-mono text-foreground mb-2">THREAT LEVELS</h3>
          <div className="space-y-1">
            {[
              { level: 'Low', color: '#00ff00' },
              { level: 'Medium', color: '#ffff00' },
              { level: 'High', color: '#ff8800' },
              { level: 'Critical', color: '#ff0000' },
            ].map(({ level, color }) => (
              <div key={level} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full animate-cyber-pulse"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{level}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};