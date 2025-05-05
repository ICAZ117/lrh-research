<template>
	<div class="new-project min-vh-100" :class="{ dark: isDarkMode }">
		<div class="container pb-5">
			<h1 class="mb-4">Create New Research Project</h1>

			<div class="card">
				<div class="card-body">
					<form @submit.prevent="handleSubmit">
						<div class="mb-3">
							<label class="form-label">Project Title</label>
							<input
								type="text"
								v-model="formData.title"
								class="form-control"
								:class="{ 'is-invalid': errors.title }"
								required
							/>
							<div class="invalid-feedback">{{ errors.title }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Project Description</label>
							<textarea
								v-model="formData.description"
								class="form-control"
								:class="{ 'is-invalid': errors.description }"
								rows="4"
								required
							></textarea>
							<div class="invalid-feedback">{{ errors.description }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Status</label>
							<select
								v-model="formData.status"
								class="form-select"
								:class="{ 'is-invalid': errors.status }"
								required
							>
								<option value="">Select Status</option>
								<option value="In Progress">In Progress</option>
								<option value="On Hold">On Hold</option>
								<option value="Completed">Completed</option>
								<option value="Cancelled">Cancelled</option>
							</select>
							<div class="invalid-feedback">{{ errors.status }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Principal Investigator</label>
							<SearchDropdown
								v-model="formData.principalInvestigator"
								:options="userOptions"
								placeholder="Search for Principal Investigator"
								:is-invalid="!!errors.principalInvestigator"
								:error-message="errors.principalInvestigator"
								:disabled-options="getDisabledOptionsFor('principalInvestigator')"
								@update:modelValue="updateRoleSelections"
							/>
						</div>

						<div class="mb-3">
							<label class="form-label">Other Researchers</label>
							<SearchDropdown
								v-model="formData.researchers"
								:options="userOptions"
								placeholder="Search for Researchers"
								:multiple="true"
								:is-invalid="!!errors.researchers"
								:error-message="errors.researchers"
								:disabled-options="getDisabledOptionsFor('researchers')"
								@update:modelValue="updateRoleSelections"
							/>
							<small class="form-text text-muted"
								>You can select multiple researchers</small
							>
						</div>

						<div class="mb-3">
							<label class="form-label">Clinical Research Coordinator</label>
							<SearchDropdown
								v-model="formData.coordinator"
								:options="userOptions"
								placeholder="Search for Coordinator"
								:is-invalid="!!errors.coordinator"
								:error-message="errors.coordinator"
								:disabled-options="getDisabledOptionsFor('coordinator')"
								@update:modelValue="updateRoleSelections"
							/>
						</div>

						<div class="mb-4">
							<label class="form-label">Statistician</label>
							<SearchDropdown
								v-model="formData.statistician"
								:options="userOptions"
								placeholder="Search for Statistician"
								:is-invalid="!!errors.statistician"
								:error-message="errors.statistician"
								:disabled-options="getDisabledOptionsFor('statistician')"
								@update:modelValue="updateRoleSelections"
							/>
						</div>

						<div class="d-flex gap-2">
							<button type="submit" class="btn btn-primary" :disabled="loading">
								<span
									v-if="loading"
									class="spinner-border spinner-border-sm me-2"
								></span>
								Create Project
							</button>
							<router-link to="/research-portal" class="btn btn-outline-secondary">
								Cancel
							</router-link>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useResearchStore } from '@/stores/research';
import { useThemeStore } from '@/stores/theme';
import { useToast } from 'vue-toastification';
import SearchDropdown from '@/components/SearchDropdown.vue';

export default {
	name: 'NewProject',
	components: {
		SearchDropdown,
	},
	data() {
		return {
			formData: {
				title: '',
				description: '',
				status: '',
				principalInvestigator: '',
				researchers: [],
				coordinator: '',
				statistician: '',
			},
			errors: {
				title: '',
				description: '',
				status: '',
				principalInvestigator: '',
				researchers: '',
				coordinator: '',
				statistician: '',
			},
		};
	},
	computed: {
		...mapState(useResearchStore, ['allUsers', 'loading']),
		...mapState(useThemeStore, ['isDarkMode']),
		userOptions() {
			return this.allUsers.map((user) => ({
				id: user.id,
				name: `${user.title} ${user.firstName} ${user.lastName}`,
			}));
		},
	},
	methods: {
		...mapActions(useResearchStore, ['fetchUsers', 'createProject']),

		validateForm() {
			let isValid = true;
			this.errors = {
				title: '',
				description: '',
				status: '',
				principalInvestigator: '',
				researchers: '',
				coordinator: '',
				statistician: '',
			};

			if (!this.formData.title) {
				this.errors.title = 'Project title is required';
				isValid = false;
			}

			if (!this.formData.description) {
				this.errors.description = 'Project description is required';
				isValid = false;
			}

			if (!this.formData.status) {
				this.errors.status = 'Status is required';
				isValid = false;
			}

			if (!this.formData.principalInvestigator) {
				this.errors.principalInvestigator = 'Principal Investigator is required';
				isValid = false;
			}

			if (!this.formData.coordinator) {
				this.errors.coordinator = 'Coordinator is required';
				isValid = false;
			}

			if (!this.formData.statistician) {
				this.errors.statistician = 'Statistician is required';
				isValid = false;
			}

			// Additional validation to ensure roles don't conflict
			if (
				this.formData.coordinator === this.formData.statistician &&
				this.formData.coordinator
			) {
				this.errors.coordinator = 'Coordinator cannot be the same as Statistician';
				this.errors.statistician = 'Statistician cannot be the same as Coordinator';
				isValid = false;
			}

			// Validate that researchers don't contain unique roles
			if (Array.isArray(this.formData.researchers) && this.formData.researchers.length > 0) {
				const uniqueRoleIds = [
					this.formData.principalInvestigator,
					this.formData.coordinator,
					this.formData.statistician,
				].filter((id) => id); // Filter out empty values

				const conflictingResearchers = this.formData.researchers.filter((id) =>
					uniqueRoleIds.includes(id)
				);

				if (conflictingResearchers.length > 0) {
					this.errors.researchers =
						'Other Researchers cannot include users selected for PI, CRC, or Statistician roles';
					isValid = false;
				}
			}

			return isValid;
		},

		async handleSubmit() {
			if (!this.validateForm()) return;

			try {
				const projectId = await this.createProject(this.formData);
				useToast().success('Project created successfully');
				this.$router.push(`/research-portal/${projectId}`);
			} catch (error) {
				useToast().error('Failed to create project');
			}
		},

		getDisabledOptionsFor(fieldName) {
			const disabledOptions = [];

			// Apply rules based on what field we're getting disabled options for
			switch (fieldName) {
				case 'principalInvestigator':
					// PI cannot be in the researchers array
					if (Array.isArray(this.formData.researchers)) {
						disabledOptions.push(...this.formData.researchers);
					}
					break;

				case 'coordinator':
					// CRC cannot be the statistician
					if (this.formData.statistician) {
						disabledOptions.push(this.formData.statistician);
					}
					// CRC cannot be in researchers
					if (Array.isArray(this.formData.researchers)) {
						disabledOptions.push(...this.formData.researchers);
					}
					break;

				case 'statistician':
					// Statistician cannot be the CRC
					if (this.formData.coordinator) {
						disabledOptions.push(this.formData.coordinator);
					}
					// Statistician cannot be in researchers
					if (Array.isArray(this.formData.researchers)) {
						disabledOptions.push(...this.formData.researchers);
					}
					break;

				case 'researchers':
					// Researchers cannot include PI, CRC, or Statistician
					if (this.formData.principalInvestigator) {
						disabledOptions.push(this.formData.principalInvestigator);
					}
					if (this.formData.coordinator) {
						disabledOptions.push(this.formData.coordinator);
					}
					if (this.formData.statistician) {
						disabledOptions.push(this.formData.statistician);
					}
					break;
			}

			return disabledOptions;
		},

		updateRoleSelections() {
			// When a role changes, this method is called
			// The logic is already handled by the getDisabledOptionsFor method
			// This is a hook for any additional logic you might want to add

			// Clear any existing validation errors for the fields
			this.errors = {
				...this.errors,
				principalInvestigator: '',
				researchers: '',
				coordinator: '',
				statistician: '',
			};

			// Optionally, validate the form whenever selections change
			// this.validateForm();
		},
	},
	async created() {
		await this.fetchUsers();
	},
};
</script>

<style lang="scss" scoped>
.new-project {
	padding-top: calc(2rem + var(--navbar-height));
	background: linear-gradient(135deg, var(--light-2) 0%, var(--light-accent) 100%);

	&.dark {
		background: var(--dark-3) !important;
		color: #ffffff;

		.card {
			background-color: #2c3034;
			border-color: #444;
		}

		.form-control,
		.form-select {
			background-color: #212529;
			border-color: #444;
			color: #ffffff;

			&:focus {
				background-color: #2c3034;
				color: #ffffff;
			}

			option {
				background-color: #212529;
				color: #ffffff;
			}
		}
	}
}
</style>
