import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Instances, Instance, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useThreatStore } from '../store/threatStore';
import { ThreatArc } from './ThreatArc';
import { motion } from 'framer-motion';

// WebGL Context Recovery Handler
const useWebGLErrorRecovery = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    const handleContextLost = (event: any) => {
      event.preventDefault();
      console.warn('WebGL context lost. Attempting recovery...');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored successfully.');
    };

    if (gl.domElement) {
      gl.domElement.addEventListener('webglcontextlost', handleContextLost);
      gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (gl.domElement) {
        gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
        gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [gl]);
};

// Enhanced Globe with better performance and visuals
const EnhancedGlobe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { globeSettings } = useThreatStore();
  
  // Performance optimization: Memoized materials
  const { globeMaterial, atmosphereMaterial } = useMemo(() => {
    // Create high-quality earth texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient for realistic earth look
      const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
      gradient.addColorStop(0, '#0a1a2e');
      gradient.addColorStop(0.3, '#16213e');
      gradient.addColorStop(0.7, '#0f172a');
      gradient.addColorStop(1, '#020617');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 512);
      
      // Add continental outlines
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      
      // Simplified continental outlines
      const continents = [
        { x: 150, y: 180, w: 200, h: 120 }, // North America
        { x: 400, y: 200, w: 150, h: 100 }, // Europe
        { x: 550, y: 220, w: 180, h: 140 }, // Asia
        { x: 500, y: 320, w: 120, h: 80 },  // Africa
        { x: 800, y: 350, w: 100, h: 60 },  // Australia
      ];
      
      continents.forEach(({ x, y, w, h }) => {
        ctx.strokeRect(x, y, w, h);
        // Add some internal details
        ctx.beginPath();
        ctx.moveTo(x + w/3, y);
        ctx.lineTo(x + w/3, y + h);
        ctx.moveTo(x + 2*w/3, y);
        ctx.lineTo(x + 2*w/3, y + h);
        ctx.stroke();
      });
      
      // Add cyber grid overlay
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.2;
      
      // Longitude lines
      for (let i = 0; i <= 1024; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
      
      // Latitude lines
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      color: new THREE.Color(0x1a2332),
      emissive: new THREE.Color(0x001122),
      shininess: 30,
      transparent: true,
      opacity: 0.95,
    });

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    return { globeMaterial, atmosphereMaterial };
  }, []);

  useFrame((state) => {
    if (globeRef.current && globeSettings.autoRotate) {
      globeRef.current.rotation.y += 0.001;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      <mesh ref={globeRef} material={globeMaterial}>
        <sphereGeometry args={[2, 128, 64]} />
      </mesh>
      <mesh ref={atmosphereRef} scale={[2.05, 2.05, 2.05]} material={atmosphereMaterial}>
        <sphereGeometry args={[2, 64, 32]} />
      </mesh>
    </group>
  );
};

// Advanced Threat Visualization with clustering
const ThreatCluster = ({ threats, position }: { threats: any[], position: [number, number, number] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const severity = threats.reduce((max, t) => Math.max(max, 
    t.severity === 'critical' ? 4 : t.severity === 'high' ? 3 : t.severity === 'medium' ? 2 : 1
  ), 0);
  
  const color = useMemo(() => {
    switch (severity) {
      case 4: return '#ff0040';
      case 3: return '#ff8800';
      case 2: return '#ffff00';
      default: return '#00ff00';
    }
  }, [severity]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05 * Math.sqrt(threats.length), 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
      <Html distanceFactor={10}>
        <div className="bg-card/90 border border-border rounded px-2 py-1 text-xs">
          {threats.length} threats
        </div>
      </Html>
    </mesh>
  );
};

// Performance monitoring component
const PerformanceMonitor = () => {
  const { gl } = useThree();
  const [stats, setStats] = React.useState({ fps: 0, memory: 0, drawCalls: 0 });

  useFrame(() => {
    const info = gl.info;
    setStats({
      fps: Math.round(1 / (performance.now() - (window as any).lastTime || 0) * 1000) || 60,
      memory: (performance as any).memory?.usedJSHeapSize ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
      drawCalls: info.render.calls
    });
    (window as any).lastTime = performance.now();
  });

  return (
    <Html position={[-3, 2.5, 0]}>
      <div className="bg-card/80 border border-border rounded p-2 text-xs font-mono">
        <div>FPS: {stats.fps}</div>
        <div>Memory: {stats.memory}MB</div>
        <div>Draw Calls: {stats.drawCalls}</div>
      </div>
    </Html>
  );
};

// Cyber particle system for enhanced atmosphere
const CyberParticles = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 200;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      ]);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const matrix = new THREE.Matrix4();
        const [x, y, z] = positions[i];
        matrix.setPosition(x, y, z);
        meshRef.current.setMatrixAt(i, matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.01, 4, 4]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
    </instancedMesh>
  );
};

