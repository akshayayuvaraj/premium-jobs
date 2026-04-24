import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Torus, Octahedron } from "@react-three/drei";
import * as THREE from "three";

function FloatingSphere({ position, color, speed, distort, scale }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.4;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.z = t * 0.2;
  });
  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distort}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}

function FloatingTorus({ position, color, speed, scale }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.cos(t) * 0.3;
    ref.current.rotation.x = t * 0.5;
    ref.current.rotation.y = t * 0.4;
  });
  return (
    <Torus ref={ref} args={[1, 0.35, 32, 64]} position={position} scale={scale}>
      <meshStandardMaterial
        color={color}
        roughness={0.05}
        metalness={0.9}
        transparent
        opacity={0.7}
      />
    </Torus>
  );
}

function FloatingOcta({ position, color, speed, scale }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t + 1) * 0.5;
    ref.current.rotation.x = t * 0.6;
    ref.current.rotation.y = t * 0.4;
  });
  return (
    <Octahedron ref={ref} args={[1, 0]} position={position} scale={scale}>
      <meshStandardMaterial
        color={color}
        roughness={0.1}
        metalness={0.85}
        transparent
        opacity={0.8}
        wireframe={false}
      />
    </Octahedron>
  );
}

function ParticleField() {
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return arr;
  }, []);
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#a78bfa" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#c4b5fd" />
      <pointLight position={[-5, -3, 2]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[3, 4, -2]} intensity={1.0} color="#f472b6" />

      <FloatingSphere position={[-3.5, 0.5, -1]} color="#7c3aed" speed={0.5} distort={0.5} scale={1.1} />
      <FloatingSphere position={[4, -1, -2]} color="#0ea5e9" speed={0.4} distort={0.4} scale={0.75} />
      <FloatingSphere position={[0.5, 2.2, -3]} color="#a855f7" speed={0.6} distort={0.3} scale={0.55} />

      <FloatingTorus position={[3.2, 1.2, 0]} color="#38bdf8" speed={0.35} scale={0.65} />
      <FloatingTorus position={[-1.5, -2.2, -1]} color="#e879f9" speed={0.45} scale={0.45} />

      <FloatingOcta position={[1.5, -1.5, 0.5]} color="#f472b6" speed={0.55} scale={0.55} />
      <FloatingOcta position={[-4, 2, -2]} color="#818cf8" speed={0.3} scale={0.4} />

      <ParticleField />
    </>
  );
}