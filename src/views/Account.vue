<template>
  <div class="account-page container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">Account Settings</h2>
            
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  :value="userData?.email" 
                  disabled
                >
                <small class="text-muted">Email cannot be changed</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Title</label>
                <select 
                  class="form-select" 
                  v-model="formData.title"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">First Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.firstName"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Last Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.lastName"
                >
              </div>

              <button type="submit" class="btn btn-primary">
                Update Profile
              </button>
            </form>

            <hr class="my-4">

            <h3 class="mb-3">Change Password</h3>
            <form @submit.prevent="handlePasswordChange">
              <div class="mb-3">
                <label class="form-label">New Password</label>
                <input 
                  type="password" 
                  class="form-control"
                  v-model="passwordForm.newPassword"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  class="form-control"
                  v-model="passwordForm.confirmPassword"
                >
              </div>

              <button type="submit" class="btn btn-warning">
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Account',
  data() {
    return {
      formData: {
        title: '',
        firstName: '',
        lastName: ''
      },
      passwordForm: {
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['userData'])
  },
  methods: {
    ...mapActions(useAuthStore, ['updateUserProfile', 'updateUserPassword']),
    async handleSubmit() {
      const toast = useToast()
      const result = await this.updateUserProfile(this.formData)
      if (result.success) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    },
    async handlePasswordChange() {
      const toast = useToast()
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      const result = await this.updateUserPassword(this.passwordForm.newPassword)
      if (result.success) {
        toast.success('Password updated successfully')
        this.passwordForm.newPassword = ''
        this.passwordForm.confirmPassword = ''
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    }
  },
  created() {
    if (this.userData) {
      this.formData = {
        title: this.userData.title || '',
        firstName: this.userData.firstName || '',
        lastName: this.userData.lastName || ''
      }
    }
  }
}
</script>