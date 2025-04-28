<template>
	<div class="project-details min-vh-100" :class="{ dark: isDarkMode }">
		<div class="container pb-5">
			<div v-if="loading" class="text-center py-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>

			<template v-else-if="currentProject">
				<div class="d-flex justify-content-between align-items-start mb-4">
					<div>
						<h1 class="mb-2">{{ currentProject.title }}</h1>
						<span class="badge" :class="getStatusClass(currentProject.status)">
							{{ currentProject.status }}
						</span>
					</div>
					<router-link to="/research-portal" class="btn btn-outline-primary">
						<i class="fas fa-arrow-left me-2"></i>Back to Portal
					</router-link>
				</div>

				<div class="row">
					<div class="col-lg-8">
						<div class="card mb-4">
							<div class="card-body">
								<h2 class="h4 mb-3">Project Description</h2>
								<p>{{ currentProject.description }}</p>
							</div>
						</div>
					</div>

					<div class="col-lg-4">
						<div class="card mb-4">
							<div class="card-body">
								<h2 class="h4 mb-3">Project Team</h2>
								<dl>
									<dt>Principal Investigator</dt>
									<dd>{{ getUserName(currentProject.principalInvestigator) }}</dd>

									<dt>Clinical Research Coordinator</dt>
									<dd>{{ getUserName(currentProject.coordinator) }}</dd>

									<dt>Statistician</dt>
									<dd>{{ getUserName(currentProject.statistician) }}</dd>

									<dt>Other Researchers</dt>
									<dd>
										<ul class="list-unstyled mb-0">
											<li
												v-for="userId in currentProject.researchers"
												:key="userId"
											>
												{{ getUserName(userId) }}
											</li>
										</ul>
									</dd>
								</dl>
							</div>
						</div>

						<div class="card">
							<div class="card-body">
								<h2 class="h4 mb-3">Project Details</h2>
								<dl class="mb-0">
									<dt>Created</dt>
									<dd>{{ formatDate(currentProject.createdAt) }}</dd>

									<dt>Last Updated</dt>
									<dd>{{ formatDate(currentProject.updatedAt) }}</dd>

									<dt>Project ID</dt>
									<dd class="mb-0">{{ currentProject.id }}</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</template>

			<div v-else class="alert alert-danger">
				Project not found or you don't have access to view it.
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useResearchStore } from '@/stores/research';
import { useThemeStore } from '@/stores/theme';

export default {
	name: 'ProjectDetails',
	computed: {
		...mapState(useResearchStore, ['currentProject', 'loading']),
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		...mapActions(useResearchStore, ['fetchProject', 'getUserName']),
		getStatusClass(status) {
			const classes = {
				'In Progress': 'bg-primary',
				Completed: 'bg-success',
				'On Hold': 'bg-warning',
				Cancelled: 'bg-danger',
			};
			return classes[status] || 'bg-secondary';
		},
		formatDate(dateString) {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		},
	},
	async created() {
		await this.fetchProject(this.$route.params.id);
	},
};
</script>

<style lang="scss" scoped>
.project-details {
	padding-top: calc(2rem + var(--navbar-height));

	&.dark {
		background-color: #1a1a1a;
		color: #ffffff;

		.card {
			background-color: #2c3034;
			border-color: #444;
		}
	}
}

.badge {
	font-size: 0.875rem;
	padding: 0.5em 1em;
}

dt {
	font-weight: 600;
	margin-top: 1rem;

	&:first-child {
		margin-top: 0;
	}
}

dd {
	margin-bottom: 0.5rem;

	&:last-child {
		margin-bottom: 0;
	}
}
</style>
