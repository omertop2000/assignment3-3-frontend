<template>
  <div class="search-page-container">
    <div class="search-header">
      <h1 class="mb-4 text-center">Recipe Search</h1>
      
      <!-- Main search form with horizontal layout -->
      <form @submit.prevent="onSearch" class="search-form">
        <div class="search-row">
          <!-- Main search input -->
          <div class="search-input-container">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control search-input" 
              placeholder="Search for a recipe..." 
            />
            <button type="submit" class="btn btn-primary search-btn">
              <i class="fas fa-search"></i> Search
            </button>
          </div>
          
          <!-- Filters on the right side -->
          <div class="filters-container">
            <div class="filter-group">
              <label class="form-label">Results</label>
              <select v-model.number="resultsCount" class="form-select">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="form-label">Cuisine</label>
              <select v-model="cuisineInput" class="form-select">
                <option value="">All</option>
                <option v-for="c in cuisines" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="form-label">Diet</label>
              <select v-model="dietInput" class="form-select">
                <option value="">All</option>
                <option v-for="d in diets" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="form-label">Intolerance</label>
              <select v-model="intoleranceInput" class="form-select">
                <option value="">All</option>
                <option v-for="i in intolerances" :key="i" :value="i">{{ i }}</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="form-label">Sort by</label>
              <select v-model="sortBy" class="form-select">
                <option value="">Relevance</option>
                <option value="readyInMinutes">Time</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Last search results -->
    <div v-if="showLastSearch && lastSearchResults.length" class="last-search-section">
      <h5 class="text-center mb-3">Your Last Search:</h5>
      <div class="results-list">
        <div v-for="recipe in lastSearchResults" :key="recipe.id" class="result-item">
          <RecipePreview :recipe="recipe" />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <!-- Search results -->
    <div v-if="!loading && searchResults.length" class="search-results">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>Search Results ({{ searchResults.length }})</h5>
      </div>
      <div class="results-list">
        <div v-for="recipe in sortedResults" :key="recipe.id" class="result-item">
          <RecipePreview :recipe="recipe" />
        </div>
      </div>
    </div>
    
    <!-- No results message -->
    <div v-if="!loading && searchResults.length === 0 && searchedOnce" class="alert alert-warning mt-4 text-center">
      No matching results found.
    </div>
  </div>
</template>

<script>
import RecipePreview from '../components/RecipePreview.vue';
import store from '@/store';
import axios from 'axios';

const cuisines = [
  "African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese", "Eastern European", "European", "French", "German", "Greek", "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Mediterranean", "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"
];
const diets = [
  "Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian", "Vegan", "Pescetarian", "Paleo", "Primal", "Low FODMAP", "Whole30"
];
const intolerances = [
  "Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish", "Soy", "Sulfite", "Tree Nut", "Wheat"
];

export default {
  name: 'SearchPage',
  components: { RecipePreview },
  data() {
    return {
      searchQuery: '',
      resultsCount: 5,
      sortBy: '',
      searchResults: [],
      loading: false,
      searchedOnce: false,
      lastSearchResults: [],
      showLastSearch: false,
      cuisineInput: '',
      dietInput: '',
      intoleranceInput: '',
      cuisines,
      diets,
      intolerances,
    };
  },
  computed: {
    sortedResults() {
      if (!this.sortBy) return this.searchResults;
      return [...this.searchResults].sort((a, b) => {
        if (this.sortBy === 'readyInMinutes') {
          return (a.readyInMinutes || 0) - (b.readyInMinutes || 0);
        }
        if (this.sortBy === 'popularity') {
          return (b.popularity || 0) - (a.popularity || 0);
        }
        return 0;
      });
    }
  },
  created() {
    // Show last search if user is logged in and last search exists
    if (store.username && store.username.value) {
      const last = localStorage.getItem('lastSearchResults');
      if (last) {
        try {
          this.lastSearchResults = JSON.parse(last);
          this.showLastSearch = true;
        } catch {}
      }
    }
  },
  methods: {
    async onSearch() {
      this.loading = true;
      this.searchedOnce = true;
      this.searchResults = [];
      this.showLastSearch = false;
      try {
        const params = {
          name: this.searchQuery,
          amount: this.resultsCount,
        };
        if (this.cuisineInput) params.cuisine = this.cuisineInput;
        if (this.dietInput) params.diet = this.dietInput;
        if (this.intoleranceInput) params.intolerance = this.intoleranceInput;
        if (this.sortBy) params.orderBy = this.sortBy;
        
        console.log('Search params:', params);
        console.log('Search URL:', `${store.server_domain}/recipes/searchrecipe`);
        
        const response = await axios.get(`${store.server_domain}/recipes/searchrecipe`, { params });
        
        console.log('Search response:', response);
        console.log('Response data:', response.data);
        console.log('Response data.results:', response.data.results);
        
        this.searchResults = Array.isArray(response.data) ? response.data : [];
        console.log('Final searchResults:', this.searchResults);
        
        // Save last search for logged-in users
        if (store.username && store.username.value) {
          localStorage.setItem('lastSearchResults', JSON.stringify(this.searchResults));
        }
      } catch (e) {
        console.error('Search error:', e);
        console.error('Error response:', e.response);
        this.searchResults = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.search-page-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 20px;
}

.search-header {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2rem;
}

.search-form {
  margin-bottom: 0;
}

.search-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.search-input-container {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  height: 50px;
  font-size: 1.1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-btn {
  height: 50px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
}

.filters-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.filter-group .form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #6c757d;
}

.filter-group .form-select {
  height: 40px;
  font-size: 0.9rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.5rem;
}

.last-search-section,
.search-results {
  max-width: 450px;
  margin: 0 auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-input-container {
    flex-direction: column;
  }
  
  .filters-container {
    justify-content: center;
  }
  
  .filter-group {
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .search-header {
    padding: 1.5rem;
  }
  
  .filters-container {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
}
</style>
  