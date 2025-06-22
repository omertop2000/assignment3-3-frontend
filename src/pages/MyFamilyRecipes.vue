<template>
  <div class="container mt-4">
    <h1>My Family Recipes</h1>
    <div v-if="loading" class="text-center my-4">
      <span>Loading family recipes...</span>
    </div>
    <div v-else>
      <div v-if="recipes.length === 0" class="alert alert-info mt-4">
        No family recipes found.
      </div>
      <div v-else>
        <div v-for="(recipe, idx) in recipes" :key="idx" class="card mb-4">
          <div class="card-body">
            <h4 class="card-title">{{ recipe.name }}</h4>
            <h6 class="card-subtitle mb-2 text-muted">By: {{ recipe.recipe_owner }}</h6>
            <h6 class="card-subtitle mb-2 text-muted">When it's made: {{ recipe.when_its_made }}</h6>
            
            <!-- Show first image from images field under the recipe name -->
            <div v-if="recipe.images && recipe.images.length > 0" class="mb-3 text-center">
              <img :src="recipe.images[0]" alt="Family Recipe Image" style="max-width: 300px; max-height: 200px; border-radius: 8px;" />
            </div>
            
            <h5>Ingredients</h5>
            <div class="mb-3">
              <ul class="ingredients-list">
                <li v-for="(ingredient, idx) in parseIngredients(recipe.ingredients)" :key="idx" class="ingredient-item">
                  {{ ingredient }}
                </li>
              </ul>
            </div>
            <h5>Instructions</h5>
            <div v-if="parseInstructions(recipe.instructions).length > 1" class="mb-3">
              <ol class="instructions-list">
                <li v-for="(instruction, idx) in parseInstructions(recipe.instructions)" :key="idx" class="instruction-item">
                  {{ instruction }}
                </li>
              </ol>
            </div>
            <p v-else style="white-space: pre-line;">{{ recipe.instructions }}</p>
            
            <!-- Show rest of the images after Instructions section -->
            <div v-if="recipe.images && recipe.images.length > 1" class="mt-4">
              <h5>Additional Images</h5>
              <div class="row">
                <div v-for="(image, imageIdx) in recipe.images.slice(1)" :key="imageIdx" class="col-12 mb-3">
                  <div class="text-center">
                    <!-- Extract step title if it exists in the URL -->
                    <h6 v-if="getStepTitle(image)" class="mb-2">{{ getStepTitle(image) }}</h6>
                    <img :src="getImageUrl(image)" alt="Family Recipe Image" style="max-width: 100%; max-height: 200px; border-radius: 8px;" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import store from '@/store';
export default {
  name: 'MyFamilyRecipes',
  data() {
    return {
      recipes: [],
      loading: true,
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const res = await axios.get(`${store.server_domain}/users/familyrecipes`, { withCredentials: true });
      this.recipes = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      this.recipes = [];
    }
    this.loading = false;
  },
  methods: {
    getStepTitle(image) {
      // Check if the image string contains a step title (format: "step X:URL")
      if (typeof image === 'string' && image.includes(':')) {
        const colonIndex = image.indexOf(':');
        const stepTitle = image.substring(0, colonIndex);
        // Check if it's a step title (starts with "step")
        if (stepTitle.toLowerCase().startsWith('step')) {
          return stepTitle;
        }
      }
      return null;
    },
    getImageUrl(image) {
      // Extract the actual URL from the image string
      if (typeof image === 'string' && image.includes(':')) {
        const colonIndex = image.indexOf(':');
        return image.substring(colonIndex + 1);
      }
      return image;
    },
    parseInstructions(instructions) {
      if (!instructions) return [];
      
      // Check if instructions contain numbered format (1. 2. 3. etc.)
      const hasNumberedFormat = /\d+\./.test(instructions);
      
      if (hasNumberedFormat) {
        // Split by numbered pattern and filter out empty entries
        const steps = instructions
          .split(/\d+\./)
          .filter(step => step.trim() !== '')
          .map(step => step.trim());
        
        return steps;
      }
      
      // If no numbered format, split by newlines and filter out empty lines
      return instructions.split('\n').filter(line => line.trim() !== '');
    },
    parseIngredients(ingredients) {
      if (!ingredients) return [];
      
      // Split by newlines first, as ingredients are typically separated by line breaks
      let lines = ingredients.split('\n');
      
      // Filter out empty lines and trim whitespace
      lines = lines.filter(line => line.trim() !== '').map(line => line.trim());
      
      // If we still have only one item, try splitting by common patterns
      if (lines.length === 1) {
        // Try splitting by multiple spaces (2 or more)
        lines = ingredients.split(/\s{2,}/);
        lines = lines.filter(line => line.trim() !== '').map(line => line.trim());
      }
      
      return lines;
    }
  }
};
</script>

<style scoped>
.instructions-list {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.instruction-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  border-radius: 0 4px 4px 0;
  line-height: 1.6;
  font-size: 1rem;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-item:hover {
  background-color: #e9ecef;
  transition: background-color 0.2s ease;
}

.ingredients-list {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.ingredient-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8fff9;
  border-left: 4px solid #28a745;
  border-radius: 0 4px 4px 0;
  line-height: 1.6;
  font-size: 1rem;
}

.ingredient-item:last-child {
  margin-bottom: 0;
}

.ingredient-item:hover {
  background-color: #e8f5e8;
  transition: background-color 0.2s ease;
}
</style>
