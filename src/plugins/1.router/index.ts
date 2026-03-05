import { setupLayouts } from 'virtual:generated-layouts';
import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router/auto';
import { createRouter, createWebHistory } from 'vue-router/auto';

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i]);

    return route;
  }

  return setupLayouts([route])[0];
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 };

    return { top: 0 };
  },
  extendRoutes: pages => {
    let routes = [...pages].map(route => recursiveLayouts(route));


    routes = routes.filter(route => route.path !== '/');


    routes.push({
      path: '/',
      name: 'root',
      component: () => import('@/pages/login.vue'),
      meta: { public: true }, 
    });


    routes = routes.map(route => {
      if (route.path.startsWith('/admin') || route.path.startsWith('/reguler')) {
        route.meta = { ...route.meta, requiresAuth: true };
      }
      return route;
    });

    return routes;
  },
});

router.beforeEach((to, from, next) => {
  const accessToken = useCookie('accessToken').value;
  if (to.meta.requiresAuth && !accessToken) {
    next({ name: 'root', query: { to: to.fullPath } });
  } else {
    next();
  }
});

export { router };

export default function (app: App) {
  app.use(router);
}
