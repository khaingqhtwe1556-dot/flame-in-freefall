import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SceneOrbitControls } from './SceneOrbitControls'
import type { FlameSettings } from '../types/flame'

const fuelColors: Record<string, { shell: string; core: string }> = {
  'Gaseous fuel': { shell: '#ff6a2a', core: '#ff9a3c' },
  'Liquid droplet': { shell: '#ff8b38', core: '#ff9a3c' },
  'Solid fuel': { shell: '#f25722', core: '#ff9a3c' },
  'Hydrogen concept': { shell: '#ff6a2a', core: '#ff9a3c' },
}

type FlameProfile = [height: number, radius: number][]

const outerProfile: FlameProfile = [
  [-0.84, 0.035], [-0.73, 0.15], [-0.55, 0.25], [-0.31, 0.34],
  [-0.05, 0.38], [0.19, 0.35], [0.42, 0.27], [0.63, 0.19],
  [0.81, 0.12], [0.98, 0.065], [1.1, 0.018],
]

const innerProfile: FlameProfile = [
  [-0.72, 0.018], [-0.62, 0.1], [-0.44, 0.17], [-0.23, 0.2],
  [-0.02, 0.18], [0.19, 0.13], [0.38, 0.085], [0.53, 0.04], [0.61, 0.01],
]

