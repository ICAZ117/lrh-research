<template>
	<div class="codebook-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- Search Section -->
		<section class="search-section" :class="{ dark: isDarkMode }">
			<div class="container">
				<div class="row justify-content-center">
					<div class="col-lg-8">
						<h1 class="text-center mb-4">Research Codebook</h1>
						<div class="search-container">
							<div class="search-wrapper">
								<div class="search-field">
									<i class="pi pi-search"></i>
									<input
										type="text"
										class="search-input"
										placeholder="Search by ID, name, category, description..."
										v-model="searchQuery"
										@input="handleSearch"
									/>
									<button
										v-if="searchQuery"
										class="clear-search"
										@click="clearSearch"
									>
										<i class="pi pi-times"></i>
									</button>
								</div>
								<div class="search-filters">
									<label v-for="field in searchFields" :key="field.value">
										<input
											type="checkbox"
											v-model="activeFilters"
											:value="field.value"
										/>
										{{ field.label }}
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Results Section -->
		<section class="results-section">
			<div class="container">
				<!-- Results Stats -->
				<div class="results-stats mb-4">
					<div class="stats-item">
						<span class="stats-value">{{ totalResults }}</span>
						<span class="stats-label">Total Variables</span>
					</div>
					<div class="stats-item" v-if="searchQuery">
						<span class="stats-value">{{ filteredResults.length }}</span>
						<span class="stats-label">Matching Results</span>
					</div>
					<div class="refresh-button">
						<button class="btn btn-outline-primary" @click="forceRefreshCodebook">
							<i class="pi pi-refresh"></i> Refresh Codebook
						</button>
					</div>
					<div class="theme-toggle">
						<button class="btn btn-icon" @click="toggleTheme">
							<i class="pi" :class="isDarkMode ? 'pi-sun' : 'pi-moon'"></i>
						</button>
					</div>
				</div>

				<!-- Loading indicator -->
				<div v-if="isLoading" class="text-center my-5">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					<p class="mt-2">Loading codebook data...</p>
				</div>

				<!-- Results Table -->
				<div v-else>
					<!-- If searching, show flat list of results -->
					<div v-if="searchQuery" class="results-table-wrapper">
						<table class="results-table">
							<thead>
								<tr>
									<th
										v-for="(column, colIndex) in columns"
										:key="column.field"
										@click="sortBy(column.field)"
										:class="{
											sortable: column.sortable,
											sorted: sortField === column.field,
										}"
										:style="{ width: columnWidths[colIndex] }"
									>
										<div class="th-content">
											<span class="th-text">{{ column.header }}</span>
											<i
												v-if="column.sortable"
												class="pi"
												:class="getSortIcon(column.field)"
											>
											</i>
											<div
												class="column-resizer"
												@mousedown="startResize($event, colIndex)"
											></div>
										</div>
									</th>
									<th v-if="isAuthenticated" class="actions-column">Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="(item, index) in sortedResults"
									:key="index"
									:class="{ highlight: isHighlighted(item) }"
								>
									<td>{{ item.ID || '-' }}</td>
									<td>{{ item.category }}</td>
									<td>{{ item.Variable }}</td>
									<td class="description-cell">{{ item.VariableDescription }}</td>
									<td>
										<span
											class="type-badge"
											:class="getTypeBadgeClass(item.Type)"
											>{{ item.Type || 'Unknown' }}</span
										>
									</td>
									<td v-if="isAuthenticated" class="actions-column">
										<button class="btn btn-icon" @click="editVariable(item)">
											<i class="pi pi-pencil"></i>
										</button>
										<button
											class="btn btn-icon text-danger"
											@click="deleteVariable(item)"
										>
											<i class="pi pi-trash"></i>
										</button>
									</td>
								</tr>
								<tr v-if="sortedResults.length === 0">
									<td
										:colspan="
											isAuthenticated ? columns.length + 1 : columns.length
										"
										class="text-center py-4"
									>
										No variables found. Try adjusting your search.
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- If not searching, show categories -->
					<div v-else class="categories-wrapper">
						<div v-if="categories.length === 0" class="text-center py-4">
							No categories found in codebook.
						</div>

						<div
							v-for="(category, index) in categories"
							:key="index"
							class="category-container"
						>
							<div
								class="category-header"
								@click="toggleCategory(category)"
								:class="{ expanded: expandedCategories.includes(category) }"
							>
								<div class="category-name">
									<i
										class="pi"
										:class="
											expandedCategories.includes(category)
												? 'pi-chevron-down'
												: 'pi-chevron-right'
										"
									></i>
									{{ category }}
								</div>
								<div class="category-count">
									{{ getCategoryVariablesCount(category) }} variables
								</div>
							</div>

							<div
								class="category-variables"
								v-if="expandedCategories.includes(category)"
							>
								<table class="results-table">
									<thead>
										<tr>
											<th
												v-for="(column, colIndex) in columnsWithoutCategory"
												:key="column.field"
												@click="sortBy(column.field)"
												:class="{
													sortable: column.sortable,
													sorted: sortField === column.field,
												}"
												:style="{ width: columnWidthsCategory[colIndex] }"
											>
												<div class="th-content">
													<span class="th-text">{{ column.header }}</span>
													<i
														v-if="column.sortable"
														class="pi"
														:class="getSortIcon(column.field)"
													>
													</i>
													<div
														class="column-resizer"
														@mousedown="
															startResizeCategory($event, colIndex)
														"
													></div>
												</div>
											</th>
											<th v-if="isAuthenticated" class="actions-column">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="(item, itemIndex) in getCategoryVariables(
												category
											)"
											:key="itemIndex"
										>
											<td>{{ item.ID || '-' }}</td>
											<td>{{ item.Variable }}</td>
											<td class="description-cell">
												{{ item.VariableDescription }}
											</td>
											<td>
												<span
													class="type-badge"
													:class="getTypeBadgeClass(item.Type)"
													>{{ item.Type || 'Unknown' }}</span
												>
											</td>
											<td v-if="isAuthenticated" class="actions-column">
												<button
													class="btn btn-icon"
													@click="editVariable(item)"
												>
													<i class="pi pi-pencil"></i>
												</button>
												<button
													class="btn btn-icon text-danger"
													@click="deleteVariable(item)"
												>
													<i class="pi pi-trash"></i>
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { useCodebookStore } from '../../stores/codebook';
import { useThemeStore } from '../../stores/theme';
import { debounce } from 'lodash-es';
import { mapState } from 'pinia';

