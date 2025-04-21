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
							<select
								v-model="formData.principalInvestigator"
								class="form-select"
								:class="{ 'is-invalid': errors.principalInvestigator }"
								required
							>
								<option value="">Select PI</option>
								<option v-for="user in staffUsers" :key="user.id" :value="user.id">
									{{ user.title }} {{ user.firstName }} {{ user.lastName }}
								</option>
							</select>
							<div class="invalid-feedback">{{ errors.principalInvestigator }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Other Researchers</label>
							<select
								v-model="formData.researchers"
								class="form-select"
								multiple
								:class="{ 'is-invalid': errors.researchers }"
							>
								<option v-for="user in allUsers" :key="user.id" :value="user.id">
									{{ user.title }} {{ user.firstName }} {{ user.lastName }}
								</option>
							</select>
							<div class="invalid-feedback">{{ errors.researchers }}</div>
							<small class="text-muted"
								>Hold Ctrl/Cmd to select multiple researchers</small
							>
						</div>

						<div class="mb-3">
							<label class="form-label">Clinical Research Coordinator</label>
							<select
								v-model="formData.coordinator"
								class="form-select"
								:class="{ 'is-invalid': errors.coordinator }"
								required
							>
								<option value="">Select Coordinator</option>
								<option v-for="user in staffUsers" :key="user.id" :value="user.id">
									{{ user.title }} {{ user.firstName }} {{ user.lastName }}
								</option>
							</select>
							<div class="invalid-feedback">{{ errors.coordinator }}</div>
						</div>

						<div class="mb-4">
							<label class="form-label">Statistician</label>
							<select
								v-model="formData.statistician"
								class="form-select"
								:class="{ 'is-invalid': errors.statistician }"
								required
							>
								<option value="">Select Statistician</option>
								<option v-for="user in staffUsers" :key="user.id" :value="user.id">
									{{ user.title }} {{ user.firstName }} {{ user.lastName }}
								</option>
							</select>
							<div class="invalid-feedback">{{ errors.statistician }}</div>
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

export default {
	name: 'NewProject',
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
		...mapState(useResearchStore, ['staffUsers', 'allUsers', 'loading']),
		...mapState(useThemeStore, ['isDarkMode']),
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
	},
	async created() {
		await this.fetchUsers();
	},
};
</script>

<style lang="scss" scoped>
.new-project {
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
		}
	}
}
</style>
