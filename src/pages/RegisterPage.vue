<template>
  <div class="container mt-4" style="max-width: 500px;">
    <h2 class="mb-4">Register</h2>
    <b-form @submit.prevent="register">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="form.username"
          required
          minlength="3"
          maxlength="8"
        />
      </b-form-group>

      <!-- Country -->
      <b-form-group label="Country" label-for="country">
        <b-form-select
          id="country"
          v-model="form.country"
          :options="countries"
          required
        />
      </b-form-group>

      <!-- First Name -->
      <b-form-group label="First Name" label-for="firstname">
        <b-form-input
          id="firstname"
          v-model="form.firstname"
          required
        />
      </b-form-group>

      <!-- Last Name -->
      <b-form-group label="Last Name" label-for="lastname">
        <b-form-input
          id="lastname"
          v-model="form.lastname"
          required
        />
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="email"
          v-model="form.email"
          required
        />
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="form.password"
          required
          minlength="5"
          maxlength="10"
        />
      </b-form-group>

      <!-- Confirm Password -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <b-form-input
          id="confirmedPassword"
          type="password"
          v-model="confirmedPassword"
          required
          minlength="5"
          maxlength="10"
        />
      </b-form-group>

      <b-button type="submit" variant="success" class="w-100">Register</b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="error"
        show
      >
        Registration failed: {{ error }}
      </b-alert>

      <div class="mt-2">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import store from '@/store';
import axios from 'axios';
import rawCountries from '../assets/countries';

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        country: '',
      },
      confirmedPassword: '',
      error: null,
      countries: ['Select a country', ...rawCountries.map(c => ({ text: c, value: c.toLowerCase() }))]
    };
  },
  methods: {
    validate() {
      if (!/^[A-Za-z]{3,8}$/.test(this.form.username)) {
        return 'Username must be 3–8 letters only.';
      }
      if (!/^[A-Za-z']+$/.test(this.form.firstname)) {
        return 'First name must contain only letters and apostrophes.';
      }
      if (!/^[A-Za-z']+$/.test(this.form.lastname)) {
        return 'Last name must contain only letters and apostrophes.';
      }
      if (!/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{5,10}$/.test(this.form.password)) {
        return 'Password must be 5–10 characters, include a number and special character.';
      }
      if (this.form.password !== this.confirmedPassword) {
        return 'Passwords do not match.';
      }
      return null;
    },
    async register() {
      this.error = null;
      const validationError = this.validate();
      if (validationError) {
        this.error = validationError;
        window.alert(validationError);
        return;
      }
      try {
        await axios.post(`${store.server_domain}/Register`, {
          ...this.form,
          confirmPassword: this.confirmedPassword
        });
        this.$router.push('/login');
      } catch (e) {
        const msg = e.response?.data?.message || 'Unexpected error';
        this.error = msg;
        window.alert(msg);
      }
    }
  }
};
</script>
