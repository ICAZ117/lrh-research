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
				aria-controls="navbarNav"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon"></span>
			</button>

			<div
				class="collapse navbar-collapse"
				id="navbarNav"
				:class="{ 'dark-mobile-bg': isDarkMode, 'light-mobile-bg': !isDarkMode }"
			>
				<ul class="navbar-nav me-auto" style="padding-left: 16px">
					<li class="nav-item py-1">
						<router-link class="nav-link" to="/codebook">Codebook</router-link>
					</li>
					<li class="nav-item py-1">
						<router-link class="nav-link" to="/research-portal"
							>Research Portal</router-link
						>
					</li>
				</ul>

				<ul class="navbar-nav d-none d-lg-flex">
					<li class="nav-item" style="display: flex; align-items: center">
						<button class="btn nav-link" @click="toggleTheme">
							<i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
						</button>
					</li>
					<template v-if="isAuthenticated">
						<!-- Desktop View -->
						<li
							class="nav-item user-dropdown-container"
							@mouseenter="showDesktopDropdown"
							@mouseleave="startHideDropdownTimer"
						>
							<!-- Added welcome message -->
							<div class="welcome-message d-none d-lg-block">
								<div class="welcome-greeting">Welcome,</div>
								<div class="user-name">{{ userData?.firstName }}</div>
							</div>
							<div class="avatar-circle">
								{{ userInitials }}
							</div>
							<div
								class="custom-dropdown-menu"
								:class="{
									'dark-mode': isDarkMode,
									show: desktopDropdownOpen,
									'animate-in': desktopDropdownOpen,
								}"
								@mouseenter="clearHideDropdownTimer"
								@mouseleave="hideDesktopDropdown"
							>
								<router-link class="dropdown-item" to="/account">
									<i class="fas fa-user me-2"></i>Account
								</router-link>
								<template v-if="isStaff">
									<router-link class="dropdown-item" to="/auth/register-staff">
										<i class="fas fa-user-plus me-2"></i>Register Staff
									</router-link>
								</template>
								<template v-if="isDev">
									<router-link class="dropdown-item" to="/dev/DBManager">
										<i class="fa-solid fa-database me-2"></i>DB Manager
									</router-link>
								</template>
								<div class="dropdown-divider"></div>
								<button class="dropdown-item" @click="handleLogout">
									<i class="fas fa-sign-out-alt me-2"></i>Logout
								</button>
							</div>
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

				<!-- Mobile View -->
				<div class="d-lg-none mobile-nav-content">
					<template v-if="isAuthenticated">
						<div class="mobile-user-section">
							<div class="mobile-user-header" @click="toggleMobileUserMenu">
								<div class="avatar-circle me-2">
									{{ userInitials }}
								</div>
								<span>{{ userData?.firstName }} {{ userData?.lastName }}</span>
								<i
									class="fas"
									:class="
										mobileUserMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'
									"
								></i>
							</div>
							<div class="mobile-user-menu" :class="{ active: mobileUserMenuOpen }">
								<router-link class="mobile-menu-item" to="/account">
									<i class="fas fa-user me-2"></i>Account
								</router-link>
								<template v-if="isStaff">
									<router-link class="mobile-menu-item" to="/auth/register-staff">
										<i class="fas fa-user-plus me-2"></i>Register Staff
									</router-link>
								</template>
								<template v-if="isDev">
									<router-link class="dropdown-item" to="/dev/DBManager">
										<i class="fa-solid fa-database me-2"></i>DB Manager
									</router-link>
								</template>
								<button class="mobile-menu-item logout" @click="handleLogout">
									<i class="fas fa-sign-out-alt me-2"></i>Logout
								</button>
							</div>
						</div>
					</template>
					<template v-else>
						<div class="mobile-auth-buttons">
							<router-link class="btn btn-outline-primary w-100 mb-2" to="/auth/login"
								>Login</router-link
							>
							<router-link class="btn btn-primary w-100" to="/auth/register"
								>Register</router-link
							>
						</div>
					</template>

					<div class="mobile-theme-toggle">
						<button class="btn theme-toggle-btn" @click="toggleTheme">
							<i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
							<span>{{
								isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
							}}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

