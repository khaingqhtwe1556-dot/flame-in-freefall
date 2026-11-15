import { Canvas } from '@react-three/fiber'
import { SceneOrbitControls } from './SceneOrbitControls'

export type HabitatZone = 'crew' | 'laboratory' | 'oxygen' | 'electrical' | 'detection' | 'exit'

const zonePositions: Record<HabitatZone, [number, number, number]> = {
  crew: [-1.2, 0.12, -0.8],
  laboratory: [0, 0.12, -1.35],
  oxygen: [1.2, 0.15, -0.8],
  electrical: [-1.2, 0.12, 0.9],
  detection: [0, 0.12, 1.35],
  exit: [1.2, 0.12, 0.9],
}

const zoneColors: Record<HabitatZone, string> = {
  crew: '#38bdf8',
  laboratory: '#a78bfa',
  oxygen: '#34d399',
  electrical: '#fbbf24',
  detection: '#fb7185',
  exit: '#e2e8f0',
}

function HabitatModules({ mission, selected, onSelect }: { mission: 'Moon' | 'Mars'; selected: HabitatZone; onSelect: (zone: HabitatZone) => void }) {
  const accent = mission === 'Moon' ? '#38bdf8' : '#f97316'

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.7} />
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.35, 2.55, 0.18, 64]} />
        <meshStandardMaterial color="#18243a" metalness={0.55} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.72, 0.86, 0.84, 32]} />
        <meshStandardMaterial color="#243249" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.25, 0]} scale={[2.1, 0.85, 2.1]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.065} wireframe />
      </mesh>
      {(Object.keys(zonePositions) as HabitatZone[]).map((zone) => {
        const isSelected = selected === zone
        const color = isSelected ? '#f8fafc' : zoneColors[zone]
        const position = zonePositions[zone]
        return (
          <group key={zone} position={position} onClick={(event) => { event.stopPropagation(); onSelect(zone) }}>
            {zone === 'oxygen' ? (
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.28, 0.32, 0.72, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.7 : 0.18} metalness={0.5} roughness={0.35} />
              </mesh>
            ) : zone === 'detection' ? (
              <mesh position={[0, 0.47, 0]}>
                <sphereGeometry args={[0.22, 24, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1 : 0.45} />
              </mesh>
            ) : (
              <mesh position={[0, 0.23, 0]}>
                <boxGeometry args={zone === 'exit' ? [0.52, 0.74, 0.18] : [0.82, 0.48, 0.62]} />
                <meshStandardMaterial color={color} emissive={zoneColors[zone]} emissiveIntensity={isSelected ? 0.7 : 0.13} metalness={0.2} roughness={0.55} transparent opacity={0.88} />
              </mesh>
            )}
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[0.96, 0.06, 0.76]} />
              <meshStandardMaterial color={isSelected ? '#f8fafc' : accent} emissive={accent} emissiveIntensity={isSelected ? 0.7 : 0.12} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
    </>
  )
}

export function HabitatScene({ mission, selected, onSelect }: { mission: 'Moon' | 'Mars'; selected: HabitatZone; onSelect: (zone: HabitatZone) => void }) {
  return (
    <div aria-label={`${mission} conceptual habitat model. Drag to rotate and scroll to zoom.`} className="habitat-scene" role="img">
      <Canvas camera={{ position: [4, 3.2, 5], fov: 42 }} dpr={[1, 1.5]} fallback={<div className="webgl-fallback"><strong>3D view unavailable</strong><small>Use the area selector below.</small></div>} gl={{ antialias: false, powerPreference: 'low-power' }}>
        <HabitatModules mission={mission} onSelect={onSelect} selected={selected} />
        <SceneOrbitControls minDistance={4} maxDistance={9} />
      </Canvas>
    </div>
  )
}
