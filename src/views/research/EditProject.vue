<template>
	<div class="edit-project min-vh-100" :class="{ dark: isDarkMode }">
		<div class="container pb-5">
			<h1 class="mb-4">Edit Research Project</h1>

			<div v-if="loading" class="d-flex justify-content-center my-5">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>

			<div v-else class="card">
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
								Update Project
							</button>
							<router-link :to="`/research-portal`" class="btn btn-outline-secondary">
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
	name: 'EditProject',
	components: {
		SearchDropdown,
	},
	data() {
		return {
			projectId: '',
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
		...mapState(useResearchStore, ['allUsers', 'loading', 'currentProject']),
		...mapState(useThemeStore, ['isDarkMode']),
		userOptions() {
			return this.allUsers.map((user) => ({
				id: user.id,
				name: `${user.title} ${user.firstName} ${user.lastName}`,
			}));
		},
	},
	methods: {
		...mapActions(useResearchStore, ['fetchUsers', 'fetchProject', 'updateProject']),

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
				await this.updateProject(this.projectId, this.formData);
				useToast().success('Project updated successfully');
				this.$router.push(`/research-portal`);
			} catch (error) {
				useToast().error('Failed to update project');
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
			// We need to handle special cases like removing from researchers if selected as PI, CRC, or Statistician

			// Clear any existing validation errors
			this.errors = {
				...this.errors,
				principalInvestigator: '',
				researchers: '',
				coordinator: '',
				statistician: '',
			};

			// If PI is selected and is in researchers, remove from researchers
			if (
				this.formData.principalInvestigator &&
				Array.isArray(this.formData.researchers) &&
				this.formData.researchers.includes(this.formData.principalInvestigator)
			) {
				this.formData.researchers = this.formData.researchers.filter(
					(id) => id !== this.formData.principalInvestigator
				);
			}

			// If CRC is selected and is in researchers, remove from researchers
			if (
				this.formData.coordinator &&
				Array.isArray(this.formData.researchers) &&
				this.formData.researchers.includes(this.formData.coordinator)
			) {
				this.formData.researchers = this.formData.researchers.filter(
					(id) => id !== this.formData.coordinator
				);
			}

			// If Statistician is selected and is in researchers, remove from researchers
			if (
				this.formData.statistician &&
				Array.isArray(this.formData.researchers) &&
				this.formData.researchers.includes(this.formData.statistician)
			) {
				this.formData.researchers = this.formData.researchers.filter(
					(id) => id !== this.formData.statistician
				);
			}

			// If CRC and Statistician are the same, clear the most recently changed one
			if (
				this.formData.coordinator &&
				this.formData.statistician &&
				this.formData.coordinator === this.formData.statistician
			) {
				// Determine which was changed last and reset it
				// This is a simplification - you might need a more sophisticated approach
				// For now, let's assume coordinator takes precedence
				this.formData.statistician = '';
			}
		},

		loadProjectData() {
			this.formData = {
				title: this.currentProject.title,
				description: this.currentProject.description,
				status: this.currentProject.status,
				principalInvestigator: this.currentProject.principalInvestigator,
				researchers: this.currentProject.researchers || [],
				coordinator: this.currentProject.coordinator,
				statistician: this.currentProject.statistician,
			};
		},
	},
	async created() {
		this.projectId = this.$route.params.id;
		await Promise.all([this.fetchUsers(), this.fetchProject(this.projectId)]);

		if (this.currentProject) {
			this.loadProjectData();
		} else {
			useToast().error('Project not found');
			this.$router.push('/research-portal');
		}
	},
};
</script>

<style lang="scss" scoped>
.edit-project {
	padding-top: calc(2rem + var(--navbar-height));

	&.dark {
		background-color: #1a1a1a;
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
