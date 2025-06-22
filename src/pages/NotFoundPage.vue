<template>
  <div class="not-found-container">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist or has been moved.</p>
    <router-link to="/" class="home-button">Return to Home</router-link>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.not-found-container p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.home-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  transition: background 0.2s;
}

.home-button:hover {
  background-color: #0056b3;
}
</style>
