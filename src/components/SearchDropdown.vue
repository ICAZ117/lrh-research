<template>
	<div class="search-dropdown" :class="{ 'is-invalid': isInvalid }">
		<!-- Single Select Mode -->
		<div v-if="!multiple" class="single-select-container">
			<div class="search-input-container">
				<input
					type="text"
					class="form-control"
					v-model="searchTerm"
					:placeholder="placeholder"
					@focus="showDropdown = true"
					@input="onSearchInput"
				/>
				<span class="dropdown-arrow" @click="toggleDropdown">&#9662;</span>
			</div>

			<div v-if="showDropdown" class="dropdown-menu show" ref="dropdownMenu">
				<div class="dropdown-item-container">
					<div
						v-for="option in filteredOptions"
						:key="option.id"
						class="dropdown-item"
						:class="{ selected: modelValue === option.id }"
						@click="selectOption(option)"
					>
						{{ option.name }}
					</div>
					<div v-if="filteredOptions.length === 0" class="dropdown-item no-results">
						No results found
					</div>
				</div>
			</div>

			<div v-if="modelValue" class="selected-option">
				<span>{{ getSelectedName(modelValue) }}</span>
				<button type="button" class="btn-close btn-sm" @click="clearSelection"></button>
			</div>
		</div>

		<!-- Multiple Select Mode -->
		<div v-else class="multi-select-container">
			<div class="search-input-container">
				<input
					type="text"
					class="form-control"
					v-model="searchTerm"
					:placeholder="selectedOptions.length ? '' : placeholder"
					@focus="showDropdown = true"
					@input="onSearchInput"
				/>
				<span class="dropdown-arrow" @click="toggleDropdown">&#9662;</span>
			</div>

			<div v-if="showDropdown" class="dropdown-menu show" ref="dropdownMenu">
				<div class="dropdown-item-container">
					<div
						v-for="option in filteredOptions"
						:key="option.id"
						class="dropdown-item"
						:class="{ selected: isSelected(option.id) }"
						@click="toggleOptionSelection(option)"
					>
						<input
							type="checkbox"
							:checked="isSelected(option.id)"
							@click.stop
							class="me-2"
						/>
						{{ option.name }}
					</div>
					<div v-if="filteredOptions.length === 0" class="dropdown-item no-results">
						No results found
					</div>
				</div>
			</div>

			<div class="selected-options" v-if="selectedOptions.length > 0">
				<div
					v-for="option in selectedOptions"
					:key="option.id"
					class="selected-option-chip"
				>
					{{ option.name }}
					<button
						type="button"
						class="btn-close btn-sm"
						@click="removeOption(option.id)"
					></button>
				</div>
			</div>
		</div>

		<div v-if="isInvalid" class="invalid-feedback d-block">
			{{ errorMessage }}
		</div>
	</div>
</template>