export default {
	name: 'Codebook',
	data() {
		return {
			searchQuery: '',
			activeFilters: ['id', 'category', 'variable', 'description', 'type'],
			sortField: 'id',
			sortOrder: 'asc',
			isAuthenticated: false, // You might want to connect this to your auth store
			isLoading: true,
			expandedCategories: [],
			// Default column widths
			columnWidths: ['15%', '20%', '20%', '35%', '10%'],
			columnWidthsCategory: ['15%', '25%', '45%', '15%'],
			resizingColumn: null,
			resizingTable: null,
			startX: 0,
			startWidth: 0,
			searchFields: [
				{ label: 'ID', value: 'id' },
				{ label: 'Category', value: 'category' },
				{ label: 'Variable', value: 'variable' },
				{ label: 'Description', value: 'description' },
				{ label: 'Type', value: 'type' },
			],
			columns: [
				{ field: 'id', header: 'ID', sortable: true, type: 'numeric' },
				{ field: 'category', header: 'Category', sortable: true, type: 'text' },
				{ field: 'Variable', header: 'Variable Name', sortable: true, type: 'text' },
				{
					field: 'VariableDescription',
					header: 'Description',
					sortable: false,
					type: 'text',
				},
				{ field: 'Type', header: 'Type', sortable: true, type: 'text' },
			],
		};
	},
	computed: {
		isDarkMode() {
			return useThemeStore().isDarkMode;
		},
		codebookStore() {
			return useCodebookStore();
		},
		...mapState(useCodebookStore, ['codebook', 'allVariables']),
		columnsWithoutCategory() {
			// Return columns without the category column for use in category tables
			return this.columns.filter((column) => column.field !== 'category');
		},
		categories() {
			// Get unique categories from codebook
			const categorySet = new Set();
			this.allVariables.forEach((item) => {
				if (item.category) {
					categorySet.add(item.category);
				}
			});
			// Sort categories alphabetically
			return Array.from(categorySet).sort();
		},
		filteredResults() {
			if (!this.searchQuery) return this.allVariables;

			const query = this.searchQuery.toLowerCase();
			return this.allVariables.filter((item) => {
				return this.activeFilters.some((filter) => {
					switch (filter) {
						case 'id':
							return item.id && String(item.id).toLowerCase().includes(query);
						case 'category':
							return item.category && item.category.toLowerCase().includes(query);
						case 'variable':
							return item.Variable && item.Variable.toLowerCase().includes(query);
						case 'description':
							return (
								item.VariableDescription &&
								item.VariableDescription.toLowerCase().includes(query)
							);
						case 'type':
							return item.Type && item.Type.toLowerCase().includes(query);
						default:
							return false;
					}
				});
			});
		},
		sortedResults() {
			return [...this.filteredResults].sort((a, b) => {
				const column = this.columns.find((col) => col.field === this.sortField);
				const aValue = a[this.sortField] || '';
				const bValue = b[this.sortField] || '';

				if (column && column.type === 'numeric') {
					return this.sortOrder === 'asc'
						? Number(aValue) - Number(bValue)
						: Number(bValue) - Number(aValue);
				}

				return this.sortOrder === 'asc'
					? String(aValue).localeCompare(String(bValue))
					: String(bValue).localeCompare(String(aValue));
			});
		},
		totalResults() {
			return this.allVariables.length;
		},
	},
	async created() {
		// Set up keyboard shortcut listener for Ctrl+Shift+R
		window.addEventListener('keydown', this.handleKeyDown);

		// Check if we have cached data
		await this.loadCodebook();

		// Set up column resize event listeners
		window.addEventListener('mousemove', this.handleResize);
		window.addEventListener('mouseup', this.stopResize);

		// Listen for dark mode changes
		this.$watch(
			() => this.isDarkMode,
			(newVal) => {
				document.body.classList.toggle('dark-mode', newVal);
			},
			{ immediate: true }
		);
	},
	unmounted() {
		// Remove event listeners when component is destroyed
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('mousemove', this.handleResize);
		window.removeEventListener('mouseup', this.stopResize);
	},
	methods: {
		async loadCodebook(forceRefresh = false) {
			try {
				this.isLoading = true;

				// Check localStorage for cached data if not forcing refresh
				if (!forceRefresh) {
					const cachedData = localStorage.getItem('codebookData');
					const cachedTimestamp = localStorage.getItem('codebookTimestamp');

					// If we have cached data and it's less than 24 hours old
					if (cachedData && cachedTimestamp) {
						const now = new Date().getTime();
						const cacheTime = parseInt(cachedTimestamp);
						const cacheAge = now - cacheTime;
						const oneDayInMs = 24 * 60 * 60 * 1000;

						if (cacheAge < oneDayInMs) {
							// Use cached data
							console.log('Using cached codebook data');
							this.codebookStore.$patch({ codebook: JSON.parse(cachedData) });
							this.isLoading = false;
							return;
						}
					}
				}

				// If no valid cache or forcing refresh, fetch from Firestore
				console.log('Fetching fresh codebook data');
				await this.codebookStore.fetchCodebook();

				// Cache the results
				localStorage.setItem('codebookData', JSON.stringify(this.codebookStore.codebook));
				localStorage.setItem('codebookTimestamp', new Date().getTime().toString());
			} catch (error) {
				console.error('Error loading codebook:', error);
				// You might want to show an error message to the user
			} finally {
				this.isLoading = false;
			}
		},
		handleKeyDown(event) {
			// Check for Ctrl+Shift+R to force refresh
			if (event.ctrlKey && event.shiftKey && event.key === 'R') {
				event.preventDefault(); // Prevent browser refresh
				this.forceRefreshCodebook();
			}
		},
		forceRefreshCodebook() {
			// Force refresh the codebook data
			this.loadCodebook(true);
		},
		handleSearch: debounce(function () {
			// The filteredResults computed property will handle this automatically
		}, 300),
		clearSearch() {
			this.searchQuery = '';
		},
		toggleTheme() {
			useThemeStore().toggleTheme();
		},
		sortBy(field) {
			if (this.sortField === field) {
				this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				this.sortField = field;
				this.sortOrder = 'asc';
			}
		},
		getSortIcon(field) {
			if (this.sortField !== field) return 'pi-sort';
			return this.sortOrder === 'asc' ? 'pi-sort-up' : 'pi-sort-down';
		},
		isHighlighted(item) {
			if (!this.searchQuery) return false;
			const query = this.searchQuery.toLowerCase();

			return Object.entries(item).some(([key, value]) => {
				// Skip checking if value is not a string or number
				if (value === null || value === undefined) return false;

				// Check if this is a field we're filtering on
				const matchesFilter = this.activeFilters.some((filter) => {
					switch (filter) {
						case 'id':
							return key === 'id';
						case 'category':
							return key === 'category';
						case 'variable':
							return key === 'Variable';
						case 'description':
							return key === 'VariableDescription';
						case 'type':
							return key === 'Type';
						default:
							return false;
					}
				});

				return matchesFilter && String(value).toLowerCase().includes(query);
			});
		},
		getTypeBadgeClass(type) {
			if (!type) return '';

			const typeLower = type.toLowerCase();
			if (typeLower.includes('numeric')) return 'numeric';
			if (typeLower.includes('categorical')) return 'categorical';
			if (typeLower.includes('boolean')) return 'boolean';

			// Default fallback
			return 'other';
		},
		getCategoryVariables(category) {
			// Get all variables from this category, sorted
			const variables = this.allVariables.filter((item) => item.category === category);

			// Sort by current sort field and order
			return [...variables].sort((a, b) => {
				const aValue = a[this.sortField] || '';
				const bValue = b[this.sortField] || '';

				const column = this.columns.find((col) => col.field === this.sortField);
				if (column && column.type === 'numeric') {
					return this.sortOrder === 'asc'
						? Number(aValue) - Number(bValue)
						: Number(bValue) - Number(aValue);
				}

				return this.sortOrder === 'asc'
					? String(aValue).localeCompare(String(bValue))
					: String(bValue).localeCompare(String(aValue));
			});
		},
		getCategoryVariablesCount(category) {
			return this.allVariables.filter((item) => item.category === category).length;
		},
		toggleCategory(category) {
			const index = this.expandedCategories.indexOf(category);
			if (index === -1) {
				this.expandedCategories.push(category);
			} else {
				this.expandedCategories.splice(index, 1);
			}
		},
		async editVariable(item) {
			// Implement edit functionality
			console.log('Edit:', item);
			// You would typically show a modal or navigate to an edit page
		},
		async deleteVariable(item) {
			if (confirm('Are you sure you want to delete this variable?')) {
				try {
					await this.codebookStore.deleteVariable(item.category, item);

					// Clear the cache to ensure it reflects the latest changes
					localStorage.removeItem('codebookData');
					localStorage.removeItem('codebookTimestamp');

					// Show success notification if you have a notification system
				} catch (error) {
					console.error('Error deleting variable:', error);
					// Show error notification
				}
			}
		},
		// Column resizing functionality
		startResize(event, colIndex) {
			// Prevent text selection during resize
			event.preventDefault();
			this.resizingColumn = colIndex;
			this.resizingTable = 'main';
			this.startX = event.pageX;

			// Get current width before resizing
			const thElement = event.target.closest('th');
			const currentWidth = thElement.getBoundingClientRect().width;
			this.startWidth = currentWidth;
		},
		startResizeCategory(event, colIndex) {
			event.preventDefault();
			this.resizingColumn = colIndex;
			this.resizingTable = 'category';
			this.startX = event.pageX;

			const thElement = event.target.closest('th');
			const currentWidth = thElement.getBoundingClientRect().width;
			this.startWidth = currentWidth;
		},
		handleResize(event) {
			if (this.resizingColumn === null) return;

			const dx = event.pageX - this.startX;
			const newWidth = this.startWidth + dx;

			// Minimum width for columns
			if (newWidth < 60) return;

			// Update the relevant column's width
			if (this.resizingTable === 'main') {
				// Convert to percentage relative to table width
				const tableWidth = event.target.closest('table')?.offsetWidth || 1000;
				const percentWidth = (newWidth / tableWidth) * 100;
				this.columnWidths[this.resizingColumn] = `${percentWidth}%`;
			} else if (this.resizingTable === 'category') {
				const tableWidth = event.target.closest('table')?.offsetWidth || 1000;
				const percentWidth = (newWidth / tableWidth) * 100;
				this.columnWidthsCategory[this.resizingColumn] = `${percentWidth}%`;
			}
		},
		stopResize() {
			this.resizingColumn = null;
			this.resizingTable = null;
		},
	},
};
</script>

