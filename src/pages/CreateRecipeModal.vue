<template>
  <div v-if="visible" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create New Recipe</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="submitRecipe">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Recipe Name *</label>
              <input v-model="form.title" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Preparation Time (minutes) *</label>
              <input v-model.number="form.readyInMinutes" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Image Link</label>
              <input v-model="form.image" type="url" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Number of Servings</label>
              <input v-model.number="form.servings" type="number" class="form-control" min="1" />
            </div>
            <div class="mb-3">
              <label class="form-label">Ingredients *</label>
              <div v-for="(ing, idx) in ingredients" :key="idx" class="d-flex mb-2 align-items-center">
                <input v-model="ing.amount" type="text" class="form-control me-2" placeholder="Amount" style="max-width: 90px;" required />
                <input v-model="ing.name" type="text" class="form-control me-2" placeholder="Ingredient" required />
                <button type="button" class="btn btn-danger btn-sm" @click="removeIngredient(idx)">✕</button>
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addIngredient">Add Ingredient</button>
            </div>
            <div class="mb-3">
              <label class="form-label">Instructions *</label>
              <textarea v-model="form.instructions" class="form-control" rows="3" required></textarea>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" v-model="form.vegan" id="veganCheck">
              <label class="form-check-label" for="veganCheck">Vegan</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" v-model="form.vegetarian" id="vegetarianCheck">
              <label class="form-check-label" for="vegetarianCheck">Vegetarian</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" v-model="form.glutenFree" id="glutenFreeCheck">
              <label class="form-check-label" for="glutenFreeCheck">Gluten Free</label>
            </div>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
            <div v-if="success" class="alert alert-success mt-3">Recipe created successfully!</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Close</button>
            <button type="submit" class="btn btn-success">Create Recipe</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import axios from 'axios';

export default {
  name: 'CreateRecipeModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      form: {
        title: '',
        readyInMinutes: '',
        image: '',
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        servings: 1,
        extendedIngredients: [],
        instructions: '',
      },
      ingredients: [
        { amount: '', name: '' }
      ],
      error: null,
      success: false,
    };
  },
  methods: {
    addIngredient() {
      this.ingredients.push({ amount: '', name: '' });
    },
    removeIngredient(idx) {
      this.ingredients.splice(idx, 1);
    },
    async submitRecipe() {
      this.error = null;
      this.success = false;
      // Validation
      if (
        !this.form.title ||
        !this.form.readyInMinutes ||
        !this.form.instructions ||
        this.ingredients.length === 0 ||
        this.ingredients.some(ing => !ing.name || !ing.amount || isNaN(Number(ing.amount)) || Number(ing.amount) <= 0)
      ) {
        this.error = 'All required fields must be filled, and ingredient amounts must be positive numbers.';
        return;
      }
      // Validate servings is a positive number
      if (this.form.servings <= 0 || !Number.isInteger(this.form.servings)) {
        this.error = 'Servings must be a positive integer.';
        return;
      }
      // Validate readyInMinutes is a positive number
      if (this.form.readyInMinutes <= 0 || !Number.isInteger(this.form.readyInMinutes)) {
        this.error = 'Preparation time must be a positive integer.';
        return;
      }
      // Build extendedIngredients as array of strings (amount + name)
      this.form.extendedIngredients = this.ingredients.map(ing => `${ing.amount} ${ing.name}`.trim());
      try {
        const response = await axios.post(`${store.server_domain}/users/createrecipe`, {
          ...this.form
        }, { withCredentials: true });
        this.success = true;
        // Try to add the new recipe ID to the store
        const newId = response.data?.id;
        if (newId) {
          if (!store.myRecipeIds.includes(newId)) {
            store.myRecipeIds.push(newId);
          }
        } else {
          // fallback: fetch the list again
          try {
            const myRecipesRes = await axios.get(`${store.server_domain}/users/myrecipes`, { withCredentials: true });
            const myRecipeIds = myRecipesRes.data.recipe_ids || [];
            store.setMyRecipes(myRecipeIds);
          } catch (e) { /* ignore */ }
        }
        setTimeout(() => {
          this.$emit('close');
        }, 1000);
      } catch (e) {
        this.error = e.response?.data?.message || 'Error creating recipe';
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.form = {
          title: '',
          readyInMinutes: '',
          image: '',
          vegan: false,
          vegetarian: false,
          glutenFree: false,
          servings: 1,
          extendedIngredients: [],
          instructions: '',
        };
        this.ingredients = [ { amount: '', name: '' } ];
        this.error = null;
        this.success = false;
      }
    }
  }
};
</script>

<style scoped>
.modal {
  display: block;
}
</style>
