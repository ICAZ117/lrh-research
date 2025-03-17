<template>
	<div class="home">
		<!-- Hero Section -->
		<section class="hero" :class="{ dark: isDarkMode }">
			<div class="container">
				<div class="row align-items-center min-vh-100">
					<div class="col-lg-6" data-aos="fade-right">
						<h1 class="display-4 fw-bold mb-4">
							Advancing Healthcare Through Research
						</h1>
						<p class="lead mb-4">
							Join us in our mission to improve patient care through innovative
							research and collaboration.
						</p>
						<router-link to="/research-portal" class="btn btn-primary btn-lg me-3">
							Explore Research
						</router-link>
						<router-link to="/auth/register" class="btn btn-outline-primary btn-lg">
							Join Our Team
						</router-link>
					</div>
					<div class="col-lg-6" data-aos="fade-left">
						<img
							src="@/assets/images/hero-image.jpg"
							alt="Research"
							class="img-fluid rounded-3 shadow-lg"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Explore Tools Section -->
		<section class="py-5" data-aos="fade-up">
			<div class="container">
				<h2 class="text-center mb-5">Explore Our Tools</h2>
				<div class="row g-4">
					<div class="col-md-6">
						<div class="card h-100 shadow-sm hover-card">
							<div class="card-body text-center p-5">
								<i class="fas fa-book fa-3x mb-4 text-primary"></i>
								<h3>Codebook</h3>
								<p>
									Access our comprehensive research codebook for standardized data
									collection and analysis.
								</p>
								<router-link to="/codebook" class="btn btn-outline-primary">
									Learn More
								</router-link>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="card h-100 shadow-sm hover-card">
							<div class="card-body text-center p-5">
								<i class="fas fa-flask fa-3x mb-4 text-primary"></i>
								<h3>Research Portal</h3>
								<p>
									Manage your research projects, collaborate with team members,
									and track progress.
								</p>
								<router-link to="/research-portal" class="btn btn-outline-primary">
									Enter Portal
								</router-link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Research Process Section -->
		<section class="py-5 bg-light" :class="{ 'bg-dark': isDarkMode }" data-aos="fade-up">
			<div class="container">
				<h2 class="text-center mb-5">Our Research Process</h2>
				<div class="row g-4">
					<div class="col-md-3" v-for="(step, index) in researchSteps" :key="index">
						<div class="process-card text-center">
							<div class="process-icon mb-3">
								<i :class="step.icon"></i>
							</div>
							<h4>{{ step.title }}</h4>
							<p>{{ step.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Team Section -->
		<section class="py-5" data-aos="fade-up">
			<div class="container">
				<h2 class="text-center mb-5">Meet Our Team</h2>
				<Carousel :items-to-show="3" :wrap-around="true">
					<Slide v-for="member in teamMembers" :key="member.id">
						<div class="team-card mx-2">
							<img
								:src="member.image"
								:alt="member.name"
								class="rounded-circle mb-3"
							/>
							<h4>{{ member.name }}</h4>
							<p class="text-muted">{{ member.role }}</p>
						</div>
					</Slide>
					<template #addons>
						<Navigation />
						<Pagination />
					</template>
				</Carousel>
			</div>
		</section>

		<!-- Contact Section -->
		<section id="contact" class="py-5 contact-section" data-aos="fade-up">
			<div class="container">
				<div class="row align-items-center">
					<div class="col-lg-6">
						<h2 class="mb-4">Get in Touch</h2>
						<form @submit.prevent="handleContact">
							<div class="mb-3">
								<input
									type="text"
									class="form-control"
									placeholder="Your Name"
									v-model="contactForm.name"
								/>
							</div>
							<div class="mb-3">
								<input
									type="email"
									class="form-control"
									placeholder="Your Email"
									v-model="contactForm.email"
								/>
							</div>
							<div class="mb-3">
								<textarea
									class="form-control"
									rows="4"
									placeholder="Your Message"
									v-model="contactForm.message"
								></textarea>
							</div>
							<button type="submit" class="btn btn-primary">Send Message</button>
						</form>
					</div>
					<div class="col-lg-6">
						<div class="contact-info ps-lg-5">
							<h3>Contact Information</h3>
							<p>
								<i class="fas fa-map-marker-alt me-2"></i>1324 Lakeland Hills Blvd,
								Lakeland, FL 33805
							</p>
							<p><i class="fas fa-phone me-2"></i>(863) 687-1100</p>
							<p><i class="fas fa-envelope me-2"></i>research@lrh.org</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { mapState } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import AOS from 'aos'

export default {
	name: 'Home',
	components: {
		Carousel,
		Slide,
		Pagination,
		Navigation,
	},
	data() {
		return {
			researchSteps: [
				{
					icon: 'fas fa-lightbulb fa-2x text-primary',
					title: 'Ideation',
					description: 'Development of research concepts and hypotheses',
				},
				{
					icon: 'fas fa-clipboard-check fa-2x text-primary',
					title: 'Planning',
					description: 'Detailed protocol development and approval',
				},
				{
					icon: 'fas fa-vial fa-2x text-primary',
					title: 'Execution',
					description: 'Data collection and analysis',
				},
				{
					icon: 'fas fa-chart-line fa-2x text-primary',
					title: 'Publication',
					description: 'Sharing results with the scientific community',
				},
			],
			teamMembers: [
				{
					id: 1,
					name: 'Dr. Sarah Johnson',
					role: 'Research Director',
					image: '@/assets/images/team/sarah.jpg',
				},
				{
					id: 2,
					name: 'Dr. Michael Chen',
					role: 'Lead Researcher',
					image: '@/assets/images/team/michael.jpg',
				},
				{
					id: 3,
					name: 'Dr. Emily Rodriguez',
					role: 'Clinical Coordinator',
					image: '@/assets/images/team/emily.jpg',
				},
				{
					id: 4,
					name: 'Dr. James Wilson',
					role: 'Statistical Analyst',
					image: '@/assets/images/team/james.jpg',
				},
			],
			contactForm: {
				name: '',
				email: '',
				message: '',
			},
		}
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
	},
	methods: {
		handleContact() {
			// Implement contact form submission logic
			console.log('Contact form submitted:', this.contactForm)
		},
	},
	mounted() {
		// console.log('HOME VIEW COMPONENT')

		AOS.init({
			duration: 1000,
		})
	},
}
</script>

<style lang="scss" scoped>
.hero {
	position: relative;
	padding: 100px 0;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

	&.dark {
		background: linear-gradient(135deg, #343a40 0%, #212529 100%);
	}
}

.hover-card {
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.process-card {
	padding: 2rem;
	background: white;
	border-radius: 10px;
	box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.team-card {
	text-align: center;
	padding: 1rem;

	img {
		width: 150px;
		height: 150px;
		object-fit: cover;
	}
}

.contact-section {
	background-attachment: fixed;
	background-size: cover;
	background-position: center;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.9);
		z-index: 1;
	}

	.container {
		position: relative;
		z-index: 2;
	}
}
</style>