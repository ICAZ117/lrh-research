// src/stores/codebook.js
import { defineStore } from 'pinia';
import Papa from 'papaparse';
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

// Firebase configuration for the old project (codebook-specific)
const codebookFirebaseConfig = {
  apiKey: "AIzaSyBvBL5nTfjdu85awdDkGTS-HtlUvTLcD2U",
  authDomain: "lrh-codebook.firebaseapp.com",
  projectId: "lrh-codebook",
  storageBucket: "lrh-codebook.appspot.com",
  messagingSenderId: "19502263714",
  appId: "1:19502263714:web:563e622ef36866ca5d16fb",
  measurementId: "G-VE6JHR065F"
};

// Initialize separate Firebase instance for the codebook
const codebookFirebaseApp = initializeApp(codebookFirebaseConfig, "codebook-firebase");

// Get Firestore database reference for codebook
const db = getFirestore(codebookFirebaseApp);

export const useCodebookStore = defineStore('codebook', {
  state: () => ({
    codebook: {},  // Initialize as an empty object instead of null
    headers: [],
    uploadPercentage: -1,
  }),

  getters: {
    allVariables: (state) => {
      // Ensure codebook exists before using Object.entries
      if (!state.codebook || Object.keys(state.codebook).length === 0) {
        return [];
      }

      const variables = [];
      Object.entries(state.codebook).forEach(([category, items]) => {
        // Make sure items is an array before trying to iterate
        if (Array.isArray(items)) {
          items.forEach((item) => {
            variables.push({ ...item, category });
          });
        }
      });
      return variables;
    }
  },

  actions: {
    // Fetch the codebook data from Firestore
    async fetchCodebook() {
      try {
        const codebook = {};
        // Get all documents in the variables collection
        const variablesCollection = collection(db, "variables");
        const snapshot = await getDocs(variablesCollection);

        snapshot.forEach((doc) => {
          // Add each document to the codebook object
          const data = doc.data();
          if (data && data.variables) {
            codebook[doc.id] = data.variables;
          }
        });

        console.log("Fetched codebook:", codebook);
        this.codebook = codebook;
        return codebook;
      } catch (error) {
        console.error("Error fetching codebook:", error);
        this.codebook = {}; // Reset to empty object on error
        throw error;
      }
    },

    // Upload codebook from CSV file
    async uploadCodebook(codebookFile) {
      console.log("\n------------------------------------------");
      console.log("UPLOAD CODEBOOK");
      console.log("------------------------------------------");

      // Set upload percentage to 0
      this.setUploadPercentage(0, 0);

      // Create copy of file
      const file = Object.assign({}, codebookFile);
      console.log(file);

      console.log("\nStep 1: Update Headers");
      const headers = file.headers;
      const codebook = file.rows;

      await this.updateHeaders(headers);

      console.log("\nStep 2: Get unique categories");
      const uniqueCategories = new Set();

      for (const row of codebook) {
        uniqueCategories.add(row["VariableCategory"]);
      }

      console.log("Unique Categories", uniqueCategories);

      console.log("\nStep 3: Generate composite codebook");
      const compositeCodebook = {};

      // Loop through all unique categories
      for (const category of uniqueCategories) {
        // Filter the codebook to only include variables from the current category
        if (category !== "") {
          const variables = codebook.filter(row => row["VariableCategory"] === category);

          // Remove the "VariableCategory" key from each variable
          compositeCodebook[category] = variables.map(({ VariableCategory, ...rest }) => rest);
        }
      }

      console.log("Composite Codebook", compositeCodebook);

      console.log("\nStep 4: Delete variables collection in Firestore");
      await this.deleteVariablesCollection();

      console.log("\nStep 5: Upload composite codebook to Firestore");
      const variablesCollection = collection(db, "variables");

      let completed = 0;
      const total = Object.keys(compositeCodebook).length;

      for (const category in compositeCodebook) {
        // For each category, add a document to the variables collection, with the category as the document ID
        await setDoc(doc(variablesCollection, category), {
          variables: compositeCodebook[category]
        });

        console.log("Uploading", category);
        completed++;
        console.log("completed", completed, "out of", total);
        this.setUploadPercentage(completed, total);
      }

      this.setUploadPercentage(1, 1);
      // Update local codebook state
      this.codebook = compositeCodebook;
    },

    // Delete variables collection in Firestore
    async deleteVariablesCollection() {
      try {
        const variablesCollection = collection(db, "variables");
        const snapshot = await getDocs(variablesCollection);

        const deletePromises = [];
        snapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);
        console.log("Variables collection deleted");
      } catch (error) {
        console.error("Error deleting variables collection:", error);
        throw error;
      }
    },

    // Update headers in Firestore
    async updateHeaders(headers) {
      try {
        await setDoc(doc(db, "codebookData", "headers"), {
          headers: headers
        }, { merge: true });

        this.headers = headers;
        console.log("Headers updated:", headers);
      } catch (error) {
        console.error("Error updating headers:", error);
        throw error;
      }
    },

    // Fetch headers from Firestore
    async fetchHeaders() {
      try {
        const headersDoc = doc(db, "codebookData", "headers");
        const headersDocSnap = await getDoc(headersDoc);

        if (headersDocSnap.exists()) {
          const headers = headersDocSnap.data().headers;
          this.headers = headers;
          return headers;
        } else {
          console.warn("No headers document found");
          return [];
        }
      } catch (error) {
        console.error("Error fetching headers:", error);
        throw error;
      }
    },

    // Download codebook as CSV
    async downloadCodebook() {
      console.log("\n------------------------------------------");
      console.log("DOWNLOAD CODEBOOK");
      console.log("------------------------------------------");

      console.log("\nStep 1: Fetch Headers");
      const headers = await this.fetchHeaders();
      console.log("Headers", headers);

      console.log("\nStep 2: Get raw codebook");
      // Check if codebook is loaded, if not fetch it
      if (!this.codebook || Object.keys(this.codebook).length === 0) {
        await this.fetchCodebook();
      }
      console.log("Raw Codebook", this.codebook);

      console.log("\nStep 3: Create codebook array");
      // Loop through all variable categories
      const codebookArray = [];

      for (const category in this.codebook) {
        const variables = this.codebook[category];
        if (!Array.isArray(variables)) continue;

        // Loop through all variables in the category
        for (const variable of variables) {
          // Create an entry for each variable
          const entry = { "VariableCategory": category };

          for (const header of headers) {
            if (header === "VariableCategory") {
              continue;
            }

            // Add each variable to the entry
            if (variable && header in variable) {
              entry[header] = variable[header];
            } else {
              entry[header] = "";
            }
          }

          codebookArray.push(entry);
        }
      }
      console.log("Codebook Array", codebookArray);

      console.log("\nStep 4: Convert codebook array to CSV");
      const codebookCSV = Papa.unparse(codebookArray);

      console.log("\nStep 5: Download CSV file");
      const element = document.createElement("a");
      const file = new Blob([codebookCSV], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = "CodeBook.csv";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
    },

    // Delete a category
    async deleteCategory(category) {
      console.log("\n------------------------------------------");
      console.log("DELETE CATEGORY");
      console.log("------------------------------------------");

      try {
        await deleteDoc(doc(collection(db, "variables"), category));

        // Update local state
        if (this.codebook && this.codebook[category]) {
          const updatedCodebook = { ...this.codebook };
          delete updatedCodebook[category];
          this.codebook = updatedCodebook;
        }

        console.log(`Category '${category}' deleted`);
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    },

    // Delete a variable
    async deleteVariable(category, variable) {
      console.log("\n------------------------------------------");
      console.log("DELETE VARIABLE");
      console.log("------------------------------------------");

      try {
        const docRef = doc(collection(db, "variables"), category);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error(`Category '${category}' not found`);
        }

        const data = docSnap.data();
        if (!data || !data.variables || !Array.isArray(data.variables)) {
          throw new Error(`No variables found in category '${category}'`);
        }

        const variables = data.variables;

        // Filter out the variable to delete
        const newVariables = variables.filter(v => {
          if (!v) return true; // Skip null/undefined entries

          const keys = Object.keys(v);
          let isDifferent = false;

          for (const key of keys) {
            if (v[key] !== variable[key]) {
              isDifferent = true;
              break;
            }
          }

          return isDifferent;
        });

        // Update Firestore
        await setDoc(docRef, {
          variables: newVariables
        });

        // Update local state
        if (this.codebook && this.codebook[category]) {
          const updatedCodebook = { ...this.codebook };
          updatedCodebook[category] = newVariables;
          this.codebook = updatedCodebook;
        }

        console.log(`Variable deleted from category '${category}'`);
      } catch (error) {
        console.error("Error deleting variable:", error);
        throw error;
      }
    },

    // Update upload percentage
    setUploadPercentage(complete, total) {
      console.log("Set Store Upload Percentage", complete, total);
      if (complete === 0 || total === 0) {
        this.uploadPercentage = 0;
      } else {
        this.uploadPercentage = Math.round((complete / total) * 100);
      }
    }
  }
});
