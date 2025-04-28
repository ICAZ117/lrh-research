<!-- eslint-disable vue/no-reserved-component-names -->
<!-- eslint-disable vue/no-reserved-component-names -->
<template>
	<div class="edit-project min-vh-100 py-5 mt-5" :class="{ dark: isDarkMode }">
		<div class="container">
			<div class="d-flex justify-content-between align-items-center mb-4">
				<h1>Edit Research Project</h1>
				<button class="btn btn-danger" @click="showDeleteConfirmation = true">
					<i class="fas fa-trash me-2"></i>Delete Project
				</button>
			</div>

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
							<Dropdown
								v-model="formData.principalInvestigator"
								:options="allUsers"
								optionLabel="fullName"
								optionValue="id"
								:filter="true"
								filterPlaceholder="Search users..."
								placeholder="Select Principal Investigator"
								class="w-100"
								:class="{ 'is-invalid': errors.principalInvestigator }"
							/>
							<div class="invalid-feedback">{{ errors.principalInvestigator }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Other Researchers</label>
							<MultiSelect
								v-model="formData.researchers"
								:options="allUsers"
								optionLabel="fullName"
								optionValue="id"
								:filter="true"
								filterPlaceholder="Search users..."
								placeholder="Select Researchers"
								class="w-100"
								:class="{ 'is-invalid': errors.researchers }"
							/>
							<div class="invalid-feedback">{{ errors.researchers }}</div>
						</div>

						<div class="mb-3">
							<label class="form-label">Clinical Research Coordinator</label>
							<Dropdown
								v-model="formData.coordinator"
								:options="allUsers"
								optionLabel="fullName"
								optionValue="id"
								:filter="true"
								filterPlaceholder="Search users..."
								placeholder="Select Coordinator"
								class="w-100"
								:class="{ 'is-invalid': errors.coordinator }"
							/>
							<div class="invalid-feedback">{{ errors.coordinator }}</div>
						</div>

						<div class="mb-4">
							<label class="form-label">Statistician</label>
							<Dropdown
								v-model="formData.statistician"
								:options="allUsers"
								optionLabel="fullName"
								optionValue="id"
								:filter="true"
								filterPlaceholder="Search users..."
								placeholder="Select Statistician"
								class="w-100"
								:class="{ 'is-invalid': errors.statistician }"
							/>
							<div class="invalid-feedback">{{ errors.statistician }}</div>
						</div>

						<div class="d-flex gap-2">
							<button type="submit" class="btn btn-primary" :disabled="loading">
								<span
									v-if="loading"
									class="spinner-border spinner-border-sm me-2"
								></span>
								Update Project
							</button>
							<router-link to="/research-portal" class="btn btn-outline-secondary">
								Cancel
							</router-link>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<Dialog
			v-model:visible="showDeleteConfirmation"
			header="Confirm Deletion"
			:modal="true"
			:closable="false"
			class="delete-modal"
		>
			<p class="mb-4">
				Are you sure you want to delete this project? This action cannot be undone.
			</p>
			<template #footer>
				<Button
					label="Cancel"
					class="p-button-text"
					@click="showDeleteConfirmation = false"
				/>
				<Button
					label="Delete"
					class="p-button-danger"
					@click="handleDelete"
					:loading="loading"
				/>
			</template>
		</Dialog>
	</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useResearchStore } from '@/stores/research';
import { useThemeStore } from '@/stores/theme';
import { useToast } from 'vue-toastification';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

export default {
	name: 'EditProject',
	components: {
		Dropdown,
		MultiSelect,
		// eslint-disable-next-line vue/no-reserved-component-names
		Dialog,
		// eslint-disable-next-line vue/no-reserved-component-names
		Button,
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
			showDeleteConfirmation: false,
		};
	},
	computed: {
		...mapState(useResearchStore, ['currentProject', 'allUsers', 'loading']),
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		...mapActions(useResearchStore, [
			'fetchProject',
			'fetchUsers',
			'updateProject',
			'deleteProject',
		]),
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
				await this.updateProject(this.$route.params.id, this.formData);
				useToast().success('Project updated successfully');
				this.$router.push('/research-portal');
			} catch (error) {
				useToast().error('Failed to update project');
			}
		},
		async handleDelete() {
			try {
				await this.deleteProject(this.$route.params.id);
				useToast().success('Project deleted successfully');
				this.$router.push('/research-portal');
			} catch (error) {
				useToast().error('Failed to delete project');
			} finally {
				this.showDeleteConfirmation = false;
			}
		},
	},
	async created() {
		const authStore = useAuthStore();
		if (!authStore.isStaff) {
			useToast().error('Unauthorized: Only staff members can access this page');
			this.$router.push('/');
			return;
		}

		await Promise.all([this.fetchProject(this.$route.params.id), this.fetchUsers()]);

		if (this.currentProject) {
			this.formData = { ...this.currentProject };
		} else {
			this.$router.push('/research-portal');
		}
	},
};
</script>

<style lang="scss" scoped>
.edit-project {
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

:deep(.p-dropdown),
:deep(.p-multiselect) {
	width: 100%;
}

.delete-modal {
	max-width: 400px;
	margin: 0 auto;
}
</style>