<script>
export default {
	name: 'SearchDropdown',
	props: {
		options: {
			type: Array,
			required: true,
		},
		modelValue: {
			type: [String, Array],
			required: true,
		},
		placeholder: {
			type: String,
			default: 'Search...',
		},
		multiple: {
			type: Boolean,
			default: false,
		},
		isInvalid: {
			type: Boolean,
			default: false,
		},
		errorMessage: {
			type: String,
			default: '',
		},
		disabledOptions: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			searchTerm: '',
			showDropdown: false,
			filteredOptions: [],
		};
	},
	computed: {
		selectedOptions() {
			if (!this.multiple || !Array.isArray(this.modelValue)) return [];
			return this.options.filter((option) => this.modelValue.includes(option.id));
		},
	},
	watch: {
		options: {
			immediate: true,
			handler() {
				this.filterOptions();
			},
		},
		disabledOptions: {
			handler() {
				this.filterOptions();
			},
		},
	},
	mounted() {
		document.addEventListener('click', this.handleClickOutside);
	},
	beforeUnmount() {
		document.removeEventListener('click', this.handleClickOutside);
	},
	methods: {
		filterOptions() {
			if (!this.searchTerm) {
				// Filter out disabled options and options that are already selected in other dropdowns
				this.filteredOptions = this.options.filter(
					(option) => !this.disabledOptions.includes(option.id)
				);
				return;
			}

			const searchTermLower = this.searchTerm.toLowerCase();
			this.filteredOptions = this.options.filter((option) => {
				return (
					option.name.toLowerCase().includes(searchTermLower) &&
					!this.disabledOptions.includes(option.id)
				);
			});
		},

		onSearchInput() {
			this.filterOptions();
			this.showDropdown = true;
		},

		toggleDropdown() {
			this.showDropdown = !this.showDropdown;
		},

		selectOption(option) {
			this.$emit('update:modelValue', option.id);
			this.searchTerm = '';
			this.showDropdown = false;
		},

		toggleOptionSelection(option) {
			if (!this.multiple) return;

			let selectedIds = [...this.modelValue];

			if (selectedIds.includes(option.id)) {
				selectedIds = selectedIds.filter((id) => id !== option.id);
			} else {
				selectedIds.push(option.id);
			}

			this.$emit('update:modelValue', selectedIds);
		},

		isSelected(optionId) {
			return this.multiple
				? Array.isArray(this.modelValue) && this.modelValue.includes(optionId)
				: this.modelValue === optionId;
		},

		clearSelection() {
			if (this.multiple) {
				this.$emit('update:modelValue', []);
			} else {
				this.$emit('update:modelValue', '');
			}
			this.searchTerm = '';
		},

		removeOption(optionId) {
			if (this.multiple && Array.isArray(this.modelValue)) {
				const updatedValues = this.modelValue.filter((id) => id !== optionId);
				this.$emit('update:modelValue', updatedValues);
			}
		},

		getSelectedName(id) {
			const option = this.options.find((option) => option.id === id);
			return option ? option.name : '';
		},

		handleClickOutside(event) {
			if (
				this.$refs.dropdownMenu &&
				!this.$refs.dropdownMenu.contains(event.target) &&
				!this.$el.contains(event.target)
			) {
				this.showDropdown = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.search-dropdown {
	position: relative;
	width: 100%;

	.search-input-container {
		position: relative;

		.dropdown-arrow {
			position: absolute;
			right: 10px;
			top: 50%;
			transform: translateY(-50%);
			cursor: pointer;
			color: #6c757d;
		}
	}

	.dropdown-menu {
		position: absolute;
		width: 100%;
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 0.25rem;
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
		background-color: #fff;
		padding: 0.5rem 0;

		.dropdown-item-container {
			.dropdown-item {
				padding: 0.5rem 1rem;
				cursor: pointer;

				&:hover {
					background-color: rgba(0, 0, 0, 0.05);
				}

				&.selected {
					background-color: rgba(13, 110, 253, 0.1);
				}

				&.no-results {
					font-style: italic;
					color: #6c757d;
					cursor: default;
				}
			}
		}
	}

	.selected-option {
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		background-color: #f8f9fa;
		border-radius: 0.25rem;
		padding: 0.3rem 0.5rem;

		span {
			flex: 1;
		}

		.btn-close {
			padding: 0.1rem;
		}
	}

	.selected-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: 0.5rem;

		.selected-option-chip {
			background-color: #f8f9fa;
			border-radius: 1rem;
			padding: 0.2rem 0.5rem;
			display: flex;
			align-items: center;
			font-size: 0.9rem;

			.btn-close {
				margin-left: 0.3rem;
				font-size: 0.7rem;
				padding: 0.1rem;
			}
		}
	}

	&.is-invalid {
		.form-control {
			border-color: #dc3545;
		}
	}
}

/* Fix for dark mode - no longer using :deep(.dark) */
.dark {
	.search-dropdown {
		.dropdown-menu {
			background-color: #2c3034;
			border-color: #444;

			.dropdown-item {
				color: #fff;

				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
				}

				&.selected {
					background-color: rgba(13, 110, 253, 0.2);
				}

				&.no-results {
					color: #adb5bd;
				}
			}
		}

		.selected-option,
		.selected-option-chip {
			background-color: #212529;
			color: #fff;
		}
	}
}
</style>
