<template>
	<div class="home">
		<!-- Hero Section -->
		<section class="hero">
			<div class="overlay"></div>
			<div class="container" style="z-index: 2">
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
						<router-link to="/auth/register" class="btn btn-outline-white btn-lg">
							Join Our Team
						</router-link>
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
						<CursorEffect
							class="card h-100 shadow-sm hover-card"
							:isDarkMode="isDarkMode"
						>
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
						</CursorEffect>
					</div>
					<div class="col-md-6">
						<CursorEffect
							class="card h-100 shadow-sm hover-card"
							:isDarkMode="isDarkMode"
						>
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
						</CursorEffect>
					</div>
				</div>
			</div>
		</section>

		<!-- Research Process Section -->
		<section data-aos="fade-up">
			<div class="">
				<CursorEffect :isDarkMode="isDarkMode">
					<div class="py-5 container">
						<h2 class="text-center mb-5">Our Research Process</h2>
						<div class="row g-4">
							<div
								class="col-md-3"
								v-for="(step, index) in researchSteps"
								:key="index"
							>
								<div
									class="process-card text-center bg-superlight"
									:class="{ 'bg-superdark': isDarkMode }"
								>
									<div class="process-icon mb-3">
										<i :class="step.icon"></i>
									</div>
									<h4>{{ step.title }}</h4>
									<p>{{ step.description }}</p>
								</div>
							</div>
						</div>
					</div>
				</CursorEffect>
			</div>
		</section>

		<!-- Team Section -->
		<section class="py-5" data-aos="fade-up">
			<div class="container">
				<h2 class="text-center mb-5">Meet Our Team</h2>
				<Carousel
					:items-to-show="4"
					:items-to-scroll="4"
					:wrap-around="true"
					:snap-align="'center-even'"
				>
					<Slide v-for="member in teamMembers" :key="member.id">
						<CursorEffect class="card" style="width: 18rem" :isDarkMode="isDarkMode">
							<img
								v-if="member.image"
								:src="member.image"
								class="card-img-top"
								alt="..."
							/>
							<img
								v-else
								src="../assets/images/team/Member.svg"
								class="card-img-top"
								alt="..."
							/>
							<div class="card-body">
								<h5 class="card-title">{{ member.name }}</h5>
								<h6>{{ member.role }}</h6>
								<p class="card-text">
									Some quick example text to build on the card title and make up
									the bulk of the card's content.
								</p>
								<a href="#" class="btn btn-primary">Go somewhere</a>
							</div>
						</CursorEffect>
					</Slide>
					<template #addons>
						<Navigation />
					</template>
				</Carousel>
			</div>
		</section>

		<!-- Contact Section -->
		<section id="contact" data-aos="fade-up">
			<div class="contact-section pb-5 position-relative container">
				<CursorEffect :isDarkMode="isDarkMode" style="border-radius: 2rem">
					<div class="p-4">
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
									<button type="submit" class="btn btn-primary">
										Send Message
									</button>
								</form>
							</div>
							<div class="col-lg-6">
								<div class="contact-info ps-lg-5">
									<h3>Contact Information</h3>
									<p>
										<i class="fas fa-map-marker-alt me-2"></i>1324 Lakeland
										Hills Blvd, Lakeland, FL 33805
									</p>
									<p><i class="fas fa-phone me-2"></i>(863) 687-1100</p>
									<p><i class="fas fa-envelope me-2"></i>research@lrh.org</p>
								</div>
							</div>
						</div>
					</div>
				</CursorEffect>
			</div>
		</section>
	</div>
</template>

<script>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/carousel.css'
import { mapState } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import AOS from 'aos'
import CursorEffect from '@/components/CursorEffect.vue'

