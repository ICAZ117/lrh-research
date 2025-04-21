<template>
	<div
		class="cursor-effect-container"
		:class="{ darkCursor: isDarkMode, lightCursor: !isDarkMode }"
		ref="container"
		@mousemove="handleMouseMove"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
	>
		<!-- Background layer -->
		<div
			class="cursor-background"
			:class="{ 'bg-light': !isDarkMode, 'bg-dark': isDarkMode }"
		></div>

		<!-- Cursor effect layer -->
		<div
			v-if="showCursorEffect"
			class="cursor-effect"
			:style="{ left: cursorX + 'px', top: cursorY + 'px', ...effectStyles }"
		></div>

		<!-- Content layer -->
		<div class="cursor-content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'CursorEffect',
	props: {
		// Allow customization of effect colors and sizes
		size: {
			type: Number,
			default: 150,
		},
		color: {
			type: String,
			default: null, // Will use CSS variables by default
		},
		blur: {
			type: Number,
			default: 10,
		},
		// Dark mode can be passed from parent or from store
		isDarkMode: {
			type: Boolean,
			default: false,
			required: true,
		},
	},
	data() {
		return {
			showCursorEffect: false,
			cursorX: 0,
			cursorY: 0,
		};
	},
	computed: {
		effectStyles() {
			const styles = {
				width: `${this.size}px`,
				height: `${this.size}px`,
				filter: `blur(${this.blur}px)`,
			};

			if (this.color) {
				styles.background = this.createGradient(this.color);
			}

			return styles;
		},
	},
	methods: {
		handleMouseMove(event) {
			const container = this.$refs.container;
			const rect = container.getBoundingClientRect();

			// Calculate cursor position relative to the container
			this.cursorX = event.clientX - rect.left;
			this.cursorY = event.clientY - rect.top;
		},
		handleMouseEnter() {
			this.showCursorEffect = true;
		},
		handleMouseLeave() {
			this.showCursorEffect = false;
		},
		createGradient(baseColor) {
			// Custom gradient if color prop provided
			return `radial-gradient(circle, ${baseColor} 0%, ${baseColor}99 50%, ${baseColor}33 70%, transparent 100%)`;
		},
	},
};
</script>

<style lang="scss" scoped>
.cursor-effect-container {
	position: relative;
	overflow: hidden;
	// Make sure container has proper stacking context
	isolation: isolate;
}

// Base layer - background
.cursor-background {
	position: absolute;
	inset: 0;
	z-index: 1;
	border-radius: inherit;
}

.bg-light {
	background-color: rgba(var(--bs-light-rgb), var(--bs-bg-opacity)) !important;
}

.bg-dark {
	background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important;
}

// Middle layer - cursor effect
.cursor-effect {
	position: absolute;
	border-radius: 50%;
	pointer-events: none;
	transform: translate(-50%, -50%);
	z-index: 2;
	transition: width 0.3s, height 0.3s;
}

.darkCursor .cursor-effect {
	background: radial-gradient(
		circle,
		var(--LRH-primary) 0%,
		rgba(var(--LRH-primary-rgb), 0.6) 50%,
		rgba(var(--LRH-primary-rgb), 0.2) 70%,
		transparent 100%
	);
	mix-blend-mode: color;
}

.lightCursor .cursor-effect {
	background: radial-gradient(
		circle,
		rgba(var(--LRH-primary-rgb), 0.8) 0%,
		rgba(var(--LRH-primary-rgb), 0.5) 5%,
		transparent 100%
	);
}

// Top layer - content
.cursor-content {
	position: relative;
	z-index: 3;
}
</style>
