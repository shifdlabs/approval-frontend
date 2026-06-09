<script lang="ts" setup>
import navItems from '@/navigation/vertical'
import Footer from '@/layouts/components/Footer.vue'
import { VerticalNavLayout } from '@layouts'
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar — hanya hamburger, hanya muncul di mobile -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center d-lg-none">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon size="26" icon="tabler-menu-2" />
        </IconBtn>
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss">
// Sembunyikan navbar sepenuhnya di desktop — user profile & theme toggle pindah ke sidebar
@media screen and (min-width: 1280px) {
  .layout-navbar {
    display: none !important;
  }
}
</style>
