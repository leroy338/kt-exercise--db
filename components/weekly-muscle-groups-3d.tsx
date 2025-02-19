'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Card } from './ui/card'

interface WeeklyMuscleGroups3DProps {
  scheduledWorkouts: {
    template: {
      template: {
        sections: {
          exercises: {
            muscleGroups: string[]
          }[]
        }[]
      }
    }
  }[]
}

export function WeeklyMuscleGroups3D({ scheduledWorkouts }: WeeklyMuscleGroups3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111)

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // Load textures
    const textureLoader = new THREE.TextureLoader()
    
    const muscleBumpMap = textureLoader.load('https://placehold.co/512x512.png')
    const muscleNormalMap = textureLoader.load('https://placehold.co/512x512.png')
    
    // Enhanced materials with bump mapping
    const torsoMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.9,
      shininess: 50,
      bumpMap: muscleBumpMap,
      bumpScale: 0.05,
      normalMap: muscleNormalMap,
      normalScale: new THREE.Vector2(0.5, 0.5)
    })

    const limbMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.9,
      shininess: 50,
      bumpMap: muscleBumpMap,
      bumpScale: 0.03,
      normalMap: muscleNormalMap,
      normalScale: new THREE.Vector2(0.3, 0.3)
    })

    // Create geometries with more segments for better normal mapping
    const torsoGeometry = new THREE.CylinderGeometry(1, 0.8, 3, 32, 16)
    const shouldersGeometry = new THREE.CylinderGeometry(1.2, 1, 0.5, 32, 8)
    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 32)
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const upperArmGeometry = new THREE.CylinderGeometry(0.25, 0.2, 1.2, 32, 12)
    const forearmGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1.1, 32, 12)
    const hipsGeometry = new THREE.CylinderGeometry(0.8, 0.7, 0.5, 32)
    const upperLegGeometry = new THREE.CylinderGeometry(0.35, 0.25, 1.5, 32, 16)
    const lowerLegGeometry = new THREE.CylinderGeometry(0.25, 0.2, 1.5, 32, 16)

    // Torso and core
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial)
    scene.add(torso)

    const shoulders = new THREE.Mesh(shouldersGeometry, torsoMaterial)
    shoulders.position.y = 1.5
    scene.add(shoulders)

    const neck = new THREE.Mesh(neckGeometry, torsoMaterial)
    neck.position.y = 2
    scene.add(neck)

    const head = new THREE.Mesh(headGeometry, torsoMaterial)
    head.position.y = 2.5
    scene.add(head)

    const hips = new THREE.Mesh(hipsGeometry, torsoMaterial)
    hips.position.y = -1.5
    scene.add(hips)

    // Arms
    const createArm = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1
      const upperArm = new THREE.Mesh(upperArmGeometry, torsoMaterial)
      upperArm.position.set(side * 1.3, 1.2, 0)
      upperArm.rotation.z = side * 0.2
      scene.add(upperArm)

      const forearm = new THREE.Mesh(forearmGeometry, torsoMaterial)
      forearm.position.set(side * 1.4, 0.3, 0)
      forearm.rotation.z = side * 0.3
      scene.add(forearm)
    }

    createArm(true)  // Left arm
    createArm(false) // Right arm

    // Legs
    const createLeg = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1
      const upperLeg = new THREE.Mesh(upperLegGeometry, torsoMaterial)
      upperLeg.position.set(side * 0.4, -2, 0)
      scene.add(upperLeg)

      const lowerLeg = new THREE.Mesh(lowerLegGeometry, torsoMaterial)
      lowerLeg.position.set(side * 0.4, -3.5, 0)
      scene.add(lowerLeg)
    }

    createLeg(true)  // Left leg
    createLeg(false) // Right leg

    // Enhanced lighting for better normal map visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const frontLight = new THREE.DirectionalLight(0xffffff, 1)
    frontLight.position.set(2, 2, 5)
    scene.add(frontLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.7)
    backLight.position.set(-2, 2, -5)
    scene.add(backLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5)
    topLight.position.set(0, 5, 0)
    scene.add(topLight)

    // Add point lights for better muscle definition
    const createPointLight = (x: number, y: number, z: number) => {
      const light = new THREE.PointLight(0xffffff, 0.3)
      light.position.set(x, y, z)
      scene.add(light)
    }

    createPointLight(2, 0, 2)
    createPointLight(-2, 0, 2)
    createPointLight(2, 0, -2)
    createPointLight(-2, 0, -2)

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Weekly Muscle Focus (3D)</h3>
      <div ref={containerRef} className="w-full aspect-square" />
    </Card>
  )
}

function createBasicMuscleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  
  // Create basic muscle pattern
  ctx.fillStyle = '#444444'
  ctx.fillRect(0, 0, 512, 512)
  
  return canvas.toDataURL()
} 