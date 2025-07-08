import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreatArcProps {
  start: [number, number, number];
  end: [number, number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  speed?: number;
}

export const ThreatArc: React.FC<ThreatArcProps> = ({ start, end, severity, speed = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create curved path between two points
  const { points, color } = useMemo(() => {
    const startVector = new THREE.Vector3(...start);
    const endVector = new THREE.Vector3(...end);
    
    // Calculate midpoint elevated above the globe surface
    const midPoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const distance = startVector.distanceTo(endVector);
    const elevation = distance * 0.3 + 0.5; // Arc height based on distance
    midPoint.normalize().multiplyScalar(2 + elevation);

    // Create smooth curve
    const curve = new THREE.QuadraticBezierCurve3(startVector, midPoint, endVector);
    const points = curve.getPoints(50);

    // Color based on severity
    const severityColors = {
      low: '#00ff00',
      medium: '#ffff00', 
      high: '#ff8800',
      critical: '#ff0000'
    };

    return {
      points,
      color: severityColors[severity]
    };
  }, [start, end, severity]);

  // Animate the arc with speed control
  useFrame((state) => {
    if (groupRef.current) {
      // Animated progression along the arc
      groupRef.current.children.forEach((child, index) => {
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          const time = state.clock.elapsedTime * speed;
          const progress = (time + index * 0.1) % 2;
          const pulse = progress < 1 ? progress : 2 - progress;
          material.opacity = 0.3 + pulse * 0.7;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((point, index) => {
        if (index === points.length - 1) return null;
        
        const nextPoint = points[index + 1];
        const midPoint = point.clone().add(nextPoint).multiplyScalar(0.5);
        
        return (
          <mesh key={index} position={[midPoint.x, midPoint.y, midPoint.z]}>
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};