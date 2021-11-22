import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import User from "../components/user/User.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import GoodsList from "../components/goods/GoodsList.vue";
import AddGoods from "../components/goods/AddGoods";

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
      {
        path: "/users",
        component: User,
      },
      {
        path: "/rights",
        component: Rights,
      },
      {
        path: "/roles",
        component: Roles,
      },
      {
        path: "/categories",
        component: Cate,
      },
      {
        path: "/params",
        component: Params,
      },
      {
        path: "/goods",
        component: GoodsList,
      },
      {
        path: "/goods/add",
        component: AddGoods,
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
