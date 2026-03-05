// vite.config.ts
import { fileURLToPath } from "node:url";
import vue from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/@vitejs+plugin-vue@5.2.1_vite@5.4.11_@types+node@22.10.2_sass@1.76.0__vue@3.5.13_typescript@5.7.2_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.1.1_vite@5.4.11_@types+node@22.10.2_sass@1.76.0__vue@3.5.13_typescript@5.7.2_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import AutoImport from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/unplugin-auto-import@0.18.6_@vueuse+core@10.11.1_vue@3.5.13_typescript@5.7.2___rollup@4.28.1/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/unplugin-vue-components@0.27.5_@babel+parser@7.26.3_rollup@4.28.1_vue@3.5.13_typescript@5.7.2_/node_modules/unplugin-vue-components/dist/vite.js";
import { VueRouterAutoImports, getPascalCaseRouteName } from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/unplugin-vue-router@0.8.8_rollup@4.28.1_vue-router@4.5.0_vue@3.5.13_typescript@5.7.2___vue@3.5.13_typescript@5.7.2_/node_modules/unplugin-vue-router/dist/index.mjs";
import VueRouter from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/unplugin-vue-router@0.8.8_rollup@4.28.1_vue-router@4.5.0_vue@3.5.13_typescript@5.7.2___vue@3.5.13_typescript@5.7.2_/node_modules/unplugin-vue-router/dist/vite.mjs";
import { defineConfig } from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/vite@5.4.11_@types+node@22.10.2_sass@1.76.0/node_modules/vite/dist/node/index.js";
import VueDevTools from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/vite-plugin-vue-devtools@7.3.7_rollup@4.28.1_vite@5.4.11_@types+node@22.10.2_sass@1.76.0__vue@3.5.13_typescript@5.7.2_/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import Layouts from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/vite-plugin-vue-layouts@0.11.0_vite@5.4.11_@types+node@22.10.2_sass@1.76.0__vue-router@4.5.0__mfut34v44j2uaeshbqlxzmxtmi/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import vuetify from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/vite-plugin-vuetify@2.0.3_vite@5.4.11_@types+node@22.10.2_sass@1.76.0__vue@3.5.13_typescript@5.7.2__vuetify@3.7.5/node_modules/vite-plugin-vuetify/dist/index.mjs";
import svgLoader from "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/node_modules/.pnpm/vite-svg-loader@5.1.0_vue@3.5.13_typescript@5.7.2_/node_modules/vite-svg-loader/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/rezaharris/Desktop/Document/ALPHA%20INC%20-%20COMPANY/Alpha%20Products/Alpha%20-%20Approval/FrontEnd/starter-kit/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    // Docs: https://github.com/posva/unplugin-vue-router
    // ℹ️ This plugin should be placed before vue plugin
    VueRouter({
      getRouteName: (routeNode) => {
        return getPascalCaseRouteName(routeNode).replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
      }
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "swiper-container" || tag === "swiper-slide"
        }
      }
    }),
    VueDevTools(),
    vueJsx(),
    // Docs: https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
    vuetify({
      styles: {
        configFile: "src/assets/styles/variables/_vuetify.scss"
      }
    }),
    // Docs: https://github.com/johncampionjr/vite-plugin-vue-layouts#vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: "./src/layouts/"
    }),
    // Docs: https://github.com/antfu/unplugin-vue-components#unplugin-vue-components
    Components({
      dirs: ["src/@core/components", "src/views/demos", "src/components"],
      dts: true,
      resolvers: [
        (componentName) => {
          if (componentName === "VueApexCharts")
            return { name: "default", from: "vue3-apexcharts", as: "VueApexCharts" };
        }
      ]
    }),
    // Docs: https://github.com/antfu/unplugin-auto-import#unplugin-auto-import
    AutoImport({
      imports: ["vue", VueRouterAutoImports, "@vueuse/core", "@vueuse/math", "vue-i18n", "pinia"],
      dirs: [
        "./src/@core/utils",
        "./src/@core/composable/",
        "./src/composables/",
        "./src/utils/",
        "./src/plugins/*/composables/*"
      ],
      vueTemplate: true,
      // ℹ️ Disabled to avoid confusion & accidental usage
      ignore: ["useCookies", "useStorage"]
    }),
    svgLoader()
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@themeConfig": fileURLToPath(new URL("./themeConfig.ts", __vite_injected_original_import_meta_url)),
      "@core": fileURLToPath(new URL("./src/@core", __vite_injected_original_import_meta_url)),
      "@layouts": fileURLToPath(new URL("./src/@layouts", __vite_injected_original_import_meta_url)),
      "@images": fileURLToPath(new URL("./src/assets/images/", __vite_injected_original_import_meta_url)),
      "@styles": fileURLToPath(new URL("./src/assets/styles/", __vite_injected_original_import_meta_url)),
      "@configured-variables": fileURLToPath(new URL("./src/assets/styles/variables/_template.scss", __vite_injected_original_import_meta_url)),
      "@db": fileURLToPath(new URL("./src/plugins/fake-api/handlers/", __vite_injected_original_import_meta_url)),
      "@api-utils": fileURLToPath(new URL("./src/plugins/fake-api/utils/", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    chunkSizeWarningLimit: 5e3
  },
  optimizeDeps: {
    exclude: ["vuetify"],
    entries: [
      "./src/**/*.vue"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcmV6YWhhcnJpcy9EZXNrdG9wL0RvY3VtZW50L0FMUEhBIElOQyAtIENPTVBBTlkvQWxwaGEgUHJvZHVjdHMvQWxwaGEgLSBBcHByb3ZhbC9Gcm9udEVuZC9zdGFydGVyLWtpdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3JlemFoYXJyaXMvRGVza3RvcC9Eb2N1bWVudC9BTFBIQSBJTkMgLSBDT01QQU5ZL0FscGhhIFByb2R1Y3RzL0FscGhhIC0gQXBwcm92YWwvRnJvbnRFbmQvc3RhcnRlci1raXQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3JlemFoYXJyaXMvRGVza3RvcC9Eb2N1bWVudC9BTFBIQSUyMElOQyUyMC0lMjBDT01QQU5ZL0FscGhhJTIwUHJvZHVjdHMvQWxwaGElMjAtJTIwQXBwcm92YWwvRnJvbnRFbmQvc3RhcnRlci1raXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgVnVlUm91dGVyQXV0b0ltcG9ydHMsIGdldFBhc2NhbENhc2VSb3V0ZU5hbWUgfSBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyJ1xuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcbmltcG9ydCBMYXlvdXRzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1sYXlvdXRzJ1xuaW1wb3J0IHZ1ZXRpZnkgZnJvbSAndml0ZS1wbHVnaW4tdnVldGlmeSdcbmltcG9ydCBzdmdMb2FkZXIgZnJvbSAndml0ZS1zdmctbG9hZGVyJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIC8vIERvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9wb3N2YS91bnBsdWdpbi12dWUtcm91dGVyXG4gICAgLy8gXHUyMTM5XHVGRTBGIFRoaXMgcGx1Z2luIHNob3VsZCBiZSBwbGFjZWQgYmVmb3JlIHZ1ZSBwbHVnaW5cbiAgICBWdWVSb3V0ZXIoe1xuICAgICAgZ2V0Um91dGVOYW1lOiByb3V0ZU5vZGUgPT4ge1xuICAgICAgICAvLyBDb252ZXJ0IHBhc2NhbCBjYXNlIHRvIGtlYmFiIGNhc2VcbiAgICAgICAgcmV0dXJuIGdldFBhc2NhbENhc2VSb3V0ZU5hbWUocm91dGVOb2RlKVxuICAgICAgICAgIC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCAnJDEtJDInKVxuICAgICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICB9LFxuXG4gICAgfSksXG4gICAgdnVlKHtcbiAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIGlzQ3VzdG9tRWxlbWVudDogdGFnID0+IHRhZyA9PT0gJ3N3aXBlci1jb250YWluZXInIHx8IHRhZyA9PT0gJ3N3aXBlci1zbGlkZScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIFZ1ZURldlRvb2xzKCksXG4gICAgdnVlSnN4KCksXG5cbiAgICAvLyBEb2NzOiBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnktbG9hZGVyL3RyZWUvbWFzdGVyL3BhY2thZ2VzL3ZpdGUtcGx1Z2luXG4gICAgdnVldGlmeSh7XG4gICAgICBzdHlsZXM6IHtcbiAgICAgICAgY29uZmlnRmlsZTogJ3NyYy9hc3NldHMvc3R5bGVzL3ZhcmlhYmxlcy9fdnVldGlmeS5zY3NzJyxcbiAgICAgIH0sXG4gICAgfSksXG5cbiAgICAvLyBEb2NzOiBodHRwczovL2dpdGh1Yi5jb20vam9obmNhbXBpb25qci92aXRlLXBsdWdpbi12dWUtbGF5b3V0cyN2aXRlLXBsdWdpbi12dWUtbGF5b3V0c1xuICAgIExheW91dHMoe1xuICAgICAgbGF5b3V0c0RpcnM6ICcuL3NyYy9sYXlvdXRzLycsXG4gICAgfSksXG5cbiAgICAvLyBEb2NzOiBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tdnVlLWNvbXBvbmVudHMjdW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGRpcnM6IFsnc3JjL0Bjb3JlL2NvbXBvbmVudHMnLCAnc3JjL3ZpZXdzL2RlbW9zJywgJ3NyYy9jb21wb25lbnRzJ10sXG4gICAgICBkdHM6IHRydWUsXG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgY29tcG9uZW50TmFtZSA9PiB7XG4gICAgICAgICAgLy8gQXV0byBpbXBvcnQgYFZ1ZUFwZXhDaGFydHNgXG4gICAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUgPT09ICdWdWVBcGV4Q2hhcnRzJylcbiAgICAgICAgICAgIHJldHVybiB7IG5hbWU6ICdkZWZhdWx0JywgZnJvbTogJ3Z1ZTMtYXBleGNoYXJ0cycsIGFzOiAnVnVlQXBleENoYXJ0cycgfVxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcblxuICAgIC8vIERvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1hdXRvLWltcG9ydCN1bnBsdWdpbi1hdXRvLWltcG9ydFxuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgJ0B2dWV1c2UvY29yZScsICdAdnVldXNlL21hdGgnLCAndnVlLWkxOG4nLCAncGluaWEnXSxcbiAgICAgIGRpcnM6IFtcbiAgICAgICAgJy4vc3JjL0Bjb3JlL3V0aWxzJyxcbiAgICAgICAgJy4vc3JjL0Bjb3JlL2NvbXBvc2FibGUvJyxcbiAgICAgICAgJy4vc3JjL2NvbXBvc2FibGVzLycsXG4gICAgICAgICcuL3NyYy91dGlscy8nLFxuICAgICAgICAnLi9zcmMvcGx1Z2lucy8qL2NvbXBvc2FibGVzLyonLFxuICAgICAgXSxcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuXG4gICAgICAvLyBcdTIxMzlcdUZFMEYgRGlzYWJsZWQgdG8gYXZvaWQgY29uZnVzaW9uICYgYWNjaWRlbnRhbCB1c2FnZVxuICAgICAgaWdub3JlOiBbJ3VzZUNvb2tpZXMnLCAndXNlU3RvcmFnZSddLFxuICAgIH0pLFxuXG4gICAgc3ZnTG9hZGVyKCksXG5cbiAgXSxcbiAgZGVmaW5lOiB7ICdwcm9jZXNzLmVudic6IHt9IH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQHRoZW1lQ29uZmlnJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3RoZW1lQ29uZmlnLnRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGNvcmUnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0Bjb3JlJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGxheW91dHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0BsYXlvdXRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGltYWdlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL2ltYWdlcy8nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAc3R5bGVzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9hc3NldHMvc3R5bGVzLycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0Bjb25maWd1cmVkLXZhcmlhYmxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL3N0eWxlcy92YXJpYWJsZXMvX3RlbXBsYXRlLnNjc3MnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAZGInOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3BsdWdpbnMvZmFrZS1hcGkvaGFuZGxlcnMvJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGFwaS11dGlscyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvcGx1Z2lucy9mYWtlLWFwaS91dGlscy8nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwMCxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWyd2dWV0aWZ5J10sXG4gICAgZW50cmllczogW1xuICAgICAgJy4vc3JjLyoqLyoudnVlJyxcbiAgICBdLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK2YsU0FBUyxxQkFBcUI7QUFDN2hCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxzQkFBc0IsOEJBQThCO0FBQzdELE9BQU8sZUFBZTtBQUN0QixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLGFBQWE7QUFDcEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sZUFBZTtBQVh3UyxJQUFNLDJDQUEyQztBQWMvVyxJQUFP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