<style scoped>
.codebook-container {
	min-height: 100vh;
	padding-top: var(--navbar-height);
	background-color: var(--light-2);
}

/* Dark mode toggle for the whole container */
.codebook-container.dark-mode {
	background-color: var(--dark-2);
	color: var(--light-1);
}

.search-section {
	background: linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-info) 100%);
	padding: 3rem 0;
	color: white;
}

.search-section.dark {
	background: linear-gradient(135deg, var(--dark-1) 0%, var(--dark-2) 100%);
}

.search-container {
	max-width: 800px;
	margin: 0 auto;
}

.search-wrapper {
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border-radius: var(--border-radius);
	padding: 1.5rem;
}

.search-field {
	position: relative;
	margin-bottom: 1rem;
}

.search-field i {
	position: absolute;
	left: 1rem;
	top: 50%;
	transform: translateY(-50%);
	color: var(--dark-accent);
}

.search-input {
	width: 100%;
	padding: 1rem 3rem;
	border: none;
	border-radius: var(--border-radius);
	background: rgba(255, 255, 255, 0.9);
	font-size: 1rem;
	color: var(--dark-1); /* Ensure text is visible */
}

/* Dark mode search input */
.dark-mode .search-input {
	background: rgba(30, 30, 30, 0.8);
	color: var(--light-1);
}

