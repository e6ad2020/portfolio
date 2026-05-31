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

		// Bouncing shapes that move across the grid
		interface BouncingShape {
			type: "circle" | "triangle" | "diamond" | "square" | "hexagon";
			gridX: number;     // position in 3D grid X
			gridZ: number;     // position in 3D grid Z
			speedX: number;    // movement speed X
			speedZ: number;    // movement speed Z
			bouncePhase: number; // phase offset for bounce animation
			bounceSpeed: number; // speed of bounce
			bounceHeight: number; // max bounce height
			size: number;       // shape size in 3D space
			color: [number, number, number]; // RGB
		}

		const shapes: BouncingShape[] = [
			{ type: "circle",   gridX: -200, gridZ: 300,  speedX: 18, speedZ: 12,  bouncePhase: 0,    bounceSpeed: 2.8, bounceHeight: 120, size: 22, color: [255, 100, 130] },
			{ type: "triangle", gridX: 150,  gridZ: 500,  speedX: -14, speedZ: 10,  bouncePhase: 1.2,  bounceSpeed: 3.2, bounceHeight: 100, size: 20, color: [100, 220, 255] },
			{ type: "diamond",  gridX: 0,    gridZ: 200,  speedX: 22, speedZ: -8,  bouncePhase: 2.5,  bounceSpeed: 2.5, bounceHeight: 140, size: 18, color: [255, 200, 60] },
			{ type: "square",   gridX: -300, gridZ: 600,  speedX: 10, speedZ: 15,  bouncePhase: 0.8,  bounceSpeed: 3.5, bounceHeight: 90,  size: 16, color: [130, 255, 170] },
			{ type: "hexagon",  gridX: 250,  gridZ: 400,  speedX: -16, speedZ: -12, bouncePhase: 3.8,  bounceSpeed: 2.2, bounceHeight: 110, size: 19, color: [200, 130, 255] },
		];

		// Grid extent boundaries for bounce wrapping
		const gridExtentX = (gridCols / 2) * spacing;
		const gridExtentZMin = -2 * spacing;
		const gridExtentZMax = (gridRows - 2) * spacing;

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

			// --- Draw bouncing shapes on the grid ---
			for (const shape of shapes) {
				// Update position - move across the grid
				shape.gridX += shape.speedX * 0.008;
				shape.gridZ += shape.speedZ * 0.008;

				// Wrap around grid boundaries
				if (shape.gridX > gridExtentX) { shape.gridX = -gridExtentX; }
				if (shape.gridX < -gridExtentX) { shape.gridX = gridExtentX; }
				if (shape.gridZ > gridExtentZMax) { shape.gridZ = gridExtentZMin; }
				if (shape.gridZ < gridExtentZMin) { shape.gridZ = gridExtentZMax; }

				// Compute bounce height using abs(sin) for a trampoline feel
				const bounceT = time * shape.bounceSpeed + shape.bouncePhase;
				const rawBounce = Math.abs(Math.sin(bounceT));
				// Ease it for a more natural squash-bounce feel
				const bounceY = Math.pow(rawBounce, 0.6) * shape.bounceHeight;

				// Grid surface Y (with wave)
				const surfaceDist = Math.sqrt(shape.gridX * shape.gridX + shape.gridZ * shape.gridZ);
				const surfaceY = yOffset + Math.sin(surfaceDist * 0.005 - time * 1.5) * 22;

				// Shape 3D position: on grid X/Z, bouncing above Y
				const shapeY = surfaceY - bounceY;

				// Project shape position
				const shapeProj = project(shape.gridX, shapeY, shape.gridZ);
				if (!shapeProj) continue;

				// Project shadow position (on the grid surface)
				const shadowProj = project(shape.gridX, surfaceY, shape.gridZ);

				const depthOpacity = Math.max(0, Math.min(1, 350 / shapeProj.depth));
				if (depthOpacity < 0.05) continue;

				const screenScale = fov / shapeProj.depth;
				const drawSize = shape.size * screenScale;
				const [r, g, b] = shape.color;

				// Draw shadow on grid surface
				if (shadowProj) {
					const shadowOpacity = depthOpacity * 0.2 * (1 - bounceY / shape.bounceHeight);
					const shadowSize = drawSize * (0.6 + 0.4 * (bounceY / shape.bounceHeight));
					ctx.beginPath();
					ctx.ellipse(shadowProj.sx, shadowProj.sy, shadowSize, shadowSize * 0.35, 0, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
					ctx.fill();
				}

				// Draw glow behind shape
				const glowRadius = drawSize * 2.5;
				const glowGrad = ctx.createRadialGradient(shapeProj.sx, shapeProj.sy, 0, shapeProj.sx, shapeProj.sy, glowRadius);
				glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${depthOpacity * 0.15})`);
				glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
				ctx.beginPath();
				ctx.arc(shapeProj.sx, shapeProj.sy, glowRadius, 0, Math.PI * 2);
				ctx.fillStyle = glowGrad;
				ctx.fill();

				// Squash effect when near the ground
				const squash = bounceY < 15 ? 0.7 + 0.3 * (bounceY / 15) : 1;
				const stretchX = 1 / squash;
				const stretchY = squash;

				// Draw the shape itself
				ctx.save();
				ctx.translate(shapeProj.sx, shapeProj.sy);
				ctx.scale(stretchX, stretchY);

				ctx.beginPath();
				if (shape.type === "circle") {
					ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
				} else if (shape.type === "triangle") {
					ctx.moveTo(0, -drawSize);
					ctx.lineTo(-drawSize * 0.87, drawSize * 0.5);
					ctx.lineTo(drawSize * 0.87, drawSize * 0.5);
					ctx.closePath();
				} else if (shape.type === "diamond") {
					ctx.moveTo(0, -drawSize);
					ctx.lineTo(drawSize * 0.7, 0);
					ctx.lineTo(0, drawSize);
					ctx.lineTo(-drawSize * 0.7, 0);
					ctx.closePath();
				} else if (shape.type === "square") {
					const half = drawSize * 0.75;
					ctx.rect(-half, -half, half * 2, half * 2);
				} else if (shape.type === "hexagon") {
					for (let i = 0; i < 6; i++) {
						const angle = (Math.PI / 3) * i - Math.PI / 6;
						const hx = Math.cos(angle) * drawSize;
						const hy = Math.sin(angle) * drawSize;
						if (i === 0) ctx.moveTo(hx, hy);
						else ctx.lineTo(hx, hy);
					}
					ctx.closePath();
				}

				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${depthOpacity * 0.35})`;
				ctx.fill();
				ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${depthOpacity * 0.8})`;
				ctx.lineWidth = 1.5;
				ctx.stroke();

				ctx.restore();
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