function createFlameGeometry(profile: FlameProfile, stops: [number, string][]) {
  const radialSegments = 40
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const minHeight = profile[0][0]
  const maxHeight = profile[profile.length - 1][0]
  const colorStops = stops.map(([position, color]) => [position, new THREE.Color(color)] as const)

  profile.forEach(([height, baseRadius], ring) => {
    const progress = (height - minHeight) / (maxHeight - minHeight)
    let stopIndex = colorStops.findIndex(([position]) => position >= progress)
    if (stopIndex < 1) stopIndex = 1
    if (stopIndex < 0) stopIndex = colorStops.length - 1
    const [startPosition, startColor] = colorStops[stopIndex - 1]
    const [endPosition, endColor] = colorStops[stopIndex]
    const color = startColor.clone().lerp(endColor, (progress - startPosition) / Math.max(endPosition - startPosition, 0.0001))

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const angle = (segment / radialSegments) * Math.PI * 2
      const turbulence =
        1 +
        Math.sin(angle * 3 + ring * 0.72) * 0.045 +
        Math.sin(angle * 5 - ring * 1.15) * 0.022
      const radius = baseRadius * turbulence
      positions.push(Math.cos(angle) * radius, height, Math.sin(angle) * radius)
      colors.push(color.r, color.g, color.b)
    }
  })

  for (let ring = 0; ring < profile.length - 1; ring += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const next = (segment + 1) % radialSegments
      const lower = ring * radialSegments + segment
      const lowerNext = ring * radialSegments + next
      const upper = (ring + 1) * radialSegments + segment
      const upperNext = (ring + 1) * radialSegments + next
      indices.push(lower, upper, lowerNext, lowerNext, upper, upperNext)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function FlameObject({ settings }: { settings: FlameSettings }) {
  const flame = useRef<THREE.Group>(null)
  const innerFlame = useRef<THREE.Group>(null)
  const dropletShell = useRef<THREE.Mesh>(null)
  const embers = useRef<THREE.Points>(null)
  const palette = fuelColors[settings.fuel] ?? fuelColors['Gaseous fuel']
  const oxygenFactor = 0.82 + (settings.oxygen / 35) * 0.34
  const heatFactor = 0.82 + (settings.temperature / 1400) * 0.32
  const dropletMode = settings.fuel === 'Liquid droplet' && settings.gravity === 'microgravity'
  const width = settings.gravity === 'microgravity' ? 1 : 0.62
  const height = dropletMode ? 1 : settings.gravity === 'microgravity' ? 0.91 : 1.15
  const outerGeometry = useMemo(
    () => createFlameGeometry(outerProfile, [
      [0, palette.shell],
      [0.2, palette.shell],
      [0.55, '#ff6829'],
      [0.84, palette.core],
      [1, '#ff8731'],
    ]),
    [palette],
  )
  const glowGeometry = useMemo(
    () => createFlameGeometry(outerProfile, [
      [0, palette.shell],
      [0.2, palette.shell],
      [0.55, '#ff6829'],
      [0.84, palette.core],
      [1, '#ff8731'],
    ]),
    [palette],
  )
  const innerGeometry = useMemo(
    () => createFlameGeometry(innerProfile, [
      [0, '#ff6829'],
      [0.3, palette.core],
      [0.78, '#ffad43'],
      [1, '#ff752b'],
    ]),
    [palette],
  )
  const emberData = useMemo(
    () => Array.from({ length: 42 }, (_, index) => ({
      angle: index * 2.399,
      phase: (index * 0.618) % 1,
      speed: 0.72 + (index % 5) * 0.12,
      spread: 0.12 + (index % 4) * 0.035,
    })),
    [],
  )
  const emberPositions = useMemo(() => new Float32Array(emberData.length * 3), [emberData])

  useEffect(() => {
    if (flame.current) {
      flame.current.scale.set(width * oxygenFactor, height * oxygenFactor * heatFactor, width * oxygenFactor)
      flame.current.rotation.z = !dropletMode && settings.gravity === 'earth' ? Math.min(settings.airflow / 100, 1) * -0.26 : 0
    }
    if (innerFlame.current) {
      innerFlame.current.scale.set(dropletMode ? 1 : 0.63, dropletMode ? 1 : 0.72, dropletMode ? 1 : 0.63)
      innerFlame.current.rotation.set(0, 0, 0)
    }
  }, [dropletMode, heatFactor, height, oxygenFactor, settings.airflow, settings.gravity, width])

  useFrame(({ clock }, delta) => {
    if (!settings.playing) return
    const time = clock.elapsedTime
    const pulseX = 1 + Math.sin(time * 5.2) * 0.025
    const pulseY = 1 + Math.sin(time * 4.1 + 0.8) * 0.038
    const lean = !dropletMode && settings.gravity === 'earth' ? Math.min(settings.airflow / 100, 1) * -0.26 : 0

    if (flame.current) {
      flame.current.scale.set(width * oxygenFactor * pulseX, height * oxygenFactor * heatFactor * pulseY, width * oxygenFactor * pulseX)
      flame.current.rotation.z = lean + Math.sin(time * 2.1) * 0.018
    }
    if (dropletShell.current) {
      const shellPulse = 1.08 + Math.sin(time * 3.4) * 0.018
      dropletShell.current.scale.setScalar(shellPulse)
      dropletShell.current.rotation.set(Math.sin(time * 0.4) * 0.04, time * 0.12, Math.cos(time * 0.36) * 0.04)
    }
    if (innerFlame.current) {
      if (dropletMode) {
        const corePulse = 1 + Math.sin(time * 4.5) * 0.016
        innerFlame.current.scale.setScalar(corePulse)
        innerFlame.current.rotation.y = -time * 0.08
      } else {
        innerFlame.current.rotation.z = lean * 0.8 + Math.sin(time * 4.4 + 1.2) * 0.035
        innerFlame.current.scale.y = 0.72 + Math.sin(time * 5.2 + 0.5) * 0.025
      }
    }
    if (embers.current) {
      const position = embers.current.geometry.getAttribute('position') as THREE.BufferAttribute
      emberData.forEach(({ angle, phase, speed, spread }, index) => {
        const rise = (time * speed * 0.24 + phase) % 1
        if (dropletMode) {
          const orbit = angle + time * (0.2 + speed * 0.16)
          const radius = 0.82 + spread * 0.65
          position.setXYZ(index, Math.cos(orbit) * radius, Math.sin(angle * 1.7 + phase + time * 0.18) * 0.58, Math.sin(orbit) * radius)
        } else {
          const radius = spread * (0.25 + rise)
          const drift = settings.gravity === 'earth' ? -rise * settings.airflow * 0.002 : Math.sin(time + angle) * 0.06
          position.setXYZ(
            index,
            Math.cos(angle + time * 0.12) * radius + drift,
            -0.62 + rise * 2.02,
            Math.sin(angle + time * 0.12) * radius,
          )
        }
      })
      position.needsUpdate = true
      embers.current.rotation.y += delta * 0.08
    }
  })

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight color={palette.core} intensity={3.4} distance={4.5} position={[0, 0.15, 1.1]} />
      <pointLight color={palette.shell} intensity={1.2} distance={3.2} position={[0, -0.34, 0.6]} />
      <group position={[0, 0.04, 0]} ref={flame}>
        {dropletMode ? (
          <>
            <mesh ref={dropletShell} scale={[1.08, 1.08, 1.08]}>
              <sphereGeometry args={[0.76, 48, 36]} />
              <meshBasicMaterial color="#ff843c" depthWrite={false} opacity={0.28} side={THREE.DoubleSide} toneMapped={false} transparent />
            </mesh>
            <mesh scale={[0.89, 0.89, 0.89]}>
              <sphereGeometry args={[0.65, 40, 32]} />
              <meshBasicMaterial color="#ff9a45" depthWrite={false} opacity={0.22} side={THREE.DoubleSide} toneMapped={false} transparent />
            </mesh>
            <group ref={innerFlame}>
              <mesh scale={[0.77, 0.77, 0.77]}>
                <sphereGeometry args={[0.65, 40, 32]} />
                <meshBasicMaterial color="#ff8b38" depthWrite={false} opacity={0.7} side={THREE.DoubleSide} toneMapped={false} transparent />
              </mesh>
              <mesh scale={[0.94, 0.94, 0.94]}>
                <sphereGeometry args={[0.19, 32, 24]} />
                <meshBasicMaterial color="#ff9a3c" toneMapped={false} />
              </mesh>
              <pointLight color="#ff9a45" intensity={1.3} distance={1.5} position={[0.25, 0.12, 0.2]} />
            </group>
          </>
        ) : (
          <>
            <mesh geometry={glowGeometry} scale={[1.3, 1.04, 1.3]}>
              <meshBasicMaterial blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.07} side={THREE.DoubleSide} toneMapped={false} transparent vertexColors />
            </mesh>
            <mesh geometry={outerGeometry} scale={[1.08, 1, 1.08]}>
              <meshBasicMaterial depthWrite={false} opacity={0.94} side={THREE.DoubleSide} toneMapped={false} transparent vertexColors />
            </mesh>
            <group position={[0, -0.04, 0]} ref={innerFlame} scale={[0.63, 0.72, 0.63]}>
              <mesh geometry={innerGeometry}>
                <meshBasicMaterial depthWrite={false} opacity={0.94} side={THREE.DoubleSide} toneMapped={false} transparent vertexColors />
              </mesh>
              <mesh position={[0, -0.38, 0]} scale={[0.43, 0.48, 0.43]}>
                <sphereGeometry args={[0.28, 24, 24]} />
                <meshBasicMaterial color="#ff8b32" depthWrite={false} opacity={0.72} toneMapped={false} transparent />
              </mesh>
            </group>
          </>
        )}
      </group>
      <points ref={embers}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberPositions, 3]} count={emberData.length} />
        </bufferGeometry>
        <pointsMaterial blending={THREE.AdditiveBlending} color={palette.core} depthWrite={false} opacity={0.9} size={0.055} sizeAttenuation toneMapped={false} transparent />
      </points>
      {!dropletMode && (
        <>
          <mesh position={[0, -0.91, 0]}>
            <cylinderGeometry args={[0.23, 0.27, 0.11, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.62} roughness={0.42} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
            <ringGeometry args={[0.28, 0.34, 48]} />
            <meshBasicMaterial color={palette.core} blending={THREE.AdditiveBlending} transparent opacity={0.56} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]}>
            <circleGeometry args={[1.6, 48]} />
            <meshBasicMaterial color={palette.shell} transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </>
  )
}

export function FlameScene({ settings, label = 'Illustrative flame visualization' }: { settings: FlameSettings; label?: string }) {
  return (
    <div aria-label={label} className="flame-scene" role="img">
      <Canvas
        camera={{ position: [0, 0.2, 4], fov: 42 }}
        dpr={[1, 1.5]}
        flat
        fallback={<div className="webgl-fallback"><span className="fallback-flame" /><strong>3D view unavailable</strong><small>WebGL is not enabled on this device.</small></div>}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true, toneMapping: THREE.NoToneMapping }}
      >
        <FlameObject settings={settings} />
        <SceneOrbitControls minDistance={2.6} maxDistance={6} />
      </Canvas>
    </div>
  )
}
