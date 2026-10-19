import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { PhotoItem } from '../../types';
import { distributePhotosToThreeRows } from '../../utils/photoDistribution';
import { createLoveTreeTexture } from './three/treeTextureHelper';
import { createPolaroidTexture } from './three/polaroidTextureHelper';
import { DoodleHeart } from '../ui/DoodleDecorations';
import { ZoomIn, Hand } from 'lucide-react';
import { PhotoLightboxModal } from '../ui/PhotoLightboxModal';

interface ThreeGallery3DProps {
  photos: PhotoItem[];
  treeReady?: boolean;
  className?: string;
  onPhotoClick?: (photo: PhotoItem) => void;
}

interface PhotoMeshRecord {
  mesh: THREE.Mesh;
  photo: PhotoItem;
  rowIndex: number;
  photoIndex: number;
  totalInRow: number;
  baseAngle: number;
  tiltZ: number;
}

interface FloatingPetal {
  mesh: THREE.Mesh;
  speedY: number;
  speedX: number;
  speedZ: number;
  rotSpeed: number;
}

export const ThreeGallery3D: React.FC<ThreeGallery3DProps> = ({
  photos,
  treeReady = true,
  className = '',
  onPhotoClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Lightbox selected photo
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Distribution into 3 orbits
  const [row1Photos, row2Photos, row3Photos] = useMemo(
    () => distributePhotosToThreeRows(photos),
    [photos]
  );

  // References for Three.js state that persist across renders without recreation
  const threeStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    treeMesh: THREE.Mesh;
    photoRecords: PhotoMeshRecord[];
    petals: FloatingPetal[];
    raycaster: THREE.Raycaster;
    mouseVec: THREE.Vector2;
    userRotation: number;
    inertiaVelocity: number;
    isPointerDown: boolean;
    hasDragged: boolean;
    startX: number;
    lastX: number;
    lastTime: number;
    rowProgress: [number, number, number];
    appearanceStartTime: number | null;
    animFrameId: number;
  } | null>(null);

  // Handle click on photo (open lightbox)
  const handleSelectPhoto = useCallback((photo: PhotoItem) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
  }, [onPhotoClick]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 640;
    const aspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera with responsive FOV & position for 100% fullscreen coverage
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 50 : aspect < 1.3 ? 44 : 40,
      aspect,
      0.1,
      100
    );
    camera.position.set(0, 0.1, isMobile ? 8.6 : 7.6);
    camera.lookAt(0, 0.05, 0);

    // 3. Renderer with transparent background to let warm sketchbook paper show through
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.sortObjects = true;
    container.replaceChildren(renderer.domElement);

    // 4. Center Love Tree Plane at Z = 0 (Majestic Centerpiece)
    const { texture: treeTex } = createLoveTreeTexture();
    const treeSize = isMobile ? 3.9 : 4.6;
    const treeGeo = new THREE.PlaneGeometry(treeSize, treeSize);
    const treeMat = new THREE.MeshBasicMaterial({
      map: treeTex,
      transparent: true,
      alphaTest: 0.25, // REAL DEPTH OCCLUSION: tree pixels write to depth buffer at Z=0
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const treeMesh = new THREE.Mesh(treeGeo, treeMat);
    treeMesh.position.set(0, 0.05, 0); // Origin Z = 0
    scene.add(treeMesh);

    // 5. Build 3D Photo Meshes with snug dimensions orbiting closely around the tree
    // Photos look like delicate scrapbook snapshots nestling warmly around the tree.
    const photoRecords: PhotoMeshRecord[] = [];
    const photoW = isMobile ? 0.30 : 0.42;
    const photoH = isMobile ? 0.38 : 0.53;
    const photoCardGeo = new THREE.PlaneGeometry(photoW, photoH);

    const rows = [row1Photos, row2Photos, row3Photos];
    const fixedTilts = [-0.035, 0.03, -0.02, 0.035, -0.04, 0.025];

    let globalPhotoIndex = 0;
    rows.forEach((rowPhotos, rowIndex) => {
      const count = rowPhotos.length;
      if (count === 0) return;

      rowPhotos.forEach((photo, i) => {
        const tex = createPolaroidTexture(photo, globalPhotoIndex);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.08,
          depthWrite: true,
          depthTest: true,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(photoCardGeo, mat);
        // User data for raycasting identification
        mesh.userData = { photo, index: globalPhotoIndex };

        const baseAngle = (i / count) * Math.PI * 2 + (rowIndex * Math.PI) / 3;
        const tiltZ = fixedTilts[globalPhotoIndex % fixedTilts.length];

        mesh.position.set(0, 0, -100); // initially unspawned behind
        scene.add(mesh);

        photoRecords.push({
          mesh,
          photo,
          rowIndex,
          photoIndex: i,
          totalInRow: count,
          baseAngle,
          tiltZ,
        });

        globalPhotoIndex++;
      });
    });

    // 6. Floating 3D Petals around the tree for depth atmosphere
    const petals: FloatingPetal[] = [];
    const petalColors = [0xdda0a5, 0xc9757c, 0xf4c2c6, 0xe1c17a, 0xc8b4d4, 0xa9b99a];
    const petalGeo = new THREE.PlaneGeometry(0.12, 0.16);

    for (let i = 0; i < 30; i++) {
      const pColor = petalColors[i % petalColors.length];
      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      });
      const pMesh = new THREE.Mesh(petalGeo, pMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 6.5,
        (Math.random() - 0.5) * 5.0,
        (Math.random() - 0.5) * 5.0
      );
      pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(pMesh);

      petals.push({
        mesh: pMesh,
        speedY: 0.005 + Math.random() * 0.007,
        speedX: (Math.random() - 0.5) * 0.004,
        speedZ: (Math.random() - 0.5) * 0.004,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    const state = {
      scene,
      camera,
      renderer,
      treeMesh,
      photoRecords,
      petals,
      raycaster: new THREE.Raycaster(),
      mouseVec: new THREE.Vector2(),
      userRotation: 0,
      inertiaVelocity: 0,
      isPointerDown: false,
      hasDragged: false,
      startX: 0,
      lastX: 0,
      lastTime: performance.now(),
      rowProgress: [0, 0, 0] as [number, number, number],
      appearanceStartTime: null as number | null,
      animFrameId: 0,
    };

    threeStateRef.current = state;

    // Responsive Resize Handler: Automatically adapts to fullscreen viewport
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      const mobile = newW < 640;
      const asp = newW / newH;

      camera.aspect = asp;
      camera.fov = mobile ? 50 : asp < 1.3 ? 44 : 40;
      camera.position.z = mobile ? 8.6 : 7.6;
      camera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Main 3D Animation Loop
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastFrameTime) / 1000);
      lastFrameTime = currentTime;

      const currentW = container.clientWidth || window.innerWidth;
      const currentH = container.clientHeight || window.innerHeight;
      const mobile = currentW < 640;
      const asp = currentW / currentH;

      // 1. Staged Emergence from Behind the Tree
      if (treeReady) {
        if (state.appearanceStartTime === null) {
          state.appearanceStartTime = currentTime;
        }

        const elapsed = (currentTime - state.appearanceStartTime) / 1000;

        // Stage 2: Row 0 (Top) starts at t = 0s
        const p0 = Math.min(1, Math.max(0, elapsed / 0.85));
        // Stage 3: Row 1 (Mid) starts at t = 0.5s
        const p1 = Math.min(1, Math.max(0, (elapsed - 0.5) / 0.85));
        // Stage 4: Row 2 (Bot) starts at t = 1.0s
        const p2 = Math.min(1, Math.max(0, (elapsed - 1.0) / 0.85));

        state.rowProgress = [p0, p1, p2];
      } else {
        state.rowProgress = [0, 0, 0];
        state.appearanceStartTime = null;
      }

      // 2. Physics: Inertia & Smooth Auto-rotation
      if (!state.isPointerDown) {
        // Friction damping
        state.inertiaVelocity *= 0.94;

        if (Math.abs(state.inertiaVelocity) < 0.0001) {
          state.inertiaVelocity = 0;
          // Smooth continuous auto-rotation
          state.userRotation += dt * 0.15;
        } else {
          state.userRotation += state.inertiaVelocity;
        }
      }

      // 3. Tree gentle sway in 3D
      treeMesh.rotation.z = Math.sin(currentTime * 0.001) * 0.012;

      // 4. Update 3D Floating Petals
      petals.forEach((petal) => {
        petal.mesh.position.y -= petal.speedY;
        petal.mesh.position.x += petal.speedX;
        petal.mesh.position.z += petal.speedZ;
        petal.mesh.rotation.x += petal.rotSpeed;
        petal.mesh.rotation.y += petal.rotSpeed * 0.8;

        if (petal.mesh.position.y < -3.2) {
          petal.mesh.position.y = 3.2;
          petal.mesh.position.x = (Math.random() - 0.5) * 6.5;
          petal.mesh.position.z = (Math.random() - 0.5) * 5.0;
        }
      });

      // 5. Update Orbiting Photos in 3D Space: Snug, intimate orbits hugging the Love Tree
      // Orbit 0 (Upper): weaves closely around the heart canopy lobes
      // Orbit 1 (Mid): hugs the widest part of the tree branches
      // Orbit 2 (Lower): wraps gently around the trunk and roots
      const orbitY = mobile ? [1.15, 0.0, -1.15] : [1.25, 0.0, -1.25];
      const orbitRadii = mobile
        ? [1.55, 1.85, 1.60] // Tightly embraces the tree on mobile screens, avoiding border overflow
        : asp >= 1.3
        ? [2.25, 2.75, 2.35] // Cozy, harmonious orbit close to the tree on widescreen
        : [1.95, 2.35, 2.05]; // Balanced for square/tablet displays
      const orbitSpeeds = [0.26, 0.20, 0.24];

      photoRecords.forEach((record) => {
        const rowProg = state.rowProgress[record.rowIndex];

        if (rowProg <= 0.01) {
          record.mesh.visible = false;
          return;
        }

        record.mesh.visible = true;

        // Radius emerges outward from behind the tree:
        const targetRadius = orbitRadii[record.rowIndex];
        const currentRadius = targetRadius * (0.35 + 0.65 * rowProg);

        // Angle on orbit: base angle + orbit individual speed + user rotation
        const baseOrbitAngle = record.baseAngle + currentTime * 0.0003 * orbitSpeeds[record.rowIndex];
        const angle = baseOrbitAngle + state.userRotation;

        // Coordinates in 3D space:
        // Z > 0 is in front of the tree (closer to camera)
        // Z < 0 is behind the tree (occluded by tree mesh at Z=0)
        const x = Math.sin(angle) * currentRadius;
        const y = orbitY[record.rowIndex];
        const z = Math.cos(angle) * currentRadius;

        record.mesh.position.set(x, y, z);

        // Billboard lookAt camera with slight organic handmade tilt
        record.mesh.lookAt(camera.position);
        record.mesh.rotateZ(record.tiltZ);

        // Smooth emergence scale
        if (rowProg < 1.0) {
          const s = Math.min(1.0, 0.5 + 0.5 * rowProg);
          record.mesh.scale.set(s, s, s);
        } else {
          record.mesh.scale.set(1, 1, 1);
        }
      });

      // Render Three.js Scene
      renderer.render(scene, camera);

      state.animFrameId = requestAnimationFrame(animate);
    };

    state.animFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(state.animFrameId);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      photoRecords.forEach((r) => {
        r.mesh.geometry.dispose();
        if (Array.isArray(r.mesh.material)) {
          r.mesh.material.forEach((m) => m.dispose());
        } else {
          r.mesh.material.dispose();
        }
      });

      petals.forEach((p) => {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });

      treeGeo.dispose();
      treeMat.dispose();
      treeTex.dispose();
      renderer.dispose();

      threeStateRef.current = null;
    };
  }, [row1Photos, row2Photos, row3Photos, treeReady]);

  // Pointer interaction: Swipe, Drag, and Click detection
  const handlePointerDown = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state) return;

    state.isPointerDown = true;
    state.hasDragged = false;
    state.startX = e.clientX;
    state.lastX = e.clientX;
    state.lastTime = performance.now();
    state.inertiaVelocity = 0;
    setHasInteracted(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state || !state.isPointerDown) return;

    const now = performance.now();
    const dt = Math.max(1, now - state.lastTime);
    const deltaX = e.clientX - state.lastX;

    if (Math.abs(e.clientX - state.startX) > 6) {
      state.hasDragged = true;
    }

    // Apply rotation based on movement
    const sensitivity = window.innerWidth < 640 ? 0.007 : 0.0045;
    state.userRotation += deltaX * sensitivity;

    // Track instantaneous velocity for inertia
    state.inertiaVelocity = (deltaX / dt) * 0.045;
    state.lastX = e.clientX;
    state.lastTime = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state) return;

    state.isPointerDown = false;

    // Clamp inertia velocity to avoid runaway spin
    state.inertiaVelocity = Math.max(-0.045, Math.min(0.045, state.inertiaVelocity));

    // If it was a click (not a drag), perform raycasting to select photo
    if (!state.hasDragged) {
      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      state.mouseVec.x = (clientX / container.clientWidth) * 2 - 1;
      state.mouseVec.y = -(clientY / container.clientHeight) * 2 + 1;

      state.raycaster.setFromCamera(state.mouseVec, state.camera);

      const clickableMeshes = state.photoRecords
        .filter((r) => r.mesh.visible)
        .map((r) => r.mesh);

      const intersects = state.raycaster.intersectObjects(clickableMeshes, false);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as THREE.Mesh;
        const photo = topHit.userData?.photo as PhotoItem;
        if (photo) {
          handleSelectPhoto(photo);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-full overflow-hidden select-none ${className}`}
    >
      {/* WebGL 3D Canvas Container - 100% Fullscreen Viewport */}
      <div
        ref={canvasContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Interactive Helper Hint */}
      {!hasInteracted && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 bg-paper-white/95 sketch-border shadow-sketch px-4 py-1.5 flex items-center gap-2 pointer-events-none animate-pulse z-30">
          <Hand size={16} className="text-pencil-rose animate-bounce" />
          <span className="font-hand text-pencil-graphite text-xs sm:text-sm font-bold">
            Vuốt hoặc kéo chuột để xoay vòng ảnh 3D
          </span>
          <DoodleHeart size={14} fill="#C9757C" />
        </div>
      )}

      {/* Light Zoom hint at bottom */}
      <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 font-hand text-pencil-lead text-xs sm:text-sm tracking-wide opacity-80 flex items-center gap-1.5 pointer-events-none z-30 bg-paper-white/80 sketch-border-subtle px-3 py-0.5 rounded-xs">
        <ZoomIn size={14} />
        <span>Chạm vào ảnh để mở xem chi tiết cuốn sổ kỷ niệm</span>
      </div>

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: Xem ảnh lớn dạng scrapbook */}
      {/* ======================================================== */}
      <PhotoLightboxModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};
