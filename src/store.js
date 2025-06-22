import { reactive, ref } from 'vue';

const store = {
  username: ref(localStorage.getItem('username')),
  //server_domain: "http://localhost:3000",
  server_domain: "https://omer-matan.cs.bgu.ac.il",
  favoriteRecipeIds: reactive([]),
  lastWatchedRecipeIds: reactive([]),
  myRecipeIds: reactive([]),
  likedRecipeIds: reactive([]),

  login(username) {
    localStorage.setItem('username', username);
    this.username.value = username;
    console.log("login", this.username.value);
  },

  logout() {
    console.log("logout");
    localStorage.removeItem('username');
    this.username.value = null;
    // Clear all user data arrays
    this.favoriteRecipeIds.splice(0);
    this.lastWatchedRecipeIds.splice(0);
    this.myRecipeIds.splice(0);
    this.likedRecipeIds.splice(0);
  },

  setFavorites(ids) {
    this.favoriteRecipeIds.splice(0, this.favoriteRecipeIds.length, ...ids);
  },

  setLastWatched(ids) {
    this.lastWatchedRecipeIds.splice(0, this.lastWatchedRecipeIds.length, ...ids);
  },

  setMyRecipes(ids) {
    this.myRecipeIds.splice(0, this.myRecipeIds.length, ...ids);
  },

  setLiked(ids) {
    this.likedRecipeIds.splice(0, this.likedRecipeIds.length, ...ids);
  },

  addLiked(id) {
    if (!this.likedRecipeIds.includes(id)) {
      this.likedRecipeIds.push(id);
    }
  }
};

export default store;
