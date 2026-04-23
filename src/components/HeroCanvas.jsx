import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { useRef } from 'react';

function Scene() {
  const sphereRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    sphereRef.current.distort = 0.4 + Math.sin(t / 2) * 0.15;
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <Float speed={5} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2.4}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </Float>
    </>
  );
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 h-screen w-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Scene />
      </Canvas>
    </div>
  );
}