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
								<h2 class="fw-bold">Create Account</h2>
								<p class="text-muted">Join the LRH Research Portal</p>
							</div>

							<form @submit.prevent="handleRegister">
								<div class="mb-3">
									<label for="title" class="form-label">Title</label>
									<select
										id="title"
										v-model="formData.title"
										class="form-select"
										:class="{ 'is-invalid': errors.title }"
										required
									>
										<option value="">Select Title</option>
										<option value="Dr.">Dr.</option>
										<option value="Mr.">Mr.</option>
										<option value="Ms.">Ms.</option>
										<option value="Mrs.">Mrs.</option>
									</select>
									<div class="invalid-feedback">{{ errors.title }}</div>
								</div>

								<div class="mb-3">
									<label for="firstName" class="form-label">First Name</label>
									<input
										type="text"
										id="firstName"
										v-model="formData.firstName"
										class="form-control"
										:class="{ 'is-invalid': errors.firstName }"
										required
									/>
									<div class="invalid-feedback">{{ errors.firstName }}</div>
								</div>

								<div class="mb-3">
									<label for="lastName" class="form-label">Last Name</label>
									<input
										type="text"
										id="lastName"
										v-model="formData.lastName"
										class="form-control"
										:class="{ 'is-invalid': errors.lastName }"
										required
									/>
									<div class="invalid-feedback">{{ errors.lastName }}</div>
								</div>

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

								<div class="mb-3">
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
									<small class="text-muted">
										Password must be at least 8 characters long
									</small>
								</div>

								<div class="mb-4">
									<label for="confirmPassword" class="form-label"
										>Confirm Password</label
									>
									<input
										type="password"
										id="confirmPassword"
										v-model="formData.confirmPassword"
										class="form-control"
										:class="{ 'is-invalid': errors.confirmPassword }"
										required
									/>
									<div class="invalid-feedback">{{ errors.confirmPassword }}</div>
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
										Create Account
									</button>
								</div>
							</form>

							<hr class="my-4" />

							<p class="text-center mb-0">
								Already have an account?
								<router-link to="/auth/login">Sign in</router-link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useToast } from 'vue-toastification'

export default {
	name: 'Register',
	data() {
		return {
			formData: {
				title: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
			},
			errors: {
				title: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
			},
			loading: false,
		}
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		validateForm() {
			let isValid = true
			this.errors = {
				title: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
			}

			if (!this.formData.title) {
				this.errors.title = 'Please select a title'
				isValid = false
			}

			if (!this.formData.firstName) {
				this.errors.firstName = 'First name is required'
				isValid = false
			}

			if (!this.formData.lastName) {
				this.errors.lastName = 'Last name is required'
				isValid = false
			}

			if (!this.formData.email) {
				this.errors.email = 'Email is required'
				isValid = false
			}

			if (!this.formData.password) {
				this.errors.password = 'Password is required'
				isValid = false
			} else if (this.formData.password.length < 8) {
				this.errors.password = 'Password must be at least 8 characters long'
				isValid = false
			}

			if (this.formData.password !== this.formData.confirmPassword) {
				this.errors.confirmPassword = 'Passwords do not match'
				isValid = false
			}

			return isValid
		},
		async handleRegister() {
			if (!this.validateForm()) return

			this.loading = true
			try {
				const authStore = useAuthStore()
				const toast = useToast()

				const userData = {
					title: this.formData.title,
					firstName: this.formData.firstName,
					lastName: this.formData.lastName,
				}

				const result = await authStore.register(
					this.formData.email,
					this.formData.password,
					userData
				)

				if (result.success) {
					toast.success('Account created successfully!')
					this.$router.push('/')
				} else {
					toast.error(result.error || 'Failed to create account')
					if (result.error.includes('email')) {
						this.errors.email = result.error
					} else if (result.error.includes('password')) {
						this.errors.password = result.error
					}
				}
			} catch (error) {
				useToast().error('An unexpected error occurred')
			} finally {
				this.loading = false
			}
		},
	},
}
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

.form-control,
.form-select {
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
