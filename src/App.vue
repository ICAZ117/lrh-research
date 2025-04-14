<template>
	<div :class="{ 'dark-mode': isDarkMode }">
		<nav-bar />
		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view>
		<app-footer />
	</div>
</template>

<script>
import { mapState } from 'pinia'
import { useThemeStore } from './stores/theme'
import NavBar from './components/layout/NavBar.vue'
import AppFooter from './components/layout/AppFooter.vue'

export default {
	name: 'App',
	components: {
		NavBar,
		AppFooter,
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
	},
}
</script>

<style lang="scss">
:root {
	// LRH Variables
	--LRH-primary: #0076a8;
	--LRH-primary-rgb: 0, 118, 168;
	--LRH-primary-hover: hsl(198, 100%, 29%);
	--LRH-disabled: #9e9e9e;
	--LRH-font-family: 'Fira Sans', sans-serif !important;

	// Bootstrap overrides
	--bs-primary: var(--LRH-primary);
	--bs-primary-rgb: var(--LRH-primary-rgb);
	--bs-body-font-family: var(--LRH-font-family);

	// Page Variables
	--navbar-height: 96px;
	--light-1: white;
	--light-2: var(--bs-light); // #f8f9fa
	--light-accent: #e9ecef;
	--dark-1: #272b30;
	--dark-2: var(--bs-dark); // #212529
	--dark-3: #1a1a1a;
	--dark-accent: #495057;

	// Global settings
	font-family: var(--LRH-font-family);
}

.btn-primary {
	--bs-btn-color: #fff;
	--bs-btn-bg: var(--LRH-primary);
	--bs-btn-border-color: var(--LRH-primary);
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-bg: var(--LRH-primary-hover);
	--bs-btn-hover-border-color: var(--LRH-primary-hover);
	--bs-btn-focus-shadow-rgb: 49, 132, 253;
	--bs-btn-active-color: #fff;
	--bs-btn-active-bg: var(--LRH-primary-hover);
	--bs-btn-active-border-color: var(--LRH-primary-hover);
	--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
	--bs-btn-disabled-color: #fff;
	--bs-btn-disabled-bg: var(--LRH-disabled);
	--bs-btn-disabled-border-color: var(--LRH-disabled);
}

.btn-outline-white {
	--bs-btn-color: #fff;
	--bs-btn-border-color: #fff;
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-bg: var(--LRH-primary-hover);
	--bs-btn-hover-border-color: var(--LRH-primary-hover);
	--bs-btn-focus-shadow-rgb: 13, 110, 253;
	--bs-btn-active-color: #fff;
	--bs-btn-active-bg: var(--LRH-primary);
	--bs-btn-active-border-color: var(--LRH-primary);
	--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
	--bs-btn-disabled-color: var(--LRH-disabled);
	--bs-btn-disabled-bg: transparent;
	--bs-btn-disabled-border-color: var(--LRH-disabled);
	--bs-gradient: none;
}

.btn-outline-primary {
	--bs-btn-color: var(--LRH-primary);
	--bs-btn-border-color: var(--LRH-primary);
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-bg: var(--LRH-primary-hover);
	--bs-btn-hover-border-color: var(--LRH-primary-hover);
	--bs-btn-focus-shadow-rgb: 13, 110, 253;
	--bs-btn-active-color: #fff;
	--bs-btn-active-bg: var(--LRH-primary-hover);
	--bs-btn-active-border-color: var(--LRH-primary-hover);
	--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
	--bs-btn-disabled-color: var(--LRH-disabled);
	--bs-btn-disabled-bg: transparent;
	--bs-btn-disabled-border-color: var(--LRH-disabled);
	--bs-gradient: none;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.dark-mode {
	background-color: var(--dark-3);
	color: #ffffff;
}
</style>
