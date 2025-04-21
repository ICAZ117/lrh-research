<template>
	<div class="container pb-5" style="padding-top: calc(2rem + var(--navbar-height))">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<div class="card" :class="{ 'bg-dark text-white': isDarkMode }">
					<div class="card-header">
						<h4>Firestore Database Uploader</h4>
					</div>
					<div class="card-body">
						<div class="alert alert-info mb-3">
							<i class="fas fa-info-circle me-2"></i>
							Upload JSON data to a specific Firestore path.
						</div>

						<div v-if="status.message" class="alert" :class="status.type">
							{{ status.message }}
						</div>

						<form @submit.prevent="uploadData">
							<div class="mb-3">
								<label for="collectionPath" class="form-label"
									>Firestore Collection Path:</label
								>
								<input
									type="text"
									id="collectionPath"
									v-model="collectionPath"
									class="form-control"
									:class="{ 'bg-dark text-white border-secondary': isDarkMode }"
									placeholder="e.g., users or projects/projectId/tasks"
									required
								/>
								<div class="form-text" :class="{ 'text-light': isDarkMode }">
									Specify the path where the data should be saved.
								</div>
							</div>

							<div class="mb-3">
								<label class="form-label d-block">Upload Method:</label>
								<div class="form-check form-check-inline">
									<input
										class="form-check-input"
										type="radio"
										name="uploadMethod"
										id="uploadMethodMerge"
										value="merge"
										v-model="uploadMethod"
										checked
									/>
									<label class="form-check-label" for="uploadMethodMerge"
										>Merge</label
									>
								</div>
								<div class="form-check form-check-inline">
									<input
										class="form-check-input"
										type="radio"
										name="uploadMethod"
										id="uploadMethodOverwrite"
										value="overwrite"
										v-model="uploadMethod"
									/>
									<label class="form-check-label" for="uploadMethodOverwrite"
										>Overwrite</label
									>
								</div>
								<div class="form-text" :class="{ 'text-light': isDarkMode }">
									Merge will update existing documents, Overwrite will replace
									them entirely.
								</div>
							</div>

							<div class="mb-3">
								<label for="jsonData" class="form-label">JSON Data:</label>
								<textarea
									id="jsonData"
									v-model="jsonData"
									class="form-control code-textarea"
									:class="{ 'bg-dark text-white border-secondary': isDarkMode }"
									rows="10"
									placeholder="Paste your JSON data here"
									required
								></textarea>
								<div class="form-text" :class="{ 'text-light': isDarkMode }">
									For single document: { "field": "value" }. For multiple
									documents: [{ "id": "doc1", "field": "value" }, ...]
								</div>
							</div>

							<div class="d-flex justify-content-between">
								<button
									type="button"
									class="btn btn-secondary"
									@click="validateJson"
								>
									<i class="fas fa-check me-1"></i> Validate JSON
								</button>
								<button
									type="submit"
									class="btn btn-primary"
									:disabled="isUploading"
								>
									<i class="fas fa-upload me-1"></i>
									<span v-if="isUploading">
										<span
											class="spinner-border spinner-border-sm me-1"
											role="status"
										></span>
										Uploading...
									</span>
									<span v-else>Upload to Firestore</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import {
	doc,
	collection,
	setDoc,
	updateDoc,
	writeBatch,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

export default {
	name: 'FirestoreUploader',
	data() {
		return {
			collectionPath: '',
			jsonData: '',
			uploadMethod: 'merge',
			isUploading: false,
			status: {
				message: '',
				type: 'alert-info',
			},
		};
	},
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
		...mapState(useAuthStore, ['isStaff', 'isAuthenticated']),
	},
	created() {
		// Redirect if not authenticated or not a staff member
		if (!this.isAuthenticated || !this.isStaff) {
			this.$router.push('/');
			return;
		}
	},
	methods: {
		validateJson() {
			try {
				JSON.parse(this.jsonData);
				this.status = {
					message: 'JSON is valid!',
					type: 'alert-success',
				};
				return true;
			} catch (error) {
				this.status = {
					message: `Invalid JSON: ${error.message}`,
					type: 'alert-danger',
				};
				return false;
			}
		},
		async uploadData() {
			if (!this.validateJson()) return;

			this.isUploading = true;
			this.status = {
				message: 'Uploading data...',
				type: 'alert-info',
			};

			try {
				const parsedData = JSON.parse(this.jsonData);

				// Check if data is an array (multiple documents) or object (single document)
				if (Array.isArray(parsedData)) {
					await this.uploadMultipleDocuments(parsedData);
				} else {
					await this.uploadSingleDocument(parsedData);
				}

				this.status = {
					message: 'Data uploaded successfully!',
					type: 'alert-success',
				};
			} catch (error) {
				console.error('Upload error:', error);
				this.status = {
					message: `Error uploading data: ${error.message}`,
					type: 'alert-danger',
				};
			} finally {
				this.isUploading = false;
			}
		},

		async uploadSingleDocument(data) {
			// For single document, check if collection path ends with a document ID
			const pathParts = this.collectionPath.split('/');

			// Add timestamp
			data.updatedAt = serverTimestamp();
			if (this.uploadMethod === 'overwrite' || !data.createdAt) {
				data.createdAt = serverTimestamp();
			}

			if (pathParts.length % 2 === 0) {
				// Even number means path ends with a document ID
				const docRef = doc(db, this.collectionPath);
				if (this.uploadMethod === 'merge') {
					await updateDoc(docRef, data);
				} else {
					await setDoc(docRef, data);
				}
			} else {
				// Odd number means path is a collection, generate a document ID
				const collRef = collection(db, this.collectionPath);
				const newDocRef = doc(collRef);
				await setDoc(newDocRef, data);
			}
		},

		async uploadMultipleDocuments(dataArray) {
			// Check if the collection path is valid
			if (this.collectionPath.split('/').length % 2 === 0) {
				throw new Error(
					'For multiple documents, path must be a collection (odd number of segments)'
				);
			}

			// Use batched writes for multiple documents
			const batch = writeBatch(db);
			const collRef = collection(db, this.collectionPath);

			for (const item of dataArray) {
				// Extract the ID if provided, otherwise generate one
				const { id, ...data } = item;
				const docRef = id ? doc(collRef, id) : doc(collRef);

				// Add timestamps
				data.updatedAt = serverTimestamp();
				if (this.uploadMethod === 'overwrite' || !data.createdAt) {
					data.createdAt = serverTimestamp();
				}

				if (this.uploadMethod === 'merge' && id) {
					// For merge, we try to update, but if it doesn't exist, it will fail silently
					// To handle this properly would require checking if each doc exists first
					batch.set(docRef, data, { merge: true });
				} else {
					batch.set(docRef, data);
				}
			}

			await batch.commit();
		},
	},
};
</script>

<style scoped>
.code-textarea {
	font-family: monospace;
	font-size: 14px;
}

.card {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

/* Adjust spacing for better mobile view */
@media (max-width: 767px) {
	.container {
		padding-top: 2rem !important;
	}
}
</style>
