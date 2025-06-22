<template>
  <div class="container mt-4">
    <h1 class="text-center mb-4">About MyKitchenHub</h1>
    
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-primary">Project Overview</h3>
            <p class="card-text">
              MyKitchenHub is a comprehensive recipe management platform developed by <strong>Omer Topchi</strong> and <strong>Matan Isar</strong> 
              as part of the Web Development course. This full-stack application combines Vue.js frontend with Node.js backend to create 
              an intuitive cooking experience with features like recipe search, favorites, user authentication, and family recipe collections.
            </p>
            
            <h3 class="card-title text-primary">Technical Stack</h3>
            <p class="card-text">
              Built with modern web technologies including Vue.js 3, Bootstrap Vue, Node.js, Express.js, MySQL database, and JWT authentication. 
              Our development approach emphasizes clean code architecture, responsive design, and user-centric functionality.
            </p>
            
            <h3 class="card-title text-primary">Previous Assignments</h3>
            <p class="card-text">
              This project builds upon our previous work in the Web Development course. 
              Explore our development journey:
            </p>
            <div class="d-grid gap-2 d-md-block">
              <a href="https://github.com/WED-2023/assignment2-211973631_207267428_assignment2" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-outline-primary me-2">
                Assignment 2 Repository
              </a>
              <a href="https://github.com/WED-2023/207267428" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-outline-secondary">
                Omer Topchi's Repository
              </a>
              <a href="https://github.com/WED-2023/211973631" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-outline-secondary">
                Matan Isar's Repository
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
}

.card-title {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.card-title:first-child {
  margin-top: 0;
}

.btn {
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}
</style>
