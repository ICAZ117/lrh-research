<template>
	<div class="research-portal min-vh-100" :class="{ dark: isDarkMode }">
		<div class="container pb-5">
			<div class="d-flex justify-content-between align-items-center mb-4">
				<h1>Research Portal</h1>
				<router-link v-if="isStaff" to="/research-portal/new" class="btn btn-primary">
					<i class="fas fa-plus me-2"></i>New Project
				</router-link>
			</div>

			<!-- Staff View -->
			<template v-if="isStaff">
				<h2 class="h4 mb-3">All Projects</h2>
				<div class="row g-4 mb-5">
					<div v-if="allProjects.length === 0" class="col-12">
						<div class="alert alert-info">
							No research projects have been created yet.
						</div>
					</div>
					<div
						v-else
						v-for="project in allProjects"
						:key="project.id"
						class="col-md-6 col-lg-4"
					>
						<div class="card h-100">
							<div class="card-body">
								<h3 class="h5 card-title mb-3">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3 d-flex align-items-center gap-3">
									<div
										class="status-badge"
										:class="getStatusClass(project.status)"
										@click="toggleStatusDropdown(project.id)"
									>
										{{ project.status }}
										<i class="fas fa-chevron-down ms-2"></i>

										<div
											v-show="activeDropdown === project.id"
											class="status-dropdown"
										>
											<div
												v-for="status in statusOptions"
												:key="status"
												class="status-option"
												:class="{ active: status === project.status }"
												@click.stop="handleStatusUpdate(project.id, status)"
											>
												{{ status }}
											</div>
										</div>
									</div>

									<div v-if="isStaff" class="activity-toggle">
										<label class="switch">
											<input
												type="checkbox"
												:checked="project.needsAction"
												@change="
													handleActivityToggle(
														project.id,
														!project.needsAction
													)
												"
											/>
											<span class="slider round"></span>
										</label>
										<span
											class="ms-2 activity-label"
											:class="{ 'text-warning': project.needsAction }"
										>
											{{
												project.needsAction
													? 'Action Required'
													: 'No Action Needed'
											}}
										</span>
									</div>
									<div
										v-else-if="project.needsAction"
										class="activity-status text-warning"
									>
										<i class="fas fa-exclamation-circle me-2"></i>
										Action Required
									</div>
								</div>
								<dl class="row mb-0">
									<dt class="col-sm-4">PI:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.principalInvestigator) }}
									</dd>

									<dt class="col-sm-4">Coordinator:</dt>
									<dd class="col-sm-8">{{ getUserName(project.coordinator) }}</dd>

									<dt class="col-sm-4">Statistician:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.statistician) }}
									</dd>
								</dl>
							</div>
							<div class="card-footer bg-transparent">
								<div class="d-flex gap-2">
									<router-link
										:to="`/research-portal/${project.id}`"
										class="btn btn-outline-primary btn-sm"
									>
										View Details
									</router-link>
									<router-link
										:to="`/research-portal/${project.id}/edit`"
										class="btn btn-outline-secondary btn-sm"
									>
										<i class="fas fa-edit"></i> Edit
									</router-link>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- My Assigned Projects Section -->
				<h2 class="h4 mb-3">My Assigned Projects</h2>
				<div class="row g-4">
					<div v-if="myProjects.length === 0" class="col-12">
						<div class="alert alert-info">
							You don't have any projects assigned to you.
						</div>
					</div>
					<div
						v-else
						v-for="project in myProjects"
						:key="project.id"
						class="col-md-6 col-lg-4"
					>
						<div class="card h-100">
							<div class="card-body">
								<h3 class="h5 card-title mb-3">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3 d-flex align-items-center gap-3">
									<div
										class="status-badge"
										:class="getStatusClass(project.status)"
										@click="toggleStatusDropdown(project.id)"
									>
										{{ project.status }}
										<i class="fas fa-chevron-down ms-2"></i>

										<div
											v-show="activeDropdown === project.id"
											class="status-dropdown"
										>
											<div
												v-for="status in statusOptions"
												:key="status"
												class="status-option"
												:class="{ active: status === project.status }"
												@click.stop="handleStatusUpdate(project.id, status)"
											>
												{{ status }}
											</div>
										</div>
									</div>

									<div v-if="isStaff" class="activity-toggle">
										<label class="switch">
											<input
												type="checkbox"
												:checked="project.needsAction"
												@change="
													handleActivityToggle(
														project.id,
														!project.needsAction
													)
												"
											/>
											<span class="slider round"></span>
										</label>
										<span
											class="ms-2 activity-label"
											:class="{ 'text-warning': project.needsAction }"
										>
											{{
												project.needsAction
													? 'Action Required'
													: 'No Action Needed'
											}}
										</span>
									</div>
									<div
										v-else-if="project.needsAction"
										class="activity-status text-warning"
									>
										<i class="fas fa-exclamation-circle me-2"></i>
										Action Required
									</div>
								</div>
								<dl class="row mb-0">
									<dt class="col-sm-4">PI:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.principalInvestigator) }}
									</dd>

									<dt class="col-sm-4">Coordinator:</dt>
									<dd class="col-sm-8">{{ getUserName(project.coordinator) }}</dd>

									<dt class="col-sm-4">Statistician:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.statistician) }}
									</dd>
								</dl>
							</div>
							<div class="card-footer bg-transparent">
								<div class="d-flex gap-2">
									<router-link
										:to="`/research-portal/${project.id}`"
										class="btn btn-outline-primary btn-sm"
									>
										View Details
									</router-link>
									<router-link
										:to="`/research-portal/${project.id}/edit`"
										class="btn btn-outline-secondary btn-sm"
									>
										<i class="fas fa-edit"></i> Edit
									</router-link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- Regular User View -->
			<template v-else>
				<div v-if="myProjects.length === 0" class="alert alert-info">
					You are not currently assigned to any research projects.
				</div>
				<div v-else class="row g-4">
					<div v-for="project in myProjects" :key="project.id" class="col-md-6 col-lg-4">
						<div class="card h-100">
							<div class="card-body">
								<h3 class="h5 card-title mb-3">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3 d-flex align-items-center gap-3">
									<span
										class="status-badge"
										:class="getStatusClass(project.status)"
									>
										{{ project.status }}
									</span>
									<div
										v-if="project.needsAction"
										class="activity-status text-warning"
									>
										<i class="fas fa-exclamation-circle me-2"></i>
										Action Required
									</div>
								</div>
								<dl class="row mb-0">
									<dt class="col-sm-4">PI:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.principalInvestigator) }}
									</dd>

									<dt class="col-sm-4">Coordinator:</dt>
									<dd class="col-sm-8">{{ getUserName(project.coordinator) }}</dd>

									<dt class="col-sm-4">Statistician:</dt>
									<dd class="col-sm-8">
										{{ getUserName(project.statistician) }}
									</dd>
								</dl>
							</div>
							<div class="card-footer bg-transparent">
								<router-link
									:to="`/research-portal/${project.id}`"
									class="btn btn-outline-primary btn-sm"
								>
									View Details
								</router-link>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useResearchStore } from '@/stores/research';
