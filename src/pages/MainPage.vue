<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left Column: Random Recipes -->
      <div class="col-md-6 mb-4">
        <h3 class="mb-3">Explore these recipes</h3>
        <div class="row">
          <div class="col-md-12 mb-3" v-for="recipe in randomRecipes" :key="recipe.id">
            <RecipePreview :recipe="recipe" />
          </div>
        </div>
        <div class="d-flex justify-content-center mt-3">
          <button class="btn btn-outline-primary" @click="fetchRandomRecipes">🔄 Get new recipes</button>
        </div>
      </div>

      <!-- Right Column: Last Watched or Login/Register -->
      <div class="col-md-6 mb-4">
        <template v-if="store.username.value">
          <h3 class="mb-3">Last watched recipes</h3>
          <div v-if="lastWatchedLoading" class="text-center my-4">
            <span>Loading...</span>
          </div>
          <div v-else>
            <div v-if="lastWatchedRecipes.length === 0" class="alert alert-info mt-4">
              You haven't watched any recipes yet.
            </div>
            <div class="row" v-else>
              <div class="col-md-12 mb-3" v-for="recipe in lastWatchedRecipes" :key="recipe.id">
                <RecipePreview :recipe="recipe" />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="d-flex flex-column align-items-center justify-content-center h-100 mt-5">
            <h4 class="mb-3">Login to see your last watched recipes</h4>
            <router-link :to="{ name: 'login' }">
              <button class="btn btn-primary mb-2">Login</button>
            </router-link>
            <span>or</span>
            <router-link :to="{ name: 'register' }">
              <button class="btn btn-outline-success mt-2">Register</button>
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
import RecipePreview from '../components/RecipePreview.vue';
import axios from 'axios';

export default {
  name: 'MainPage',
  components: { RecipePreview },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const randomRecipes = ref([]);
    const lastWatchedRecipes = ref([]);
    const lastWatchedLoading = ref(false);

    // Fetch 3 random recipes
    const fetchRandomRecipes = async () => {
      try {
        const res = await axios.get(`${store.server_domain}/recipes/get3random`);
        randomRecipes.value = res.data;
      } catch (e) {
        randomRecipes.value = [];
      }
    };

    // Fetch last 3 watched recipes (full objects)
    const fetchLastWatchedRecipes = async () => {
      lastWatchedLoading.value = true;
      lastWatchedRecipes.value = [];
      const ids = store.lastWatchedRecipeIds.slice(0, 3);
      if (!ids.length) {
        lastWatchedLoading.value = false;
        return;
      }
      try {
        const responses = await Promise.all(
          ids.map(id =>
            axios.get(`${store.server_domain}/recipes/${id}`, {
              withCredentials: true
            }).then(res => ({ ...res.data, id })).catch(() => null)
          )
        );
        lastWatchedRecipes.value = responses.filter(r => r !== null);
      } catch (e) {
        lastWatchedRecipes.value = [];
      }
      lastWatchedLoading.value = false;
    };

    onMounted(() => {
      fetchRandomRecipes();
      if (store.username.value) fetchLastWatchedRecipes();
    });

    // Watch for login/logout to update last watched
    watch(() => store.username.value, (newVal) => {
      if (newVal) fetchLastWatchedRecipes();
      else lastWatchedRecipes.value = [];
    });
    // Watch for changes in lastWatchedRecipeIds
    watch(() => store.lastWatchedRecipeIds.slice(), () => {
      if (store.username.value) fetchLastWatchedRecipes();
    });

    return {
      store,
      randomRecipes,
      fetchRandomRecipes,
      lastWatchedRecipes,
      lastWatchedLoading
    };
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 500px;
}
</style>
