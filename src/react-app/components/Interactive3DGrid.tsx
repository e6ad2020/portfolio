import React, { useEffect, useRef } from "react";

export const Interactive3DGrid: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationId: number;
		let dpr = window.devicePixelRatio || 1;
		let width = window.innerWidth;
		let height = window.innerHeight;

		// Initialize canvas size with device pixel ratio scaling
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.scale(dpr, dpr);

		// Handle resize
		const handleResize = () => {
			if (!canvas || !ctx) return;
			dpr = window.devicePixelRatio || 1;
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.scale(dpr, dpr);
		};
		window.addEventListener("resize", handleResize);

		// Track mouse movement
		const handleMouseMove = (e: MouseEvent) => {
			mouseRef.current.targetX = e.clientX;
			mouseRef.current.targetY = e.clientY;
			mouseRef.current.isHovered = true;
		};

		const handleMouseLeave = () => {
			mouseRef.current.isHovered = false;
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseleave", handleMouseLeave);

		// Grid properties
		const gridRows = 30;   // Number of depth divisions
		const gridCols = 30;   // Number of width divisions
		const spacing = 55;    // 3D space spacing between points
		const fov = 350;       // Field of view focal length
		const yOffset = 230;   // Height position of the grid relative to camera center
		
		let time = 0;

		// Animation loop
		const animate = () => {
			time += 0.008;

			// Clear canvas
			ctx.clearRect(0, 0, width, height);

			// Smooth mouse coordinates interpolation
			const ease = 0.06;
			mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * ease;
			mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * ease;

			// Screen coordinates center
			const cx = width / 2;
			const cy = height / 2;

			// Normalized mouse positions
			const mxNorm = mouseRef.current.isHovered 
				? (mouseRef.current.x - cx) / cx 
				: Math.sin(time * 0.5) * 0.25;
			const myNorm = mouseRef.current.isHovered 
				? (mouseRef.current.y - cy) / cy 
				: Math.cos(time * 0.5) * 0.12;

			// Yaw (rotation around Y-axis) and Pitch (rotation around X-axis)
			const yaw = mxNorm * 0.1;
			const pitch = 0.48 + myNorm * 0.15;

			// Project 3D point (px, py, pz) to 2D screen coordinates
			const project = (px: number, py: number, pz: number) => {
				// Rotate Y-axis (Yaw)
				const cosY = Math.cos(yaw);
				const sinY = Math.sin(yaw);
				const rotX = px * cosY - pz * sinY;
				const rotZ = px * sinY + pz * cosY;

				// Rotate X-axis (Pitch)
				const cosP = Math.cos(pitch);
				const sinP = Math.sin(pitch);
				const rotY = py * cosP - rotZ * sinP;
				const finalZ = py * sinP + rotZ * cosP;

				// Distance scaling offset
				const camDistance = 320;
				const viewZ = finalZ + camDistance;

				if (viewZ <= 20) return null; // Clipping behind screen

				const scale = fov / viewZ;
				const sx = cx + rotX * scale;
				const sy = cy + rotY * scale;

				return { sx, sy, depth: viewZ };
			};

			// Build grid intersections
			const points: ({ sx: number; sy: number; depth: number } | null)[][] = [];

			for (let r = 0; r < gridRows; r++) {
				points[r] = [];
				for (let c = 0; c < gridCols; c++) {
					// 3D Grid coords: centered in X, stretching in Z (depth)
					const px = (c - gridCols / 2) * spacing;
					const pz = (r - 2) * spacing; // Shift forward to bring it close to camera

					let py = yOffset;

					// 1. Roll constant background wave (sinusoidal offset based on depth & time)
					const distCenter = Math.sqrt(px * px + pz * pz);
					py += Math.sin(distCenter * 0.005 - time * 1.5) * 22;

					// 2. Mouse distance deformation
					// Approximate screen coordinate of base point to compute screen-space interaction
					const approx = project(px, py, pz);
					if (approx) {
						const dx = approx.sx - mouseRef.current.x;
						const dy = approx.sy - mouseRef.current.y;
						const screenDist = Math.sqrt(dx * dx + dy * dy);
						const threshold = 250; // mouse interaction radius in pixels

						if (screenDist < threshold) {
							const intensity = 1 - screenDist / threshold;
							// Elevate/distort points in 3D based on screen-space mouse proximity
							py -= Math.pow(intensity, 1.6) * 80;
						}
					}

					points[r][c] = project(px, py, pz);
				}
			}

			// Draw grid lines
			ctx.lineWidth = 1.3;

			// Draw depth lines (columns: Z-direction)
			for (let c = 0; c < gridCols; c++) {
				ctx.beginPath();
				let hasLine = false;

				for (let r = 0; r < gridRows; r++) {
					const pt = points[r][c];
					if (pt) {
						if (!hasLine) {
							ctx.moveTo(pt.sx, pt.sy);
							hasLine = true;
						} else {
							ctx.lineTo(pt.sx, pt.sy);
						}
					} else {
						hasLine = false;
					}
				}

				// Apply depth fog: fade lines that are far away
				const midPt = points[Math.floor(gridRows / 2)][c];
				const d = midPt ? midPt.depth : 400;
				const opacity = Math.max(0, Math.min(0.55, 300 / d));
				ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`; // Vibrant Teal lines (#14b8a6)
				ctx.stroke();
			}

			// Draw horizontal lines (rows: X-direction)
			for (let r = 0; r < gridRows; r++) {
				ctx.beginPath();
				let hasLine = false;

				for (let c = 0; c < gridCols; c++) {
					const pt = points[r][c];
					if (pt) {
						if (!hasLine) {
							ctx.moveTo(pt.sx, pt.sy);
							hasLine = true;
						} else {
							ctx.lineTo(pt.sx, pt.sy);
						}
					} else {
						hasLine = false;
					}
				}

				// Apply depth fog
				const midPt = points[r][Math.floor(gridCols / 2)];
				const d = midPt ? midPt.depth : 400;
				const opacity = Math.max(0, Math.min(0.45, 270 / d));
				ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`; // Vibrant Sky Blue lines (#38bdf8)
				ctx.stroke();
			}

			// Draw subtle glowing nodes at intersections
			for (let r = 0; r < gridRows; r += 2) {
				for (let c = 0; c < gridCols; c += 2) {
					const pt = points[r][c];
					if (pt) {
						const opacity = Math.max(0, Math.min(0.75, 220 / pt.depth));
						if (opacity > 0.05) {
							ctx.beginPath();
							ctx.arc(pt.sx, pt.sy, 1.8, 0, Math.PI * 2);
							ctx.fillStyle = `rgba(20, 184, 166, ${opacity})`; // Vibrant Teal (#14b8a6)
							ctx.fill();
						}
					}
				}
			}

			animationId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseleave", handleMouseLeave);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return <canvas ref={canvasRef} className="interactive-3d-grid-canvas" />;
};
