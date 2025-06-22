  <template>
    <div id="app" :key="store.username.value">
      <b-navbar toggleable="lg" class="custom-navbar py-3">
        <b-navbar-brand to="/" tag="router-link" class="brand-spacious">KitchenHub</b-navbar-brand>
        <img :src="require('@/assets/kitchen.png')" alt="Kitchen" class="kitchen-image-navbar" />

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
          <div class="navbar-flex w-100">
            <b-navbar-nav class="main-nav flex-grow-1">
              <b-nav-item to="/" tag="router-link" class="nav-link-spacious">Home</b-nav-item>
              <b-nav-item to="/search" tag="router-link" class="nav-link-spacious">Search</b-nav-item>
              <b-nav-item to="/about" tag="router-link" class="nav-link-spacious">About</b-nav-item>
              <template v-if="!store.username.value">
                <b-nav-item to="/register" tag="router-link" class="nav-link-spacious">Register</b-nav-item>
                <b-nav-item to="/login" tag="router-link" class="nav-link-spacious">Login</b-nav-item>
              </template>
              <template v-else>
                <div class="nav-item dropdown ms-2" @click="togglePersonalDropdown" style="cursor:pointer;">
                  <span class="nav-link-spacious dropdown-toggle" :class="{ show: showPersonalDropdown }">Personal</span>
                  <div class="dropdown-menu" :class="{ show: showPersonalDropdown }">
                    <router-link class="dropdown-item" to="/favorites" @click="closePersonalDropdown">My Favorites</router-link>
                    <router-link class="dropdown-item" to="/my-recipes" @click="closePersonalDropdown">My Recipes</router-link>
                    <router-link class="dropdown-item" to="/family-recipes" @click="closePersonalDropdown">My Family Recipes</router-link>
                  </div>
                </div>
                <b-nav-item to="#" @click.prevent="openCreateRecipeModal" class="nav-link-spacious ms-2">Create New Recipe</b-nav-item>
              </template>
            </b-navbar-nav>
            <div class="d-flex align-items-center far-right">
              <div class="hello-user">
                <template v-if="!store.username.value">
                  Hello Guest
                </template>
                <template v-else>
                  Hello: {{ store.username.value }}
                </template>
              </div>
              <template v-if="store.username.value">
                <b-button size="lg" class="logout-btn ms-3" @click="logout">Logout</b-button>
              </template>
            </div>
          </div>
        </b-collapse>
      </b-navbar>

      <b-alert
        variant="danger"
        class="m-0"
        dismissible
        v-if="logoutError"
        @dismissed="logoutError = ''"
        show
        style="border-radius:0;"
      >
        Logout failed: {{ logoutError }}
      </b-alert>

      <router-view />
      <CreateRecipeModal :visible="showCreateRecipeModal" @close="closeCreateRecipeModal" />
    </div>
  </template>

  <script>
  import { getCurrentInstance, ref, onMounted, onBeforeUnmount } from 'vue';
  import axios from 'axios';
  import CreateRecipeModal from './pages/CreateRecipeModal.vue';

  export default {
    name: "App",
    components: { CreateRecipeModal },
    setup() {
      const internalInstance = getCurrentInstance();
      const store = internalInstance.appContext.config.globalProperties.store;
      const toast = internalInstance.appContext.config.globalProperties.toast;
      const router = internalInstance.appContext.config.globalProperties.$router;

      const showCreateRecipeModal = ref(false);
      const openCreateRecipeModal = () => { showCreateRecipeModal.value = true; };
      const closeCreateRecipeModal = () => { showCreateRecipeModal.value = false; };

      // Custom dropdown for personal area
      const showPersonalDropdown = ref(false);
      const togglePersonalDropdown = (e) => {
        showPersonalDropdown.value = !showPersonalDropdown.value;
      };
      const closePersonalDropdown = () => {
        showPersonalDropdown.value = false;
      };
      // Close dropdown when clicking outside
      const handleClickOutside = (event) => {
        const dropdown = document.querySelector('.nav-item.dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          showPersonalDropdown.value = false;
        }
      };
      onMounted(() => {
        document.addEventListener('click', handleClickOutside);
      });
      onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
      });

      const logoutError = ref('');
      const logout = async () => {
        try {
          await axios.post(`${store.server_domain}/Logout`, {}, {
            withCredentials: true
          });
        } catch (e) {
          console.error("Logout API call failed:", e.message);
          logoutError.value = e.response?.data?.message || e.message || 'Failed to reach server for logout';
          // Even if server fails, proceed with client-side logout
        }
        
        // Clear user-specific data from localStorage
        localStorage.removeItem('lastWatchedRecipeIds');
        localStorage.removeItem('favoriteRecipeIds');
        localStorage.removeItem('likedRecipeIds');
        localStorage.removeItem('myRecipeIds');
        localStorage.removeItem('lastSearchResults');

        store.logout();
        router.push("/").catch(() => {});
      };

      onMounted(async () => {
        if (store.username && store.username.value) {
          try {
            // Fetch favorites
            const favRes = await axios.get(`${store.server_domain}/users/favorites`, { withCredentials: true });
            const favorites = favRes.data.recipes_id.map((e) => e.recipe_id);
            store.setFavorites(favorites);
            // Fetch last watched
            const lastRes = await axios.post(`${store.server_domain}/users/lastwatched`, { amount: -1 }, { withCredentials: true });
            const lastWatched = lastRes.data.recipes_id_array;
            store.setLastWatched(lastWatched);
            // Fetch my recipes
            const myRecipesRes = await axios.get(`${store.server_domain}/users/myrecipes`, { withCredentials: true });
            const myRecipeIds = myRecipesRes.data.recipe_ids || [];
            store.setMyRecipes(myRecipeIds);
            // Fetch liked recipes
            const likedRes = await axios.get(`${store.server_domain}/users/liked`, { withCredentials: true });
            const likedIds = likedRes.data.recipe_ids || [];
            store.setLiked(likedIds);
          } catch (e) {
            // ignore errors
          }
        }
      });

      return { store, logout, showCreateRecipeModal, openCreateRecipeModal, closeCreateRecipeModal, showPersonalDropdown, togglePersonalDropdown, closePersonalDropdown, logoutError };
    }
  };
  </script>

  <style lang="scss">
  @import "@/scss/form-style.scss";

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    min-height: 100vh;
  }

  .custom-navbar {
    font-size: 1.15rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    padding-left: 2rem;
    padding-right: 2rem;
    background: #079c97 !important;
  }

  .brand-spacious {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin-right: 1.5rem;
    color: #fff !important;
  }

  .main-nav .nav-link-spacious,
  .nav-item.dropdown .dropdown-toggle {
    transition: color 0.18s;
  }
  .main-nav .nav-link-spacious.router-link-exact-active,
  .main-nav .nav-link-spacious.active,
  .main-nav .nav-link-spacious:hover,
  .nav-item.dropdown .dropdown-toggle:hover,
  .nav-item.dropdown .dropdown-toggle.show {
    background: #057a77 !important;
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(7,156,151,0.15);
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  }

  .main-nav .nav-link-spacious.router-link-exact-active {
    background: #057a77 !important;
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(7,156,151,0.15);
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  }

  .main-nav .nav-link-spacious {
    margin-right: 1.2rem;
    margin-left: 1.2rem;
    padding: 0.7rem 1.2rem;
    border-radius: 0.5rem;
    transition: background 0.2s, color 0.2s;
    color: #fff !important;
  }

  .user-nav .nav-link-spacious {
    margin-left: 0.7rem;
    margin-right: 0.7rem;
    padding: 0.6rem 1.1rem;
    border-radius: 0.5rem;
    transition: background 0.2s, color 0.2s;
    color: #fff !important;
  }

  .user-nav .nav-link-spacious.router-link-exact-active,
  .user-nav .nav-link-spacious:hover {
    background: #079c97;
    color: #fff !important;
  }

  .d-flex.align-items-center.far-right {
    background: #fff9c4;
    border-radius: 0.5rem;
    padding: 0.2rem 0.7rem;
    margin-left: 1.2rem;
    margin-right: 0.5rem;
    box-shadow: 0 2px 8px rgba(124, 124, 0, 0.08);
    border: 1px solid #ffe082;
  }

  .hello-user {
    background: transparent;
    color: #795548;
    box-shadow: none;
    border: none;
    margin: 0;
    padding: 0 0.7rem 0 0;
  }

  .logout-btn {
    font-size: 1.15rem !important;
    padding: 0.6rem 1.5rem !important;
    font-weight: 600;
    border-radius: 0.5rem;
    margin-left: 1.2rem;
    background: #e74c3c !important;
    color: #fff !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(231,76,60,0.08);
    transition: background 0.18s, color 0.18s;
  }
  .logout-btn:hover, .logout-btn:focus {
    background: #c0392b !important;
    color: #fff !important;
  }

  .dropdown-menu {
    min-width: 200px !important;
    background: #079c97 !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
    padding: 0.5rem 0.2rem !important;
    border: none !important;
    margin-top: 0.5rem !important;
  }

  .dropdown-item {
    color: #fff !important;
    font-weight: 500 !important;
    border-radius: 0.4rem !important;
    margin: 0.1rem 0.3rem !important;
    padding: 0.5rem 1.1rem !important;
  }

  .dropdown-item:hover, .dropdown-item:focus {
    background: #079c97 !important;
    color: #fff !important;
    text-decoration: none !important;
  }

  .nav-item.dropdown .dropdown-toggle {
    margin-right: 1.2rem;
    margin-left: 1.2rem;
    padding: 0.7rem 1.2rem;
    border-radius: 0.5rem;
    transition: background 0.2s, color 0.2s;
    color: #000 !important;
    background: transparent !important;
  }

  .navbar-flex {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .main-nav {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }

  .kitchen-image-navbar {
    display: block;
    margin: 0.5rem auto 0.5rem auto;
    max-width: 60px;
    width: 100%;
    height: auto;
  }
  </style>