import { useThemeStore } from '@/stores/theme';
import { useToast } from 'vue-toastification';
import { onMounted, onBeforeUnmount } from 'vue';

export default {
	name: 'ResearchPortal',
	data() {
		return {
			activeDropdown: null,
			statusOptions: ['Intake', 'Pre-IRB', 'IRB Review', 'Post-IRB'],
		};
	},
	computed: {
		...mapState(useAuthStore, ['isStaff', 'user']),
		...mapState(useResearchStore, ['allProjects', 'myProjects']),
		...mapState(useThemeStore, ['isDarkMode']),
	},
	setup() {
		const handleOutsideClick = (event) => {
			const dropdowns = document.querySelectorAll('.status-badge');
			let clickedOutside = true;

			dropdowns.forEach((dropdown) => {
				if (dropdown.contains(event.target)) {
					clickedOutside = false;
				}
			});

			if (clickedOutside) {
				const store = useResearchStore();
				if (store.activeDropdown !== null) {
					store.setActiveDropdown(null);
				}
			}
		};

		onMounted(() => {
			document.addEventListener('click', handleOutsideClick);
		});

		onBeforeUnmount(() => {
			document.removeEventListener('click', handleOutsideClick);
		});
	},
	methods: {
		...mapActions(useResearchStore, [
			'fetchProjects',
			'getUserName',
			'updateProjectStatus',
			'updateProjectActivity',
			'setActiveDropdown',
		]),
		getStatusClass(status) {
			const classes = {
				'In Progress': 'status-primary',
				Completed: 'status-success',
				'On Hold': 'status-warning',
				Cancelled: 'status-danger',
			};
			return classes[status] || 'status-primary';
		},
		toggleStatusDropdown(projectId) {
			if (this.isStaff) {
				event.stopPropagation();
				this.activeDropdown = this.activeDropdown === projectId ? null : projectId;
				this.setActiveDropdown(this.activeDropdown);
			}
		},
		async handleStatusUpdate(projectId, newStatus) {
			try {
				await this.updateProjectStatus(projectId, newStatus);
				useToast().success('Project status updated successfully');
				this.activeDropdown = null;
				this.setActiveDropdown(null);
			} catch (error) {
				useToast().error('Failed to update project status');
			}
		},
		async handleActivityToggle(projectId, needsAction) {
			try {
				await this.updateProjectActivity(projectId, needsAction);
				useToast().success(
					`Project marked as ${needsAction ? 'needing action' : 'no action needed'}`
				);
			} catch (error) {
				useToast().error('Failed to update project activity status');
			}
		},
	},
	async created() {
		await this.fetchProjects(this.isStaff, this.user.uid);
	},
};
</script>

