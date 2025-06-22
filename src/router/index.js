import Main from "../pages/MainPage.vue";
import NotFound from "../pages/NotFoundPage.vue";
import MyFavorites from '../pages/MyFavorites.vue';
import MyRecipes from '../pages/MyRecipes.vue';
import MyFamilyRecipes from '../pages/MyFamilyRecipes.vue';

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/RegisterPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../pages/SearchPage.vue"),
  },
  {
    path: "/recipe/:recipeId",
    name: "recipe",
    component: () => import("../pages/RecipeViewPage.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "notFound",
    component: NotFound,
  },
  {
  path: "/about",
  name: "about",
  component: () => import("../pages/About.vue"),
  },
  { path: '/favorites', name: 'myfavorites', component: MyFavorites },
  { path: '/my-recipes', name: 'myrecipes', component: MyRecipes },
  { path: '/family-recipes', name: 'myfamilyrecipes', component: MyFamilyRecipes },
];

export default routes;
