<template>
	<footer class="footer">
		<CursorEffect class="mt-auto py-5" :isDarkMode="isDarkMode">
			<div class="container">
				<div class="row">
					<div class="col-md-4 mb-4">
						<h5>About LRH Research</h5>
						<p>
							Advancing healthcare through innovative research and collaboration at
							Lakeland Regional Health.
						</p>
					</div>
					<div class="col-md-4 mb-4">
						<h5>Quick Links</h5>
						<ul class="list-unstyled">
							<li>
								<router-link to="/research-portal">Research Portal</router-link>
							</li>
							<li><router-link to="/codebook">Codebook</router-link></li>
							<li><a href="#contact">Contact Us</a></li>
						</ul>
					</div>
					<div class="col-md-4 mb-4">
						<h5>Connect With Us</h5>
						<div class="social-icons">
							<a
								href="https://www.facebook.com/LakelandRegionalHealth/"
								target="_blank"
								class="me-3"
								><i class="fab fa-facebook"></i
							></a>
							<a href="https://x.com/lkldregional" target="_blank" class="me-3"
								><i class="fab fa-x-twitter"></i
							></a>
							<a
								href="https://www.linkedin.com/company/mylrh/"
								target="_blank"
								class="me-3"
								><i class="fab fa-linkedin"></i
							></a>
							<a
								href="https://www.instagram.com/lakelandregionalhealth"
								target="_blank"
								class="me-3"
								><i class="fab fa-instagram"></i
							></a>
						</div>
					</div>
				</div>
				<hr />
				<div class="text-center">
					<p>&copy; {{ currentYear }} Lakeland Regional Health. All rights reserved.</p>
					<p>
						Powered by
						<a href="https://icaz117.web.app" target="_blank">Cazalas Technologies</a>
					</p>
				</div>
			</div>
		</CursorEffect>
	</footer>
</template>

<script>
import { mapState } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import CursorEffect from '../CursorEffect.vue';

export default {
	name: 'AppFooter',
	components: {
		CursorEffect,
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
		currentYear() {
			return new Date().getFullYear();
		},
	},
};
</script>

<style lang="scss" scoped>
.footer {
	transition: background-color 0.3s ease;

	a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.3s ease;

		&:hover {
			opacity: 0.8;
		}
	}

	.social-icons {
		font-size: 1.5rem;
	}
}
</style>