<style lang="scss" scoped>
.research-portal {
	padding-top: calc(2rem + var(--navbar-height));
	background: linear-gradient(135deg, var(--light-2) 0%, var(--light-accent) 100%);

	&.dark {
		background: var(--dark-3) !important;
		color: #ffffff;

		.card {
			background-color: #2c3034;
			border-color: #444;
		}

		.status-dropdown {
			background-color: #2c3034;
			border-color: #444;

			.status-option {
				color: #ffffff;

				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
				}

				&.active {
					background-color: rgba(255, 255, 255, 0.2);
				}
			}
		}
	}
}

.card {
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.status-badge {
	display: inline-flex;
	align-items: center;
	padding: 0.5em 1em;
	border-radius: 4px;
	font-size: 0.875rem;
	color: white;
	cursor: pointer;
	position: relative;
	user-select: none;

	i {
		font-size: 0.75rem;
	}

	&.status-primary {
		background-color: var(--bs-primary);
	}
	&.status-success {
		background-color: var(--bs-success);
	}
	&.status-warning {
		background-color: var(--bs-warning);
	}
	&.status-danger {
		background-color: var(--bs-danger);
	}
	&.status-secondary {
		background-color: var(--bs-secondary);
	}
}

.status-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	min-width: 150px;
	background: white;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	overflow: hidden;
}

.status-option {
	padding: 0.5rem 1rem;
	cursor: pointer;
	transition: background-color 0.2s;
	color: #212529;

	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	&.active {
		background-color: rgba(0, 0, 0, 0.1);
	}
}

.activity-toggle {
	display: flex;
	align-items: center;
}

.switch {
	position: relative;
	display: inline-block;
	width: 39px;
	height: 22.1px;

	input {
		opacity: 0;
		width: 0;
		height: 0;

		&:checked + .slider {
			background-color: var(--bs-warning);
		}

		&:checked + .slider:before {
			transform: translateX(15px);
		}
	}
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.4s;

	&:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 2px;
		background-color: white;
		transition: 0.4s;
	}

	&.round {
		border-radius: 34px;

		&:before {
			border-radius: 50%;
		}
	}
}

.activity-label {
	font-size: 0.875rem;
	font-weight: 500;
}

.activity-status {
	font-size: 0.875rem;
	font-weight: 500;
}
</style>
