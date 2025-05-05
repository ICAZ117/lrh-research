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
						<div class="d-flex align-items-center gap-3">
							<span class="badge" :class="getStatusClass(currentProject.status)">
								{{ currentProject.status }}
							</span>
							<span
								class="badge"
								:class="currentProject.needsAction ? 'bg-warning' : 'bg-success'"
							>
								{{
									currentProject.needsAction
										? 'Action Required'
										: 'No Action Needed'
								}}
							</span>
						</div>
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

						<!-- Template Files Section -->
						<div v-if="currentProject.status === 'Intake'" class="card mb-4">
							<div class="card-body">
								<h2 class="h4 mb-3">Template Files</h2>
								<div v-if="projectFiles[currentProject.type]?.length">
									<ul class="list-group">
										<li
											v-for="(file, index) in projectFiles[
												currentProject.type
											]"
											:key="index"
											class="list-group-item d-flex justify-content-between align-items-center"
										>
											<span>{{ file.name }}</span>
											<a
												:href="file.url"
												target="_blank"
												class="btn btn-sm btn-primary"
											>
												<i class="fas fa-download me-2"></i>Download
											</a>
										</li>
									</ul>
								</div>
								<div v-else class="alert alert-info">
									No template files available for this project type.
								</div>
							</div>
						</div>

						<!-- Project Timeline Section -->
						<div class="card">
							<div class="card-body">
								<h2 class="h4 mb-3">Project Timeline</h2>

								<!-- Comment Form for Staff -->
								<div v-if="isStaff" class="mb-4">
									<RichTextEditor
										v-model="newComment"
										placeholder="Add a comment..."
									/>
									<div class="mt-2 text-end">
										<button
											class="btn btn-primary"
											@click="handleAddComment"
											:disabled="!newComment.trim()"
										>
											Add Comment
										</button>
									</div>
								</div>

								<!-- Comments Timeline -->
								<div class="timeline">
									<div
										v-for="comment in projectComments"
										:key="comment.id"
										class="timeline-item"
										:class="{ 'system-event': comment.type === 'system' }"
									>
										<div class="timeline-marker"></div>
										<div class="timeline-content">
											<div
												v-if="comment.type === 'system'"
												class="system-message"
											>
												<i class="fas fa-info-circle me-2"></i>
												<strong>{{ comment.action }}</strong>
												<p v-if="comment.details" class="mb-0 mt-1">
													{{ comment.details }}
												</p>
											</div>
											<div v-else>
												<RichTextEditor
													:model-value="comment.content"
													:read-only="true"
												/>
											</div>
											<small class="text-muted">
												{{ formatDate(comment.timestamp) }}
											</small>
										</div>
									</div>
								</div>
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
									<dt>Project Type</dt>
									<dd>{{ currentProject.type }}</dd>

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
import { useAuthStore } from '@/stores/auth';
import RichTextEditor from '@/components/RichTextEditor.vue';
import { useToast } from 'vue-toastification';

export default {
	name: 'ProjectDetails',
	components: {
		RichTextEditor,
	},
	data() {
		return {
			newComment: '',
		};
	},
	computed: {
		...mapState(useResearchStore, [
			'currentProject',
			'projectFiles',
			'projectComments',
			'loading',
		]),
		...mapState(useThemeStore, ['isDarkMode']),
		...mapState(useAuthStore, ['isStaff']),
	},
	methods: {
		...mapActions(useResearchStore, [
			'fetchProject',
			'fetchProjectFiles',
			'fetchProjectComments',
			'addProjectComment',
			'getUserName',
		]),
		getStatusClass(status) {
			const classes = {
				'In Progress': 'bg-primary',
				Completed: 'bg-success',
				'On Hold': 'bg-warning',
				Cancelled: 'bg-danger',
			};
			return classes[status] || 'bg-primary';
		},
		formatDate(dateString) {
			if (!dateString) return 'N/A';
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		},
		async handleAddComment() {
			try {
				await this.addProjectComment(this.currentProject.id, {
					content: this.newComment,
					type: 'user',
				});
				this.newComment = '';
				useToast().success('Comment added successfully');
			} catch (error) {
				useToast().error('Failed to add comment');
			}
		},
	},
	async created() {
		const projectId = this.$route.params.id;
		await this.fetchProject(projectId);
		if (this.currentProject) {
			await Promise.all([
				this.fetchProjectFiles(this.currentProject.type),
				this.fetchProjectComments(projectId),
			]);
		}
	},
};
</script>

<style lang="scss" scoped>
.project-details {
	padding-top: calc(2rem + var(--navbar-height));
	background: linear-gradient(135deg, var(--light-2) 0%, var(--light-accent) 100%);

	&.dark {
		background: var(--dark-3) !important;
		color: #ffffff;

		.card {
			background-color: #2c3034;
			border-color: #444;
		}

		.list-group-item {
			background-color: #2c3034;
			border-color: #444;
			color: #fff;
		}

		.timeline-item {
			border-color: #444;

			&.system-event {
				background-color: rgba(255, 255, 255, 0.05);
			}
		}

		.timeline-marker {
			background-color: #444;
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

.timeline {
	position: relative;
	padding: 1rem 0;
}

.timeline-item {
	position: relative;
	padding: 1rem 1rem 1rem 2rem;
	border-left: 2px solid #dee2e6;
	margin-bottom: 1rem;

	&:last-child {
		margin-bottom: 0;
	}

	&.system-event {
		background-color: rgba(0, 0, 0, 0.02);
	}
}

.timeline-marker {
	position: absolute;
	left: -5px;
	top: 1.5rem;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: #dee2e6;
}

.system-message {
	color: #6c757d;
}
</style>
