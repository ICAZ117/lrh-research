<template>
	<div
		class="auth-page min-vh-100 d-flex align-items-center justify-content-center"
		:class="{ dark: isDarkMode }"
	>
		<div class="container py-5">
			<div class="row justify-content-center">
				<div class="col-md-6 col-lg-5">
					<div class="card shadow-lg">
						<div class="card-body p-5">
							<div class="text-center mb-4">
								<h2 class="fw-bold">Welcome Back</h2>
								<p class="text-muted">Sign in to continue to LRH Research Portal</p>
							</div>

							<form @submit.prevent="handleLogin">
								<div class="mb-3">
									<label for="email" class="form-label">Email Address</label>
									<input
										type="email"
										id="email"
										v-model="formData.email"
										class="form-control"
										:class="{ 'is-invalid': errors.email }"
										required
									/>
									<div class="invalid-feedback">{{ errors.email }}</div>
								</div>

								<div class="mb-4">
									<label for="password" class="form-label">Password</label>
									<input
										type="password"
										id="password"
										v-model="formData.password"
										class="form-control"
										:class="{ 'is-invalid': errors.password }"
										required
									/>
									<div class="invalid-feedback">{{ errors.password }}</div>
								</div>

								<div class="d-grid">
									<button
										type="submit"
										class="btn btn-primary btn-lg"
										:disabled="loading"
									>
										<span
											v-if="loading"
											class="spinner-border spinner-border-sm me-2"
										></span>
										Sign In
									</button>
								</div>

								<div class="text-center mt-4">
									<router-link to="/auth/forgot-password" class="text-muted">
										Forgot Password?
									</router-link>
								</div>
							</form>

							<hr class="my-4" />

							<p class="text-center mb-0">
								Don't have an account?
								<router-link to="/auth/register">Sign up</router-link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useToast } from 'vue-toastification';

export default {
	name: 'Login',
	data() {
		return {
			formData: {
				email: '',
				password: '',
			},
			errors: {
				email: '',
				password: '',
			},
			loading: false,
		};
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		async handleLogin() {
			// Reset errors
			this.errors = {
				email: '',
				password: '',
			};

			this.loading = true;
			try {
				const authStore = useAuthStore();
				const toast = useToast();

				const result = await authStore.login(this.formData.email, this.formData.password);
				if (result.success) {
					toast.success('Successfully logged in!');
					this.$router.push('/');
				} else {
					toast.error(result.error || 'Failed to login');
					if (result.error.includes('email')) {
						this.errors.email = result.error;
					} else if (result.error.includes('password')) {
						this.errors.password = result.error;
					}
				}
			} catch (error) {
				useToast().error('An unexpected error occurred');
			} finally {
				this.loading = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.auth-page {
	background: linear-gradient(135deg, var(--light-2) 0%, var(--light-accent) 100%);
	transition: all 0.3s ease;
	padding-top: var(--navbar-height) !important;

	&.dark {
		background: linear-gradient(135deg, var(--dark-2) 0%, var(--dark-3) 100%);

		.card {
			background-color: var(--dark-1);
			color: #fff;
		}

		.text-muted {
			color: #adb5bd !important;
		}

		.form-control,
		.form-select {
			background-color: var(--dark-2);
			border-color: var(--dark-accent);
			color: #fff;

			&:focus {
				background-color: #2c3034;
				color: #fff;
			}
		}
	}
}

.card {
	border: none;
	border-radius: 15px;
	transition: all 0.3s ease;
}

.form-control {
	padding: 0.75rem 1rem;
	border-radius: 8px;

	&:focus {
		box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
	}
}

.btn-primary {
	padding: 0.75rem 1rem;
	border-radius: 8px;
}
</style>
