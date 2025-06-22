<template>
  <div class="container recipe-view-container" v-if="recipe">
    <div class="row mt-4">
      <div class="col-md-5">
        <div class="image-wrapper mb-3">
          <img :src="recipe.image" class="recipe-image-view" :alt="recipe.title" />
          <div class="watched-indicator-view">
            <span v-if="isSeen" class="badge bg-secondary">👁️ Seen</span>
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <h1 class="mb-3">{{ recipe.title }}</h1>
        <div class="mb-2">
          <span class="badge bg-info text-dark me-2">Preparation time: {{ displayMinutes }} minutes</span>
          <span :class="['badge', 'bg-success', 'me-2', likeFlash ? 'like-flash' : '']">
            {{ displayLikes }} Likes
          </span>
          <span v-if="recipe.vegan" class="badge bg-success me-2">Vegan</span>
          <span v-if="recipe.vegetarian" class="badge bg-primary me-2">Vegetarian</span>
          <span v-if="recipe.glutenFree === 1 || recipe.glutenFree === true" class="badge bg-warning text-dark me-2">No Gluten</span>


        </div>
        <div class="mb-2">
          <span class="badge bg-secondary">Servings: {{ recipe.servings }}</span>
        </div>
        <button
          :class="['btn', isFavorite ? 'btn-danger' : 'btn-outline-danger', 'favorite-btn-view', 'mb-3']"
          @click="addToFavorites"
          :disabled="!store.username || isFavorite"
        >
          <span v-if="!store.username">🔒 Login to Favorite</span>
          <span v-else-if="isFavorite">❤️ In Favorites</span>
          <span v-else>♡ Add to Favorites</span>
        </button>
        <button
          class="btn btn-outline-success favorite-btn-view mb-3 ms-2"
          @click="likeRecipe"
          :disabled="!store.username || isLiked"
        >
          <span v-if="!store.username">🔒 Login to Like</span>
          <span v-else-if="isLiked">👍 Liked</span>
          <span v-else>👍 I liked it</span>
        </button>
        <div class="mt-4">
          <h4>Ingredients</h4>
          <ul>
            <li v-for="(ing, idx) in displayIngredients" :key="idx">
              {{ ing }}
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <h4>Instructions</h4>
          <div v-if="isHtml(recipe.instructions)" v-html="recipe.instructions"></div>
          <ol v-else>
            <li v-for="(step, idx) in displayInstructions" :key="idx">
              {{ step }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';
export default {
  data() {
    return {
      recipe: null,
      hovered: false,
      optimisticFavorite: false,
      optimisticLikes: 0,
      likeFlash: false,
    };
  },
  computed: {
    isFavorite() {
      if (this.optimisticFavorite) return true;
      return store.favoriteRecipeIds.includes(this.recipe?.id);
    },
    isSeen() {
      return store.lastWatchedRecipeIds.includes(this.recipe?.id);
    },
    displayMinutes() {
      const min = Number(this.recipe?.readyInMinutes);
      return isNaN(min) ? 0 : min;
    },
    displayIngredients() {
      if (!this.recipe?.extendedIngredients) return [];
      if (
        this.recipe.extendedIngredients.length &&
        typeof this.recipe.extendedIngredients[0] === 'object' &&
        this.recipe.extendedIngredients[0].original
      ) {
        return this.recipe.extendedIngredients.map(ing => ing.original);
      }
      return this.recipe.extendedIngredients;
    },
    displayInstructions() {
      if (this.recipe?._instructions && this.recipe._instructions.length > 0) {
        return this.recipe._instructions.map(s => s.step || s);
      }
      if (this.recipe?.instructions) {
        return this.recipe.instructions
          .split(/\n|\.\s+/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      return [];
    },
    displayLikes() {
      return (this.recipe?.popularity || 0) + this.optimisticLikes;
    },
    isLiked() {
      return this.$root.store.likedRecipeIds.includes(this.recipe?.id);
    },
  },
  methods: {
    isHtml(str) {
      return /<[^>]+>/.test(str || '');
    },
    async addToFavorites() {
      if (this.isFavorite) return;
      this.optimisticFavorite = true;
      store.favoriteRecipeIds.push(this.recipe.id);
      try {
        await this.axios.post(
          store.server_domain + "/users/favorites",
          { recipeId: this.recipe.id },
          { withCredentials: true }
        );
      } catch (error) {
        this.optimisticFavorite = false;
        const idx = store.favoriteRecipeIds.indexOf(this.recipe.id);
        if (idx !== -1) store.favoriteRecipeIds.splice(idx, 1);
        alert("Failed to add to favorites.");
      }
    },
    async likeRecipe() {
      if (this.isLiked) return;
      this.optimisticLikes += 1;
      this.likeFlash = true;
      setTimeout(() => { this.likeFlash = false; }, 400);
      try {
        await this.axios.post(
          store.server_domain + "/users/userlikes",
          { recipeId: this.recipe.id },
          { withCredentials: true }
        );
        this.$root.store.addLiked(this.recipe.id);
      } catch (error) {
        this.optimisticLikes -= 1;
        alert('Error sending like');
      }
    },
  },
  async created() {
    try {
      const response = await this.axios.get(
        store.server_domain + "/recipes/getfullrecipeId",
        {
          params: {
            recipeId: this.$route.params.recipeId,
          },
        }
      );
      const data = response.data;
      let _instructions = [];
      if (Array.isArray(data.analyzedInstructions) && data.analyzedInstructions.length > 0) {
        _instructions = data.analyzedInstructions
          .map((fstep) => {
            if (fstep.steps.length > 0) {
              fstep.steps[0].step = fstep.name + fstep.steps[0].step;
            }
            return fstep.steps;
          })
          .reduce((a, b) => [...a, ...b], []);
      }
      this.recipe = {
        ...data,
        _instructions,
        popularity: data.aggregateLikes || data.popularity || 0,
      };
    } catch (error) {
      console.error("Failed to load recipe:", error);
      this.$router.replace("/NotFound");
    }
  },
};
</script>

<style scoped>
.recipe-view-container {
  max-width: 900px;
}
.image-wrapper {
  position: relative;
}
.recipe-image-view {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 0.5rem;
}
.watched-indicator-view {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
}
.favorite-btn-view {
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.like-flash {
  color: #28a745 !important;
  font-weight: bold;
  transition: color 0.3s;
}
</style>