.dark-mode .search-field i {
	color: var(--light-accent);
}

.clear-search {
	position: absolute;
	right: 1rem;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: var(--dark-accent);
	cursor: pointer;
}

.dark-mode .clear-search {
	color: var(--light-accent);
}

.search-filters {
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
}

.search-filters label {
	color: white;
	font-size: 0.875rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
}

.results-section {
	padding: 2rem 0;
}

.results-stats {
	display: flex;
	align-items: center;
	gap: 2rem;
	padding: 1rem;
	background: var(--light-1);
	border-radius: var(--border-radius);
	margin-bottom: 1rem;
}

.stats-item {
	display: flex;
	flex-direction: column;
}

.stats-value {
	font-size: 1.5rem;
	font-weight: 600;
	color: var(--bs-primary);
}

.stats-label {
	font-size: 0.875rem;
	color: var(--dark-accent);
}

.refresh-button {
	margin-left: auto;
}

.theme-toggle {
	margin-left: 1rem;
}

.results-table-wrapper {
	background: var(--light-1);
	border-radius: var(--border-radius);
	overflow: auto;
	max-height: calc(100vh - 300px);
	width: 100%;
}

.results-table {
	width: 100%;
	table-layout: fixed; /* This makes the columns respect their widths */
	border-collapse: collapse;
}

