<template>
  <div class="container mt-4">
    <h1>My Favorite Recipes</h1>
    <div v-if="loading" class="text-center my-4">
      <span>Loading recipes...</span>
    </div>
    <div v-else>
      <div v-if="recipes.length === 0" class="alert alert-info mt-4">
        No favorite recipes.
      </div>
      <div class="row" v-else>
        <div class="col-md-4 mb-4" v-for="recipe in recipes" :key="recipe.id">
          <RecipePreview :recipe="recipe" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
import RecipePreview from '../components/RecipePreview.vue';
import store from '@/store';
import axios from 'axios';

export default {
  name: 'MyFavorites',
  components: { RecipePreview },
  data() {
    return {
      recipes: [],
      loading: true,
    };
  },
  async mounted() {
    this.fetchRecipes();
  },
  methods: {
    async fetchRecipes() {
      this.loading = true;
      this.recipes = [];
      const ids = store.favoriteRecipeIds;
      if (!ids || ids.length === 0) {
        this.loading = false;
        return;
      }
      try {
        const responses = await Promise.all(
          ids.map(id =>
            axios.get(`${store.server_domain}/recipes/${id}`, {
              withCredentials: true
            }).then(res => ({ ...res.data, id }))
              .catch(() => null)
          )
        );
        this.recipes = responses.filter(r => r !== null);
      } catch (e) {
        this.recipes = [];
      }
      this.loading = false;
    }
  },
  watch: {
    // Watch for changes in favoriteRecipeIds and refetch if non-empty
    'store.favoriteRecipeIds': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.fetchRecipes();
        }
      },
      deep: true
    }
  }
};
</script>