// Main enhanced globe component
export const EnhancedThreatGlobe: React.FC = () => {
  const { threats, selectThreat, globeSettings } = useThreatStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const activeThreats = threats.filter(threat => threat.isActive);

  // Cluster nearby threats for better performance
  const clusteredThreats = useMemo(() => {
    const clusters = new Map();
    const CLUSTER_DISTANCE = 0.5;
    
    activeThreats.forEach(threat => {
      const destPos = latLngToVector3(threat.destination.lat, threat.destination.lng);
      const key = `${Math.round(destPos[0] / CLUSTER_DISTANCE)}-${Math.round(destPos[1] / CLUSTER_DISTANCE)}-${Math.round(destPos[2] / CLUSTER_DISTANCE)}`;
      
      if (!clusters.has(key)) {
        clusters.set(key, { threats: [], position: destPos });
      }
      clusters.get(key).threats.push(threat);
    });
    
    return Array.from(clusters.values());
  }, [activeThreats]);

  // WebGL error recovery
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, attempting recovery...');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, []);

  return (
    <motion.div 
      className="w-full h-full relative bg-background border border-border rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <motion.div 
          className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-mono text-primary mb-2 uppercase tracking-wide">
            Advanced Controls
          </h3>
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
              <span className="text-muted-foreground">Threat Arcs</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={globeSettings.showHeatmap}
                onChange={(e) => useThreatStore.getState().updateGlobeSettings({ showHeatmap: e.target.checked })}
                className="rounded border-border bg-background"
              />
              <span className="text-muted-foreground">Clustering</span>
            </label>
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Animation Speed</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={globeSettings.animationSpeed}
                onChange={(e) => useThreatStore.getState().updateGlobeSettings({ 
                  animationSpeed: parseFloat(e.target.value) 
                })}
                className="w-full mt-1"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Stats */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div 
          className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 min-w-[220px]"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-mono text-primary mb-2 uppercase tracking-wide">
            Real-Time Intelligence
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Threats:</span>
              <span className="text-destructive font-mono animate-cyber-pulse">
                {activeThreats.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clusters:</span>
              <span className="text-primary font-mono">{clusteredThreats.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Critical:</span>
              <span className="text-destructive font-mono">
                {threats.filter(t => t.severity === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Countries:</span>
              <span className="text-warning font-mono">
                {new Set(threats.map(t => t.destination.country)).size}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* Error recovery hook */}
        <WebGLErrorRecovery />
        
        {/* Enhanced lighting */}
        <ambientLight intensity={0.4} color={0x404040} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          color={0x00d4ff}
          castShadow
        />
        <pointLight 
          position={[-10, -10, -5]} 
          intensity={0.4} 
          color={0xff0080}
        />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color={0x00ffff}
        />

        {/* Enhanced globe */}
        <EnhancedGlobe />
        
        {/* Cyber particles */}
        <CyberParticles />

        {/* Threat visualizations */}
        {globeSettings.showHeatmap ? (
          // Clustered view for performance
          clusteredThreats.map((cluster, index) => (
            <ThreatCluster
              key={index}
              threats={cluster.threats}
              position={cluster.position}
            />
          ))
        ) : (
          // Individual threat markers
          activeThreats.slice(0, 50).map((threat) => { // Limit for performance
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
                    speed={globeSettings.animationSpeed}
                  />
                )}
              </group>
            );
          })
        )}

        {/* Performance monitoring */}
        <PerformanceMonitor />

        {/* Enhanced controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.8}
          panSpeed={1.0}
          rotateSpeed={0.5}
          minDistance={4}
          maxDistance={20}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <motion.div 
          className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-mono text-primary mb-2 uppercase tracking-wide">
            Threat Classification
          </h3>
          <div className="space-y-2">
            {[
              { level: 'Low', color: '#00ff00', count: threats.filter(t => t.severity === 'low').length },
              { level: 'Medium', color: '#ffff00', count: threats.filter(t => t.severity === 'medium').length },
              { level: 'High', color: '#ff8800', count: threats.filter(t => t.severity === 'high').length },
              { level: 'Critical', color: '#ff0040', count: threats.filter(t => t.severity === 'critical').length },
            ].map(({ level, color, count }) => (
              <div key={level} className="flex items-center justify-between space-x-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-cyber-pulse"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-muted-foreground">{level}</span>
                </div>
                <span className="font-mono text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper functions
const WebGLErrorRecovery = () => {
  useWebGLErrorRecovery();
  return null;
};

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
  
  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5;
      markerRef.current.scale.setScalar(0.8 + pulse * 0.4);
    }
  });

  const color = useMemo(() => {
    switch (severity) {
      case 'low': return '#00ff00';
      case 'medium': return '#ffff00';
      case 'high': return '#ff8800';
      case 'critical': return '#ff0040';
      default: return '#ffffff';
    }
  }, [severity]);

  return (
    <mesh ref={markerRef} position={position} onClick={onClick}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

const latLngToVector3 = (lat: number, lng: number, radius: number = 2): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return [x, y, z];
};