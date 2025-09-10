import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Floating particles component
const Particles = ({ count = 100 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="#3B82F6" transparent opacity={0.6} />
      <instancedBufferAttribute attach="attributes-position" args={[positions, 3]} />
    </instancedMesh>
  );
};

// Floating AI brain component
const AIBrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#667eea" 
          transparent 
          opacity={0.8}
          wireframe
        />
      </mesh>
    </Float>
  );
};

// Floating code blocks
const CodeBlocks = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
          <Box 
            position={[
              Math.cos(i * Math.PI / 3) * 3,
              Math.sin(i * Math.PI / 3) * 2,
              Math.sin(i * Math.PI / 3) * 2
            ]}
            args={[0.5, 0.5, 0.5]}
          >
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#764ba2" : "#f093fb"} 
              transparent 
              opacity={0.7}
            />
          </Box>
        </Float>
      ))}
    </group>
  );
};

// Main 3D scene component
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <AIBrain />
      <CodeBlocks />
      <Particles count={50} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
};

// Main 3D Scene wrapper
const ThreeDScene: React.FC = () => {
  return (
    <div className="w-full h-96 md:h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <Scene />
      </Canvas>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default ThreeDScene; 