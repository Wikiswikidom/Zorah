"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type BagParts = { root: THREE.Group; flap: THREE.Group; contents: THREE.Group };

function makeBag(): BagParts {
  const root = new THREE.Group();
  const leather = new THREE.MeshPhysicalMaterial({ color: 0x173d32, roughness: 0.42, clearcoat: 0.28, clearcoatRoughness: 0.3 });
  const darkLeather = new THREE.MeshPhysicalMaterial({ color: 0x0e2b24, roughness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb08a3c, metalness: 0.82, roughness: 0.22 });

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.55, -1.75);
  bodyShape.quadraticCurveTo(-2.7, -1.75, -2.72, -1.52);
  bodyShape.lineTo(-2.42, 1.55);
  bodyShape.quadraticCurveTo(-2.38, 1.78, -2.1, 1.83);
  bodyShape.lineTo(2.1, 1.83);
  bodyShape.quadraticCurveTo(2.38, 1.78, 2.42, 1.55);
  bodyShape.lineTo(2.72, -1.52);
  bodyShape.quadraticCurveTo(2.7, -1.75, 2.55, -1.75);
  bodyShape.closePath();

  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(bodyShape, { depth: 1.05, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.12, bevelThickness: 0.1, curveSegments: 8 }), leather);
  body.rotation.x = Math.PI / 2;
  body.position.z = -0.52;
  root.add(body);

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.75, 1.25, 0.25), new THREE.Vector3(-1.5, 3.15, 0.3),
    new THREE.Vector3(1.5, 3.15, 0.3), new THREE.Vector3(1.75, 1.25, 0.25),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 32, 0.13, 10, false), leather));

  [-1.72, 1.72].forEach((x) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 10, 28), gold);
    ring.position.set(x, 1.08, 0.3);
    ring.rotation.x = Math.PI / 2;
    root.add(ring);
  });

  const flap = new THREE.Group();
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-2.35, 0);
  flapShape.quadraticCurveTo(-2.25, -0.85, 0, -1.05);
  flapShape.quadraticCurveTo(2.25, -0.85, 2.35, 0);
  flapShape.lineTo(2.15, 0.72);
  flapShape.lineTo(-2.15, 0.72);
  flapShape.closePath();
  const flapMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(flapShape, { depth: 0.18, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.07, bevelThickness: 0.04 }), darkLeather);
  flapMesh.rotation.x = Math.PI / 2;
  flapMesh.position.set(0, 1.1, -0.1);
  flap.add(flapMesh);
  flap.position.set(0, 0, 0.35);
  root.add(flap);

  const contents = new THREE.Group();
  const wallet = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 1.8), new THREE.MeshStandardMaterial({ color: 0xb08a3c, roughness: 0.45 }));
  wallet.position.set(-0.8, 0.9, 0.1);
  wallet.rotation.z = -0.12;
  const phone = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 2.15), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.25 }));
  phone.position.set(0.55, 0.78, 0.08);
  phone.rotation.z = 0.16;
  const notebook = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 2.2), new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.8 }));
  notebook.position.set(0.05, 0.55, -0.05);
  notebook.rotation.z = -0.28;
  contents.add(wallet, phone, notebook);
  contents.scale.setScalar(0.001);
  root.add(contents);
  return { root, flap, contents };
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
    scene.background = new THREE.Color(0x102d26);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.15, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene.add(new THREE.HemisphereLight(0xdfe9e1, 0x081713, 2.2));
    const key = new THREE.DirectionalLight(0xfff2d6, 5.5);
    key.position.set(4, 6, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0xb08a3c, 16, 16);
    rim.position.set(-5, 2, 5);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(5.6, 64), new THREE.MeshStandardMaterial({ color: 0x0c251f, roughness: 0.88 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -2.35, -0.9);
    scene.add(floor);

    const bag = makeBag();
    bag.root.position.set(1.45, -0.15, 0);
    bag.root.rotation.set(0.02, -0.25, 0.02);
    bag.root.scale.setScalar(1.12);
    scene.add(bag.root);

    const particles = new THREE.Group();
    for (let i = 0; i < 34; i += 1) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(i % 3 === 0 ? 0.025 : 0.012, 8, 8), new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0xb08a3c : 0xc6d5cd, transparent: true, opacity: 0.42 }));
      p.position.set((Math.random() - 0.5) * 9, (Math.random() - 0.2) * 6, (Math.random() - 0.5) * 3);
      particles.add(p);
    }
    scene.add(particles);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    };
    resize();
    window.addEventListener("resize", resize);

    renderer.setAnimationLoop(() => {
      bag.root.rotation.y += 0.0008;
      particles.rotation.y += 0.00012;
      renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(bag.root.position, { x: 3.2, y: -0.4 }, { x: 1.45, y: -0.15, duration: 1.4 })
        .fromTo(bag.root.rotation, { y: -0.9, x: 0.16 }, { y: -0.25, x: 0.02, duration: 1.4 }, "<");

      if (!reduced) {
        const story = gsap.timeline({
          scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: 1.05, pin: stage.querySelector(".bag-story-sticky"), anticipatePin: 1 },
        });
        story.to(bag.root.rotation, { y: 0.62, x: -0.08, z: 0.03, duration: 1.1 })
          .to(bag.root.position, { x: 0.95, y: -0.05, duration: 1.1 }, "<")
          .to(".bag-story-copy[data-step='1']", { opacity: 0, y: -28, duration: 0.25 }, "<0.5")
          .fromTo(".bag-story-copy[data-step='2']", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.35 }, "<0.15")
          .to(bag.flap.rotation, { x: -1.18, duration: 0.9, ease: "power2.inOut" })
          .to(bag.contents.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.5)" }, "<0.2")
          .to(".bag-story-copy[data-step='2']", { opacity: 0, y: -28, duration: 0.25 }, "<0.55")
          .fromTo(".bag-story-copy[data-step='3']", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.35 }, "<0.15")
          .to(bag.root.rotation, { y: -0.58, x: 0.05, duration: 1.05 })
          .to(bag.root.position, { x: 1.7, y: 0.05, duration: 1.05 }, "<")
          .to(".bag-story-copy[data-step='3']", { opacity: 0, y: -28, duration: 0.25 }, "<0.55")
          .fromTo(".bag-story-copy[data-step='4']", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.35 }, "<0.15")
          .to(bag.flap.rotation, { x: 0, duration: 0.75 })
          .to(bag.contents.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.55 }, "<")
          .to(bag.root.rotation, { y: 0.18, x: 0, duration: 0.8 });
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
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return (
    <section ref={stageRef} className="bag-story" aria-label="Zorah product story">
      <div className="bag-story-sticky">
        <canvas ref={canvasRef} className="bag-story-canvas" aria-hidden="true" />
        <div className="bag-story-noise" aria-hidden="true" />
        <div className="bag-story-copy bag-story-copy--one" data-step="1">
          <span className="landing-kicker">01 · The silhouette</span>
          <h2>A bag begins<br />with its shape.</h2>
          <p>Balanced proportions. Soft structure. A silhouette designed to look at home in the city and still feel personal.</p>
        </div>
        <div className="bag-story-copy" data-step="2">
          <span className="landing-kicker">02 · The interior</span>
          <h2>Open it.<br />See the thought.</h2>
          <p>Space for the objects that follow you: phone, wallet, notebook and the small things that make a day yours.</p>
        </div>
        <div className="bag-story-copy" data-step="3">
          <span className="landing-kicker">03 · The detail</span>
          <h2>Quiet details.<br />Close attention.</h2>
          <p>Leather, hardware and construction are treated as part of one object—not decoration added after the fact.</p>
        </div>
        <div className="bag-story-copy" data-step="4">
          <span className="landing-kicker">04 · Made in Lagos</span>
          <h2>Made to move<br />with you.</h2>
          <p>Zorah is a Lagos house making contemporary leather pieces for real movement, real days and a longer life.</p>
        </div>
        <div className="bag-story-scroll"><span />Scroll to explore</div>
      </div>
    </section>
  );
}
