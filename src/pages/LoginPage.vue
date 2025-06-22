<template>
  <div class="container mt-4" style="max-width: 400px;">
    <h2 class="mb-4">Login</h2>
    <b-form @submit.prevent="login">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          Username is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="state.password"
        />
        <b-form-invalid-feedback v-if="v$.password.$error">
          Password is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="primary" class="w-100">Login</b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="state.submitError"
        show
      >
        Login failed: {{ state.submitError }}
      </b-alert>

      <b-alert
        variant="success"
        class="mt-3"
        dismissible
        v-if="state.success"
        show
      >
        Login successful! Redirecting...
      </b-alert>

      <div class="mt-2">
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useRouter } from 'vue-router'; // ✅ add this
import axios from 'axios';
import store from '@/store'; // or wherever your store is

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter();
    const state = reactive({
      username: '',
      password: '',
      submitError: null,
      success: false,
    });

    const rules = {
      username: { required },
      password: { required },
    };

    const v$ = useVuelidate(rules, state);

    const getValidationState = (field) => {
      return field.$dirty ? !field.$invalid : null;
    };

    const login = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;

      try {
        await axios.post(`${store.server_domain}/login`, {
          username: state.username,
          password: state.password,
        }, {
          withCredentials: true
        });

        store.login(state.username); // not window.store

        const favRes = await axios.get(`${store.server_domain}/users/favorites`, {
        withCredentials: true  
      });

        const favorites = favRes.data.recipes_id.map((e) => e.recipe_id);

        const lastRes = await axios.post(`${store.server_domain}/users/lastwatched`, { amount: -1 }, { withCredentials: true });
        const lastWatched = lastRes.data.recipes_id_array;

        // Fetch user's own recipes
        const myRecipesRes = await axios.get(`${store.server_domain}/users/myrecipes`, { withCredentials: true });
        const myRecipeIds = myRecipesRes.data.recipe_ids || [];
        store.setMyRecipes(myRecipeIds);
        
        const likedRes = await axios.get(`${store.server_domain}/users/liked`, { withCredentials: true });
        const likedIds = likedRes.data.recipe_ids || [];
        store.setLiked(likedIds);

        store.favoriteRecipeIds = favorites;
        store.lastWatchedRecipeIds = lastWatched;

        state.success = true;
        setTimeout(() => {
          router.push("/");
        }, 1200);
        //window.router.push('/main');
      } catch (err) {
        const msg = err.response?.data?.message || 'Unexpected error.';
        state.submitError = msg;
        window.alert(msg);
      }
    };

    return { state, v$, login, getValidationState };
  },
};

</script>
