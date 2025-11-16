import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface VinylProps {
  artistName: string;
  isPlaying?: boolean;
}

function Vinyl({ artistName, isPlaying = false }: VinylProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate vinyl if playing
      if (isPlaying) {
        meshRef.current.rotation.z += 0.01;
      }
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      {/* Main vinyl disc */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[2, 2, 0.1, 64]} />
        <MeshDistortMaterial
          color="#1a1a2e"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Center label */}
      <mesh position={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </mesh>

      {/* Grooves effect */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0, 0.055]} rotation={[0, 0, (Math.PI * 2 * i) / 20]}>
          <torusGeometry args={[1.5 - i * 0.05, 0.01, 8, 32]} />
          <meshStandardMaterial color="#0a0a0f" />
        </mesh>
      ))}

      {/* Artist name on label */}
      <Text
        position={[0, 0, 0.08]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        {artistName}
      </Text>
    </group>
  );
}

function Candles() {
  const candlePositions = Array.from({ length: 27 }).map((_, i) => {
    const angle = (i / 27) * Math.PI * 2;
    const radius = 3.5;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      delay: i * 0.1,
    };
  });

  return (
    <group>
      {candlePositions.map((pos, i) => (
        <Candle key={i} position={[pos.x, -1, pos.z]} delay={pos.delay} />
      ))}
    </group>
  );
}

function Candle({ position, delay }: { position: [number, number, number]; delay: number }) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flameRef.current) {
      // Flickering flame effect
      const flicker = Math.sin(state.clock.elapsedTime * 10 + delay) * 0.1 + 1;
      flameRef.current.scale.set(flicker, flicker, flicker);
    }
  });

  return (
    <group position={position}>
      {/* Candle body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.65, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Flame glow */}
      <pointLight position={[0, 0.7, 0]} intensity={0.5} distance={2} color="#ff6b35" />
    </group>
  );
}

interface VinylMemorialProps {
  artistName: string;
  isPlaying?: boolean;
}

export function VinylMemorial({ artistName, isPlaying = false }: VinylMemorialProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden glass">
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          color="#8b5cf6"
        />

        {/* 3D Scene */}
        <Vinyl artistName={artistName} isPlaying={isPlaying} />
        <Candles />

        {/* Base platform */}
        <mesh position={[0, -1.5, 0]} receiveShadow>
          <cylinderGeometry args={[4, 4, 0.2, 64]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