export default {
	name: 'Home',
	components: {
		Carousel,
		Slide,
		// Pagination,
		Navigation,
		CursorEffect,
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
					description: 'Data collection and statistical analysis',
				},
				{
					icon: 'fas fa-chart-line fa-2x text-primary',
					title: 'Publication',
					description: 'Sharing results with the scientific community',
				},
			],
			teamMembers: [
				{
					tier: 1,
					name: 'Andrew Bugajski',
					role: 'Associate Vice President of Research and Sponsored Studies',
					image: '../assets/images/team/AndrewBugajski.jpg',
				},
				{
					tier: 2,
					name: 'Carmen Mitchell',
					role: 'Director of Research Business Operations',
					// image: '@/assets/images/team/CarmenMitchell.jpg',
				},
				{
					tier: 3,
					name: 'Kellcee Johnson',
					role: 'Manager of Research & Sponsored Studies',
					image: '@/assets/images/team/KellceeJohnson.jpg',
				},
				{
					tier: 4,
					name: 'Eden Crowsey',
					role: 'Biostatistician & Research Methodologist',
					image: '@/assets/images/team/EdenCrowsey.jpg',
				},
				{
					tier: 4,
					name: 'Walter Wills',
					role: 'Biostatistician & Research Methodologist',
					// image: '@/assets/images/team/WalterWills.jpg',
				},
				{
					tier: 4,
					name: 'Jackqueline Hogan',
					role: 'Research Financial Analyst',
					// image: '@/assets/images/team/JackquelineHogan.jpg',
				},
				{
					tier: 4,
					name: 'Anna Daly',
					role: 'Clinical Research Coordinator',
					// image: '@/assets/images/team/AnnaDaly.jpg',
				},
				{
					tier: 4,
					name: 'Brandon Montes',
					role: 'Clinical Research Coordinator',
					image: '@/assets/images/team/BrandonMontes.jpg',
				},
				{
					tier: 4,
					name: 'Lauren Mileythreatt',
					role: 'Clinical Research Coordinator',
					// image: '@/assets/images/team/LaurenMileythreatt.jpg',
				},
				{
					tier: 4,
					name: 'Dana Crowder',
					role: 'Clinical Research Coordinator',
					// image: '@/assets/images/team/DanaCrowder.jpg',
				},
				{
					tier: 4,
					name: 'Maria Kratz',
					role: 'Clinical Research Coordinator',
					// image: '@/assets/images/team/MariaKratz.jpg',
				},
				{
					tier: 5,
					name: 'Meghann Nelson',
					role: 'Research Assistant',
					// image: '@/assets/images/team/MeghannNelson.jpg',
				},
				{
					tier: 5,
					name: 'Joshua Loute',
					role: 'Research Assistant',
					image: '@/assets/images/team/JoshuaLoute.jpg',
				},
				{
					tier: 5,
					name: 'Kristen McGraw',
					role: 'Research Assistant',
					// image: '@/assets/images/team/KristenMcGraw.jpg',
				},
				{
					tier: 5,
					name: 'Jenniffer Jaimes',
					role: 'Research Assistant',
					// image: '@/assets/images/team/JennifferJaimes.jpg',
				},
				{
					tier: 5,
					name: 'Brittany Colins',
					role: 'Research Assistant',
					image: '@/assets/images/team/BrittanyColins.jpg',
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
			once: true,
		})
	},
}
</script>

<style lang="scss" scoped>
.hero {
	position: relative;
	color: white;
	background-color: transparent;

	&::before {
		content: '';
		position: absolute;
		top: 96px;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: url('../assets/images/hero-image.jpg');
		background-size: cover;
		background-position: center top;
		background-repeat: no-repeat;
		z-index: 0;
	}

	& > .overlay {
		background: linear-gradient(
			180deg,
			rgba(var(--LRH-primary-rgb), 0.8) 0%,
			rgba(0, 0, 0, 0.2) 100%
		);
		background-color: transparent;
		z-index: 0;
		content: '';
		position: absolute;
		top: 96px;
		left: 0;
		right: 0;
		bottom: 0;
		transition: background 0.3s ease;
	}
}

.dark-mode .hero > .overlay {
	background: linear-gradient(
		180deg,
		rgba(var(--LRH-primary-rgb), 0.8) 0%,
		rgba(0, 0, 0, 0.5) 100%
	);
	background-color: transparent;
	z-index: 0;
	content: '';
	position: absolute;
	top: 96px;
	left: 0;
	right: 0;
	bottom: 0;
	transition: background 0.3s ease;
}

.hover-card {
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.bg-light .bg-light,
.bg-superlight {
	background-color: white !important;
}

.bg-dark .bg-dark,
.bg-superdark {
	background-color: #1a1a1a !important;
}

.process-card {
	padding: 2rem;
	border-radius: 10px;
	box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-5px);
	}
}

.contact-section .container {
	position: relative;
	z-index: 2;
	border-radius: 2rem;
	overflow: hidden; /* Keep the effect inside the container */
}

/* Make sure content stays above the cursor effect */
.contact-section .container .row {
	position: relative;
	z-index: 2;
}

.card {
	background-color: transparent;
}
</style>
