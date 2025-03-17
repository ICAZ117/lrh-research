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
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.dark-mode {
	background-color: #1a1a1a;
	color: #ffffff;
	// Add more dark mode styles as needed
}
</style>