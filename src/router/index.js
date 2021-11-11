import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      {
        path: "/welcome",
        component: Welcome,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) {
    if (to.path === "/login" || to.path === "/") {
      return next();
    }
    next("/login");
  } else {
    if (to.path === "/login" || to.path === "/") return next("/home");
    next();
  }
});

export default router;
