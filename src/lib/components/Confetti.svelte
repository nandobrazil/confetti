<script lang="ts">
	/** Full-screen canvas confetti burst, fired once on mount. */
	let canvas: HTMLCanvasElement;

	const COLORS = ['#8b5cf6', '#d946ef', '#fbbf24', '#34d399', '#fb7185', '#f4f1ea'];

	type Particle = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		rotation: number;
		spin: number;
		shape: 'rect' | 'circle';
	};

	$effect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio, 2);
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;
		ctx.scale(dpr, dpr);

		const particles: Particle[] = Array.from({ length: 160 }, () => {
			const fromLeft = Math.random() < 0.5;
			return {
				x: fromLeft ? -10 : window.innerWidth + 10,
				y: window.innerHeight * (0.35 + Math.random() * 0.3),
				vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 8),
				vy: -(7 + Math.random() * 8),
				size: 5 + Math.random() * 7,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				rotation: Math.random() * Math.PI * 2,
				spin: (Math.random() - 0.5) * 0.3,
				shape: Math.random() < 0.6 ? 'rect' : 'circle'
			};
		});

		let frame = 0;
		let raf = 0;

		function tick() {
			if (!ctx) return;
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				p.vy += 0.22;
				p.vx *= 0.99;
				p.rotation += p.spin;

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				ctx.fillStyle = p.color;
				ctx.globalAlpha = Math.max(0, 1 - frame / 220);
				if (p.shape === 'rect') {
					ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
				} else {
					ctx.beginPath();
					ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.restore();
			}
			frame++;
			if (frame < 220) raf = requestAnimationFrame(tick);
			else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		}

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<canvas
	bind:this={canvas}
	class="pointer-events-none fixed inset-0 z-40 h-full w-full"
	aria-hidden="true"
></canvas>
