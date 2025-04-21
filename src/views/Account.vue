<template>
	<div class="account-page" :class="{ dark: isDarkMode }">
		<div class="me-0 py-5 row justify-content-center">
			<div class="col-md-8">
				<div class="card shadow">
					<div class="card-body">
						<h2 class="card-title mb-4">Account Settings</h2>

						<form @submit.prevent="handleSubmit">
							<div class="mb-3">
								<label class="form-label">Email</label>
								<input
									type="email"
									class="form-control"
									:value="userData?.email"
									disabled
								/>
								<small class="text-muted">Email cannot be changed</small>
							</div>

							<div class="mb-3">
								<label class="form-label">Title</label>
								<select
									class="form-select"
									v-model="formData.title"
									:value="userData?.title"
								>
									<option value="Dr.">Dr.</option>
									<option value="Mr.">Mr.</option>
									<option value="Ms.">Ms.</option>
									<option value="Mrs.">Mrs.</option>
								</select>
							</div>

							<div class="mb-3">
								<label class="form-label">First Name</label>
								<input
									type="text"
									class="form-control"
									v-model="formData.firstName"
								/>
							</div>

							<div class="mb-3">
								<label class="form-label">Last Name</label>
								<input
									type="text"
									class="form-control"
									v-model="formData.lastName"
								/>
							</div>

							<button type="submit" class="btn btn-primary">Update Profile</button>
						</form>

						<hr class="my-4" />

						<h3 class="mb-3">Change Password</h3>
						<form @submit.prevent="handlePasswordChange">
							<div class="mb-3">
								<label class="form-label">New Password</label>
								<input
									type="password"
									class="form-control"
									v-model="passwordForm.newPassword"
								/>
							</div>

							<div class="mb-3">
								<label class="form-label">Confirm New Password</label>
								<input
									type="password"
									class="form-control"
									v-model="passwordForm.confirmPassword"
								/>
							</div>

							<button type="submit" class="btn btn-warning">Change Password</button>
						</form>

						<hr class="my-4" />

						<h3 class="mb-3">Danger Zone</h3>
						<button
							type="button"
							class="btn btn-danger"
							@click="showDeleteModal = true"
						>
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete Account Modal -->
		<div class="modal" :class="{ 'show d-block': showDeleteModal, 'd-none': !showDeleteModal }">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content" :class="{ 'bg-dark text-light': isDarkMode }">
					<div class="modal-header">
						<h5 class="modal-title">Delete Account</h5>
						<button
							type="button"
							class="btn-close"
							:class="{ 'btn-close-white': isDarkMode }"
							@click="cancelDelete"
						></button>
					</div>
					<div class="modal-body">
						<p class="text-danger fw-bold">Warning: This action cannot be undone.</p>
						<p>Please enter your email and password to confirm account deletion.</p>
						<form @submit.prevent="confirmDelete">
							<div class="mb-3">
								<label class="form-label">Email</label>
								<input
									type="email"
									class="form-control"
									v-model="deleteForm.email"
									:class="{ 'is-invalid': deleteForm.emailError }"
								/>
								<div class="invalid-feedback" v-if="deleteForm.emailError">
									{{ deleteForm.emailError }}
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label">Password</label>
								<input
									type="password"
									class="form-control"
									v-model="deleteForm.password"
									:class="{ 'is-invalid': deleteForm.passwordError }"
								/>
								<div class="invalid-feedback" v-if="deleteForm.passwordError">
									{{ deleteForm.passwordError }}
								</div>
							</div>
							<div v-if="deleteForm.error" class="alert alert-danger">
								{{ deleteForm.error }}
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="cancelDelete">
							Cancel
						</button>
						<button
							type="button"
							class="btn btn-danger"
							@click="confirmDelete"
							:disabled="deleteForm.isSubmitting"
						>
							<span
								v-if="deleteForm.isSubmitting"
								class="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Delete My Account
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useToast } from 'vue-toastification';

export default {
	name: 'Account',
	data() {
		return {
			formData: {
				title: '',
				firstName: '',
				lastName: '',
			},
			passwordForm: {
				newPassword: '',
				confirmPassword: '',
			},
			showDeleteModal: false,
			deleteForm: {
				email: '',
				password: '',
				emailError: '',
				passwordError: '',
				error: '',
				isSubmitting: false,
			},
		};
	},
	computed: {
		...mapState(useAuthStore, ['userData']),
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		...mapActions(useAuthStore, [
			'updateUserProfile',
			'updateUserPassword',
			'logout',
			'deleteAccount',
		]),
		async handleSubmit() {
			const toast = useToast();
			const result = await this.updateUserProfile(this.formData);
			if (result.success) {
				toast.success('Profile updated successfully');
			} else {
				toast.error(result.error || 'Failed to update profile');
			}
		},
		async handlePasswordChange() {
			const toast = useToast();
			if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
				toast.error('Passwords do not match');
				return;
			}
			const result = await this.updateUserPassword(this.passwordForm.newPassword);
			if (result.success) {
				toast.success('Password updated successfully');
				this.passwordForm.newPassword = '';
				this.passwordForm.confirmPassword = '';
			} else {
				toast.error(result.error || 'Failed to update password');
			}
		},
		cancelDelete() {
			this.showDeleteModal = false;
			this.deleteForm = {
				email: '',
				password: '',
				emailError: '',
				passwordError: '',
				error: '',
				isSubmitting: false,
			};
		},
		async confirmDelete() {
			// Reset error fields
			this.deleteForm.emailError = '';
			this.deleteForm.passwordError = '';
			this.deleteForm.error = '';

			// Validate email and password
			let isValid = true;

			if (!this.deleteForm.email) {
				this.deleteForm.emailError = 'Email is required';
				isValid = false;
			} else if (this.deleteForm.email !== this.userData?.email) {
				this.deleteForm.emailError = 'Email does not match your account email';
				isValid = false;
			}

			if (!this.deleteForm.password) {
				this.deleteForm.passwordError = 'Password is required';
				isValid = false;
			}

			if (!isValid) return;

			const toast = useToast();
			this.deleteForm.isSubmitting = true;

			try {
				const result = await this.deleteAccount({
					email: this.deleteForm.email,
					password: this.deleteForm.password,
				});

				if (result.success) {
					toast.success('Your account has been deleted');
					this.showDeleteModal = false;
					this.$router.push('/');
				} else {
					// Handle specific error codes
					if (result.code === 'auth/wrong-password') {
						this.deleteForm.passwordError = 'Incorrect password';
					} else if (
						result.code === 'auth/user-mismatch' ||
						result.code === 'auth/invalid-credential'
					) {
						this.deleteForm.error = 'Invalid credentials';
					} else if (result.code === 'auth/too-many-requests') {
						this.deleteForm.error =
							'Too many unsuccessful attempts. Please try again later';
					} else {
						this.deleteForm.error = result.error || 'Failed to delete account';
					}

					toast.error('Failed to delete account');
				}
			} finally {
				this.deleteForm.isSubmitting = false;
			}
		},
	},
	async mounted() {
		await useAuthStore().init();

		if (this.userData) {
			this.formData = {
				title: this.userData.title || '',
				firstName: this.userData.firstName || '',
				lastName: this.userData.lastName || '',
			};
		}
	},
};
</script>

<style scoped lang="scss">
.account-page {
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

/* Modal styling for dark mode */
.modal-content.bg-dark {
	border-color: var(--dark-accent);

	.form-control {
		background-color: var(--dark-2);
		border-color: var(--dark-accent);
		color: #fff;

		&:focus {
			background-color: #2c3034;
		}
	}
}
</style>
