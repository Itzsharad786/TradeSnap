import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';

interface HyperspeedBGProps {
    effectOptions?: any;
}

const HyperspeedBG: React.FC<HyperspeedBGProps> = ({ effectOptions }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0005); // Reduced fog for better visibility

        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
        camera.position.z = 0;
        camera.rotation.x = Math.PI / 2;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
        container.appendChild(renderer.domElement);

        // --- Warp Speed Effect ---
        // We use LineSegments to create streaks
        const starCount = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 6); // 2 points per star (start, end)
        const colors = new Float32Array(starCount * 6);
        const speeds = new Float32Array(starCount); // Store speed for each star

        const color1 = new THREE.Color(0x4ca1af); // Cyan/Teal
        const color2 = new THREE.Color(0xc4e0e5); // Light Blue/White

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;

            // Start point
            positions[i * 6] = x;
            positions[i * 6 + 1] = y;
            positions[i * 6 + 2] = z;

            // End point (initially same, will be stretched in animation)
            positions[i * 6 + 3] = x;
            positions[i * 6 + 4] = y;
            positions[i * 6 + 5] = z;

            // Color
            const color = Math.random() > 0.5 ? color1 : color2;
            colors[i * 6] = color.r;
            colors[i * 6 + 1] = color.g;
            colors[i * 6 + 2] = color.b;
            colors[i * 6 + 3] = color.r;
            colors[i * 6 + 4] = color.g;
            colors[i * 6 + 5] = color.b;

            speeds[i] = Math.random() * 2 + 1; // Random speed multiplier
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const stars = new THREE.LineSegments(geometry, material);
        scene.add(stars);

        // Post Processing
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomEffect = new BloomEffect({
            intensity: 1.2,
            luminanceThreshold: 0.1,
            luminanceSmoothing: 0.5,
            mipmapBlur: true // Better quality blur
        });
        const effectPass = new EffectPass(camera, bloomEffect);
        composer.addPass(effectPass);

        // Animation Loop
        let time = 0;
        const animate = () => {
            time += 0.01;

            const positions = geometry.attributes.position.array as Float32Array;

            // Move stars
            for (let i = 0; i < starCount; i++) {
                const i6 = i * 6;
                const speed = speeds[i] * 3; // Base speed

                // Update Z positions
                positions[i6 + 2] += speed;     // Start point Z
                positions[i6 + 5] += speed * 1.5; // End point Z (move faster to stretch)

                // Reset if passed camera
                if (positions[i6 + 2] > 400) {
                    const zStart = -600;
                    const x = (Math.random() - 0.5) * 1000;
                    const y = (Math.random() - 0.5) * 1000;

                    positions[i6] = x;
                    positions[i6 + 1] = y;
                    positions[i6 + 2] = zStart;

                    positions[i6 + 3] = x;
                    positions[i6 + 4] = y;
                    positions[i6 + 5] = zStart - (speed * 2); // Trail behind
                }
            }

            geometry.attributes.position.needsUpdate = true;

            // Rotate entire system slightly for dynamic feel
            stars.rotation.z = time * 0.05;

            composer.render();
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        // Resize
        const handleResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            composer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            container.removeChild(renderer.domElement);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full absolute inset-0" />;
};

export default HyperspeedBG;