.results-table th,
.results-table td {
	padding: 1rem;
	text-align: left;
	border-bottom: 1px solid var(--light-accent);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Descriptions can wrap */
.description-cell {
	white-space: normal;
	word-break: break-word;
}

.results-table th {
	background: var(--light-1);
	position: sticky;
	top: 0;
	z-index: 1;
}

/* Column resizing styles */
.th-content {
	position: relative;
	display: flex;
	align-items: center;
	height: 100%;
}

.th-text {
	flex-grow: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.column-resizer {
	position: absolute;
	right: 0;
	top: 0;
	height: 100%;
	width: 5px;
	background-color: transparent;
	cursor: col-resize;
}

.column-resizer:hover {
	background-color: var(--bs-primary);
}

.categories-wrapper {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.category-container {
	background: var(--light-1);
	border-radius: var(--border-radius);
	overflow: hidden;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 1.5rem;
	cursor: pointer;
	transition: background-color 0.2s;
}

.category-header:hover {
	background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.category-header.expanded {
	border-bottom: 1px solid var(--light-accent);
	background-color: rgba(var(--bs-primary-rgb), 0.1);
}

.category-name {
	font-weight: 600;
	font-size: 1.1rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.category-count {
	font-size: 0.875rem;
	color: var(--dark-accent);
	background: rgba(var(--bs-primary-rgb), 0.1);
	padding: 0.25rem 0.75rem;
	border-radius: 1rem;
}

.category-variables {
	overflow: auto;
	max-height: 400px; /* Limit height for large categories */
}

.sortable {
	cursor: pointer;
}

.sorted {
	color: var(--bs-primary);
}

.type-badge {
	padding: 0.25rem 0.75rem;
	border-radius: 1rem;
	font-size: 0.875rem;
	font-weight: 500;
}

.type-badge.numeric {
	background: var(--bs-info);
	color: white;
}

.type-badge.categorical {
	background: var(--bs-warning);
	color: var(--dark-1);
}

.type-badge.boolean {
	background: var(--bs-success);
	color: white;
}

.type-badge.other {
	background: var(--bs-secondary);
	color: white;
}

.highlight {
	background-color: rgba(var(--bs-primary-rgb), 0.1);
}

.actions-column {
	width: 100px;
	text-align: right !important;
}

.btn-icon {
	padding: 0.5rem;
	border: none;
	background: none;
	cursor: pointer;
	color: var(--dark-accent);
	transition: color 0.2s;
}

.btn-icon:hover {
	color: var(--bs-primary);
}

.text-danger {
	color: var(--bs-danger) !important;
}

.text-danger:hover {
	color: var(--bs-danger-darker) !important;
}

/* Dark mode styles */
.dark-mode .results-stats,
.dark-mode .results-table-wrapper,
.dark-mode .category-container {
	background: var(--dark-1);
}

.dark-mode .results-table th {
	background: var(--dark-1);
	color: var(--light-1);
}

.dark-mode .results-table td,
.dark-mode .category-header.expanded {
	border-color: var(--dark-accent);
	color: var(--light-1);
}

.dark-mode .stats-label,
.dark-mode .category-count {
	color: var(--light-accent);
}

.dark-mode .btn-icon {
	color: var(--light-accent);
}

.dark-mode .btn-icon:hover {
	color: var(--bs-primary);
}

.dark-mode .highlight {
	background-color: rgba(var(--bs-primary-rgb), 0.2);
}

.dark-mode .category-header:hover {
	background-color: rgba(255, 255, 255, 0.05);
}

.dark-mode .category-header.expanded {
	background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .category-count {
	background: rgba(255, 255, 255, 0.1);
}
</style>
