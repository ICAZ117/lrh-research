<template>
  <div class="not-found min-vh-100 d-flex align-items-center">
    <div class="container text-center py-5">
      <h1 class="display-1 fw-bold text-primary">404</h1>
      <h2 class="mb-4">Page Not Found</h2>
      <p class="lead mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="btn btn-primary">
        Return Home
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>