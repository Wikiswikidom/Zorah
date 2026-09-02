"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type BagParts = {
  root: THREE.Group;
  flap: THREE.Group;
  contents: THREE.Group;
  strap: THREE.Group;
};

function material(color: number, roughness = 0.42, metalness = 0, clearcoat = 0.2) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat, clearcoatRoughness: 0.24 });
}

function makeBag(): BagParts {
  const root = new THREE.Group();
  const leather = material(0x173d32, 0.36, 0.02, 0.5);
  const edge = material(0x0d261f, 0.48, 0.01, 0.22);
  const lining = material(0x5a3524, 0.72, 0, 0.05);
  const gold = material(0xb08a3c, 0.2, 0.88, 0.42);
  const black = material(0x111111, 0.25, 0.3, 0.25);
  const ivory = material(0xf7f3ec, 0.8, 0, 0.02);

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.35, -1.7);
  bodyShape.quadraticCurveTo(-2.65, -1.65, -2.58, -1.35);
  bodyShape.lineTo(-2.28, 1.35);
  bodyShape.quadraticCurveTo(-2.24, 1.65, -1.92, 1.72);
  bodyShape.lineTo(1.92, 1.72);
  bodyShape.quadraticCurveTo(2.24, 1.65, 2.28, 1.35);
  bodyShape.lineTo(2.58, -1.35);
  bodyShape.quadraticCurveTo(2.65, -1.65, 2.35, -1.7);
  bodyShape.closePath();

  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyShape, { depth: 1.35, bevelEnabled: true, bevelSegments: 7, bevelSize: 0.14, bevelThickness: 0.11, curveSegments: 12 }),
    leather,
  );
  body.rotation.x = Math.PI / 2;
  body.position.set(0, -0.05, -0.72);
  root.add(body);

  const frontPocket = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 1.18, 0.12),
    edge,
  );
  frontPocket.position.set(0, -0.35, 0.02);
  frontPocket.scale.set(1, 1, 1);
  root.add(frontPocket);

  const pocketLine = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.018, 0.03), gold);
  pocketLine.position.set(0, 0.02, 0.11);
  root.add(pocketLine);

  const topBand = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.12, 1.5), edge);
  topBand.position.set(0, 1.58, -0.02);
  root.add(topBand);

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.65, 1.32, 0.2),
    new THREE.Vector3(-1.45, 3.15, 0.28),
    new THREE.Vector3(1.45, 3.15, 0.28),
    new THREE.Vector3(1.65, 1.32, 0.2),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 48, 0.15, 12, false), leather));

  const strap = new THREE.Group();
  const strapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.0, 1.05, 0.05),
    new THREE.Vector3(-2.65, 0.05, 0.3),
    new THREE.Vector3(-2.45, -1.4, 0.28),
    new THREE.Vector3(2.45, -1.4, 0.28),
    new THREE.Vector3(2.65, 0.05, 0.3),
    new THREE.Vector3(2.0, 1.05, 0.05),
  ]);
  strap.add(new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 70, 0.07, 9, false), edge));
  root.add(strap);

  [-1.7, 1.7].forEach((x) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 12, 30), gold);
    ring.position.set(x, 1.08, 0.32);
    ring.rotation.x = Math.PI / 2;
    root.add(ring);
  });

  const flap = new THREE.Group();
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-2.2, 0);
  flapShape.quadraticCurveTo(-1.7, -0.7, 0, -0.9);
  flapShape.quadraticCurveTo(1.7, -0.7, 2.2, 0);
  flapShape.lineTo(2.0, 0.78);
  flapShape.lineTo(-2.0, 0.78);
  flapShape.closePath();
  const flapMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(flapShape, { depth: 0.2, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.08, bevelThickness: 0.05, curveSegments: 10 }),
    leather,
  );
  flapMesh.rotation.x = Math.PI / 2;
  flapMesh.position.set(0, 1.0, 0.16);
  flap.add(flapMesh);
  flap.position.set(0, 0, 0.42);
  root.add(flap);

  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.1), gold);
  clasp.position.set(0, 0.68, 0.5);
  clasp.scale.set(1, 0.8, 1);
  root.add(clasp);

  const contents = new THREE.Group();
  const wallet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.8), lining);
  wallet.position.set(-0.75, 0.78, 0.35);
  wallet.rotation.z = -0.14;
  const phone = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 2.15), black);
  phone.position.set(0.7, 0.8, 0.42);
  phone.rotation.z = 0.14;
  const notebook = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.16, 2.15), ivory);
  notebook.position.set(0, 0.55, 0.1);
  notebook.rotation.z = -0.28;
  const keyring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 10, 24), gold);
  keyring.position.set(0.35, 1.05, 0.55);
  keyring.rotation.x = Math.PI / 2;
  contents.add(wallet, phone, notebook, keyring);
  contents.scale.setScalar(0.001);
  root.add(contents);

  return { root, flap, contents, strap };
}

