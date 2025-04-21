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
								<h3 class="h5 card-title">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3">
									<span class="badge" :class="getStatusClass(project.status)">
										{{ project.status }}
									</span>
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
								<h3 class="h5 card-title">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3">
									<span class="badge" :class="getStatusClass(project.status)">
										{{ project.status }}
									</span>
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

			<!-- Regular User View -->
			<template v-else>
				<div v-if="myProjects.length === 0" class="alert alert-info">
					You are not currently assigned to any research projects.
				</div>
				<div v-else class="row g-4">
					<div v-for="project in myProjects" :key="project.id" class="col-md-6 col-lg-4">
						<div class="card h-100">
							<div class="card-body">
								<h3 class="h5 card-title">{{ project.title }}</h3>
								<p class="card-text">{{ project.description }}</p>
								<div class="mb-3">
									<span class="badge" :class="getStatusClass(project.status)">
										{{ project.status }}
									</span>
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

export default {
	name: 'ResearchPortal',
	computed: {
		...mapState(useAuthStore, ['isStaff', 'user']),
		...mapState(useResearchStore, ['allProjects', 'myProjects']),
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		...mapActions(useResearchStore, ['fetchProjects', 'getUserName']),
		getStatusClass(status) {
			const classes = {
				'In Progress': 'bg-primary',
				Completed: 'bg-success',
				'On Hold': 'bg-warning',
				Cancelled: 'bg-danger',
			};
			return classes[status] || 'bg-secondary';
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

	&.dark {
		background-color: #1a1a1a;
		color: #ffffff;

		.card {
			background-color: #2c3034;
			border-color: #444;
		}
	}
}

.card {
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.badge {
	font-size: 0.875rem;
	padding: 0.5em 1em;
}
</style>
