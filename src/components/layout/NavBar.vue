<template>
	<nav
		class="navbar navbar-expand-lg fixed-top"
		:class="{ 'navbar-dark bg-dark': isDarkMode, 'navbar-light bg-light': !isDarkMode }"
	>
		<div class="container">
			<router-link class="navbar-brand" to="/">
				<img
					src="@/assets/images/logo/LRH_Logo_Light.png"
					alt="LRH Logo"
					height="70"
					class="me-2"
					v-if="!isDarkMode"
				/>
				<img
					src="@/assets/images/logo/LRH_Logo_Dark.png"
					alt="LRH Logo"
					height="70"
					class="me-2"
					v-else
				/>
			</router-link>

			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNav"
			>
				<span class="navbar-toggler-icon"></span>
			</button>

			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav me-auto">
					<li class="nav-item">
						<router-link class="nav-link" to="/codebook">Codebook</router-link>
					</li>
					<li class="nav-item">
						<router-link class="nav-link" to="/research-portal"
							>Research Portal</router-link
						>
					</li>
				</ul>

				<ul class="navbar-nav">
					<li class="nav-item">
						<button class="btn nav-link" @click="toggleTheme">
							<i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
						</button>
					</li>
					<template v-if="isAuthenticated">
						<li class="nav-item">
							<router-link class="nav-link" to="/account">
								<i class="fas fa-user me-1"></i>Account
							</router-link>
						</li>
						<li class="nav-item">
							<button class="btn nav-link" @click="handleLogout">
								<i class="fas fa-sign-out-alt me-1"></i>Logout
							</button>
						</li>
					</template>
					<template v-else>
						<li class="nav-item">
							<router-link class="nav-link" to="/auth/login">Login</router-link>
						</li>
						<li class="nav-item">
							<router-link class="btn btn-primary ms-2" to="/auth/register"
								>Register</router-link
							>
						</li>
					</template>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

export default {
	name: 'NavBar',
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
		...mapState(useAuthStore, ['isAuthenticated']),
	},
	methods: {
		...mapActions(useThemeStore, ['toggleDarkMode']),
		...mapActions(useAuthStore, ['logout']),
		toggleTheme() {
			this.toggleDarkMode()
		},
		async handleLogout() {
			await this.logout()
			this.$router.push('/auth/login')
		},
	},
}
</script>

<style lang="scss" scoped>
.navbar {
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	padding: 0;
	height: 96px;
	max-width: 100vw;

	&.navbar-light {
		background-color: rgba(255, 255, 255, 0.9) !important;
	}

	&.navbar-dark {
		background-color: rgba(33, 37, 41, 0.9) !important;
	}
}

.nav-link {
	transition: color 0.3s ease;
}
</style>