export function ThreeBagStory() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.15, 0.1, 11.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const ambient = new THREE.HemisphereLight(0xdde8e2, 0x06120f, 2.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff4df, 5.2);
    key.position.set(4, 6, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8fb6a6, 2.0);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    const goldRim = new THREE.PointLight(0xb08a3c, 11, 15);
    goldRim.position.set(3, 2.5, 4);
    scene.add(goldRim);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(5.5, 64), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0.8, -2.55, -0.5);
    scene.add(ground);

    const bag = makeBag();
    bag.root.position.set(2.1, -0.12, 0);
    bag.root.rotation.set(0.04, -0.34, 0.02);
    bag.root.scale.setScalar(1.18);
    scene.add(bag.root);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    };
    resize();
    window.addEventListener("resize", resize);

    renderer.setAnimationLoop(() => {
      if (reduced) bag.root.rotation.y += 0.00035;
      renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(bag.root.position, { x: 4.3, y: -0.55 }, { x: 2.1, y: -0.12, duration: 1.5, ease: "power3.out" });
      gsap.fromTo(bag.root.rotation, { y: -0.9, x: 0.18 }, { y: -0.34, x: 0.04, duration: 1.5, ease: "power3.out" });

      if (!reduced) {
        const story = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: stage.querySelector(".bag-story-sticky"),
            anticipatePin: 1,
          },
        });

        story
          .to(".story-copy[data-step='1']", { opacity: 0, y: -24, duration: 0.24 }, 0.45)
          .to(bag.root.rotation, { y: 0.46, x: -0.06, duration: 0.9 }, 0.35)
          .to(bag.root.position, { x: 1.65, y: 0.02, duration: 0.9 }, 0.35)
          .fromTo(".story-copy[data-step='2']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 0.58)
          .to(bag.flap.rotation, { x: -1.2, duration: 0.75, ease: "power2.inOut" }, 0.85)
          .to(bag.contents.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.45)" }, 1.0)
          .to(".story-copy[data-step='2']", { opacity: 0, y: -24, duration: 0.24 }, 1.65)
          .fromTo(".story-copy[data-step='3']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 1.82)
          .to(bag.root.rotation, { y: -0.58, x: 0.04, duration: 0.85 }, 1.85)
          .to(bag.root.position, { x: 2.0, y: 0.02, duration: 0.85 }, 1.85)
          .to(".story-detail-line", { scaleX: 1, duration: 0.45 }, 2.08)
          .to(".story-copy[data-step='3']", { opacity: 0, y: -24, duration: 0.24 }, 2.5)
          .fromTo(".story-copy[data-step='4']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 2.68)
          .to(bag.flap.rotation, { x: 0, duration: 0.55 }, 2.75)
          .to(bag.contents.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.45 }, 2.75)
          .to(bag.root.rotation, { y: 0.12, x: 0, duration: 0.72 }, 3.05)
          .to(bag.root.position, { x: 2.3, y: -0.05, duration: 0.72 }, 3.05)
          .to(".story-copy[data-step='4']", { opacity: 0, y: -18, duration: 0.24 }, 3.55)
          .fromTo(".story-copy[data-step='5']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.32 }, 3.72);
      }
    }, stage);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", resize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return (
    <section ref={stageRef} className="bag-story" aria-label="Zorah interactive brand story">
      <div className="bag-story-sticky">
        <canvas ref={canvasRef} className="bag-story-canvas" aria-hidden="true" />
        <div className="story-glow" aria-hidden="true" />
        <div className="story-grid" aria-hidden="true" />

        <div className="story-copy story-copy--hero" data-step="1">
          <span className="story-index">ZORAH / 01</span>
          <h1>Crafted to be<br /><em>carried.</em></h1>
          <p>A contemporary leather house from Lagos. Designed around the way a bag is actually lived with.</p>
          <div className="story-cta-row"><a className="story-cta story-cta--solid" href="/shop">Enter the collection <span>↗</span></a><a className="story-text-link" href="#house">The Zorah house</a></div>
        </div>

        <div className="story-copy" data-step="2">
          <span className="story-index">ZORAH / 02</span>
          <h2>Open.<br /><em>Discover.</em></h2>
          <p>The inside is part of the design. Space for the things that move through your day, arranged without excess.</p>
        </div>

        <div className="story-copy" data-step="3">
          <span className="story-index">ZORAH / 03</span>
          <h2>Details that<br /><em>stay quiet.</em></h2>
          <p>Leather, hardware, proportions and construction come together as one object. Nothing needs to shout.</p>
          <span className="story-detail-line" />
        </div>

        <div className="story-copy" data-step="4">
          <span className="story-index">ZORAH / 04</span>
          <h2>Made in<br /><em>Lagos.</em></h2>
          <p>Rooted here. Designed for everywhere. A point of view shaped by the movement, pace and texture of Lagos.</p>
        </div>

        <div className="story-copy" data-step="5">
          <span className="story-index">ZORAH / 05</span>
          <h2>Now, make<br /><em>it yours.</em></h2>
          <p>The story becomes commerce only when you are ready. Enter the shop for the collection, availability and your next Zorah piece.</p>
          <div className="story-cta-row"><a className="story-cta story-cta--solid" href="/shop">Shop Zorah <span>→</span></a><a className="story-text-link" href="/login">Sign in / create account</a></div>
        </div>

        <div className="story-progress"><span>Scroll to explore</span><i /></div>
        <div className="story-location">Lagos · Nigeria</div>
      </div>
    </section>
  );
}
