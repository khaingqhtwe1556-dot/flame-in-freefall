import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js'

export function SceneOrbitControls({ minDistance, maxDistance }: { minDistance: number; maxDistance: number }) {
  const { camera, gl } = useThree()
  const controls = useRef<ThreeOrbitControls | null>(null)

  useEffect(() => {
    const instance = new ThreeOrbitControls(camera, gl.domElement)
    instance.enableDamping = true
    instance.enablePan = false
    instance.enableZoom = true
    instance.minDistance = minDistance
    instance.maxDistance = maxDistance
    controls.current = instance
    return () => {
      instance.dispose()
      controls.current = null
    }
  }, [camera, gl, maxDistance, minDistance])

  useFrame(() => controls.current?.update())
  return null
}
