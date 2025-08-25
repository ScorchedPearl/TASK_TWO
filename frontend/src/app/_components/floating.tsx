"use client";
import { Canvas } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import { useMemo } from 'react'

function FloatingGrocery({ position, color, size }: { position: [number, number, number], color: string, size: number }) {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
      <mesh position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </Float>
  )
}

export function FloatingGroceries() {
  const groceries = useMemo(() => {
    const items = []
    const colors = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
    
    for (let i = 0; i < 15; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10
        ] as [number, number, number],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 0.3 + 0.1
      })
    }
    return items
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        {groceries.map((grocery, i) => (
          <FloatingGrocery
            key={i}
            position={grocery.position}
            color={grocery.color}
            size={grocery.size}
          />
        ))}
      </Canvas>
    </div>
  )
}