export default {
	name: 'NavBar',
	data() {
		return {
			mobileUserMenuOpen: false,
			desktopDropdownOpen: false,
			dropdownTimer: null,
		};
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
		...mapState(useAuthStore, [
			'isAuthenticated',
			'isStaff',
			'userInitials',
			'avatarColor',
			'userData',
			'isDev',
		]),
	},
	methods: {
		...mapActions(useThemeStore, ['toggleDarkMode']),
		...mapActions(useAuthStore, ['logout']),
		toggleTheme() {
			this.toggleDarkMode();
		},
		async handleLogout() {
			await this.logout();
			this.$router.push('/auth/login');
		},
		toggleMobileUserMenu() {
			this.mobileUserMenuOpen = !this.mobileUserMenuOpen;
		},
		// Improved dropdown handling with timers
		showDesktopDropdown() {
			this.clearHideDropdownTimer();
			this.desktopDropdownOpen = true;
		},
		hideDesktopDropdown() {
			this.desktopDropdownOpen = false;
		},
		startHideDropdownTimer() {
			this.dropdownTimer = setTimeout(() => {
				this.desktopDropdownOpen = false;
			}, 100); // Small delay to prevent flickering
		},
		clearHideDropdownTimer() {
			if (this.dropdownTimer) {
				clearTimeout(this.dropdownTimer);
				this.dropdownTimer = null;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.navbar {
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	padding: 0;
	height: var(--navbar-height);
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

.avatar-circle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	color: white;
	font-weight: 600;
	cursor: pointer;
	font-size: 16px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	background-color: v-bind(avatarColor);
	margin-left: 0;
}

/* Welcome message styling */
.welcome-message {
	margin-right: 8px;
	text-align: right;

	.welcome-greeting {
		font-size: 0.8rem;
		opacity: 0.8;
	}

	.user-name {
		font-weight: 500;
	}
}

// Desktop user dropdown
.user-dropdown-container {
	position: relative;
	display: flex;
	align-items: center;
	padding: 0.5rem;
	margin-left: 8px;
	cursor: pointer;
}

.custom-dropdown-menu {
	position: absolute;
	top: 100%;
	right: 50%;
	min-width: 180px;
	padding: 0.5rem 0;
	margin-top: 8px;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	display: none;
	transform: translateX(50%) translateY(10px);
	opacity: 0;
	transition: transform 0.2s ease, opacity 0.2s ease;

	&.show {
		display: block;
	}

	&.animate-in {
		transform: translateX(50%) translateY(0);
		opacity: 1;
	}

	&.dark-mode {
		background-color: #343a40;
		border: 1px solid #6c757d;

		.dropdown-item {
			color: #f8f9fa;

			&:hover {
				background-color: #495057;
			}
		}

		.dropdown-divider {
			border-top: 1px solid #6c757d;
		}
	}

	.dropdown-item {
		display: block;
		width: 100%;
		padding: 0.5rem 1rem;
		clear: both;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 400;
		text-decoration: none;
		color: #212529;

		&:hover {
			background-color: #f8f9fa;
		}
	}

	.dropdown-divider {
		height: 0;
		margin: 0.5rem 0;
		overflow: hidden;
		border-top: 1px solid #e9ecef;
	}
}

// Mobile view
@media (max-width: 991.98px) {
	.navbar-collapse {
		position: fixed;
		top: var(--navbar-height);
		left: -100%;
		width: 80%;
		height: calc(100vh - var(--navbar-height));
		transition: left 0.3s ease;
		z-index: 1030;
		overflow-y: hidden;

		&.show {
			left: 0;
		}

		&.dark-mobile-bg {
			background-color: rgba(33, 37, 41, 0.97) !important;
		}

		&.light-mobile-bg {
			background-color: rgba(248, 249, 250, 0.97) !important;
		}
	}

	.mobile-nav-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0.5rem 1rem;
	}

	.light-mobile-bg {
		& .mobile-user-section,
		.theme-toggle-btn {
			background-color: white !important;
			border: 2px solid var(--light-accent) !important;
		}

		& .mobile-theme-toggle {
			border-top: 2px solid rgba(115, 115, 115, 0.3);
		}
	}

	.mobile-user-section {
		width: 100%;
		margin-bottom: 1rem;
		border-radius: 8px;
		overflow: hidden;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.mobile-user-header {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		cursor: pointer;

		span {
			flex: 1;
			margin-left: 0.5rem;
			font-weight: 500;
		}

		i {
			transition: transform 0.3s ease;
		}
	}

	.mobile-user-menu {
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease;

		&.active {
			max-height: 200px;
		}

		.mobile-menu-item {
			display: flex;
			align-items: center;
			width: 100%;
			padding: 0.75rem 1rem;
			padding-left: 3.5rem;
			text-decoration: none;
			background: none;
			border: none;
			text-align: left;
			color: inherit;

			&:hover {
				background-color: rgba(255, 255, 255, 0.1);
			}

			&.logout {
				color: #dc3545;
			}
		}
	}

	// Added for mobile auth buttons
	.mobile-auth-buttons {
		margin-bottom: 1rem;
	}

	// Move theme toggle to bottom and add label
	.mobile-theme-toggle {
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);

		.theme-toggle-btn {
			display: flex;
			align-items: center;
			width: 100%;
			padding: 0.75rem 1rem;
			border-radius: 8px;
			background-color: rgba(255, 255, 255, 0.1);
			color: inherit;

			i {
				margin-right: 1rem;
				font-size: 1.2rem;
			}

			span {
				font-weight: 500;
			}

			&:hover {
				background-color: rgba(255, 255, 255, 0.15);
			}
		}
	}
}
</style>
