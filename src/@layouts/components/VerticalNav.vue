<script lang="ts" setup>
import { GroupWithFormats } from '@/models/document-number/group.with.format'
import { mapGroupedWithFormat } from '@/utils/model.mapper'
import { i18n } from '@/plugins/i18n'
import { layoutConfig } from '@layouts'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'
import type { NavLink, NavSectionTitle, VerticalNavItems } from '@layouts/types'
import { getComputedNavLinkToProp, isNavLinkActive } from '@layouts/utils'
import type { Component } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VNodeRenderer } from './VNodeRenderer'

interface Props {
  tag?: string | Component
  navItems: VerticalNavItems
  isOverlayNavActive: boolean
  toggleIsOverlayNavActive: (value: boolean) => void
}

const router = useRouter()
const props = withDefaults(defineProps<Props>(), { tag: 'aside' })
const refNav = ref()
const isHovered = useElementHover(refNav)
provide(injectionKeyIsVerticalNavHovered, isHovered)
const configStore = useLayoutConfigStore()
const route = useRoute()

watch(() => route.name, () => props.toggleIsOverlayNavActive(false))

const isVerticalNavScrolled = ref(false)
const handleNavScroll = (evt: Event) => {
  isVerticalNavScrolled.value = (evt.target as HTMLElement).scrollTop > 0
}

const hideTitleAndIcon = configStore.isVerticalNavMini(isHovered)

const isBookingDocumentNumberDialogVisible = ref(false)
const isRefetchList = ref(false)
const groupedWithFormat = ref<GroupWithFormats[]>([])

const fetchNumberingFormat = async () => {
  try {
    const res = await useApi('/numbering/format/grouped', { method: 'GET' })
    const value = res.data.value as { data: any[] }
    groupedWithFormat.value = (value?.data && Array.isArray(value.data))
      ? value.data.map(mapGroupedWithFormat)
      : []
  } catch {
    groupedWithFormat.value = []
  }
}

onMounted(() => fetchNumberingFormat())

const refetchList = () => {
  if (isRefetchList.value) window.location.reload()
}

const role = Number(useCookie('role').value)
const homeRoute = role === 1 ? '/reguler/dashboard' : role === 99 ? '/admin/users' : '/'
const name = useCookie('name')
const jobPosition = useCookie('jobPosition')

const getInitials = computed(() => {
  const fullName = name.value || ''
  const parts = fullName.trim().split(' ')
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || parts[0]?.[1] || ''
  return (first + second).toUpperCase()
})

const handleLogout = () => {
  useCookie('accessToken').value = null
  useCookie('name').value = null
  useCookie('role').value = null
  window.location.href = '/'
}

const sbThemes = [
  { name: 'light', icon: 'tabler-sun-high' },
  { name: 'dark', icon: 'tabler-moon-stars' },
  { name: 'system', icon: 'tabler-device-desktop-analytics' },
]

type SbGroup = { heading: string; items: NavLink[] }

const groupedNavItems = computed<SbGroup[]>(() => {
  const groups: SbGroup[] = []
  let cur: SbGroup | null = null
  for (const item of props.navItems) {
    if ('heading' in item) {
      cur = { heading: (item as NavSectionTitle).heading, items: [] }
      groups.push(cur)
    } else if (cur && 'title' in item) {
      cur.items.push(item as NavLink)
    }
  }
  return groups
})

const collapsedSections = ref(new Set<string>())

const toggleSection = (key: string) => {
  if (hideTitleAndIcon.value) return
  const s = new Set(collapsedSections.value)
  s.has(key) ? s.delete(key) : s.add(key)
  collapsedSections.value = s
}

const { t } = useI18n()

const localeCookie = useCookie<string>('locale', { default: () => 'id' })
const currentLocale = computed(() => localeCookie.value || 'id')

const setLocale = (lang: string) => {
  localeCookie.value = lang
  i18n.global.locale.value = lang as 'id' | 'en'
}

const langOptions = [
  { code: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]
</script>

<template>
  <Component
    :is="props.tag"
    ref="refNav"
    data-allow-mismatch
    class="layout-vertical-nav"
    :class="{
      'overlay-nav': configStore.isLessThanOverlayNavBreakpoint,
      'hovered': isHovered,
      'visible': isOverlayNavActive,
      'scrolled': isVerticalNavScrolled,
    }"
  >
    <!-- Header -->
    <div class="nav-header">
      <slot name="nav-header">
        <RouterLink :to="homeRoute" class="app-logo app-title-wrapper">
          <VNodeRenderer :nodes="layoutConfig.app.logo" />
          <Transition name="vertical-nav-app-title">
            <div v-show="!hideTitleAndIcon" class="app-brand-text">
              <h1 class="app-logo-title">{{ layoutConfig.app.title }}</h1>
              <span class="app-logo-sub">Digital Mail</span>
            </div>
          </Transition>
        </RouterLink>

        <div class="header-action">
          <!-- Chevron collapse/expand button (desktop) -->
          <button
            class="sb-collapse-btn d-none d-lg-flex"
            :title="configStore.isVerticalNavCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
            @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m14 7-5 5 5 5" />
            </svg>
          </button>
          <!-- Close overlay (mobile) -->
          <Component
            :is="layoutConfig.app.iconRenderer || 'div'"
            class="d-lg-none"
            v-bind="layoutConfig.icons.close"
            @click="toggleIsOverlayNavActive(false)"
          />
        </div>
      </slot>
    </div>

    <slot name="before-nav-items">
      <div class="vertical-nav-items-shadow" />
    </slot>

    <PerfectScrollbar
      tag="nav"
      class="sb-nav nav-items"
      :options="{ wheelPropagation: false }"
      @ps-scroll-y="handleNavScroll"
    >
      <!-- "Buat Baru" section — role 1 only -->
      <div
        v-if="role === 1"
        class="sb-group"
        :class="{ 'sb-group--collapsed': collapsedSections.has('__baru') }"
      >
        <button class="sb-section" @click="toggleSection('__baru')">
          <span v-show="!hideTitleAndIcon" class="sb-section__label">{{ t('nav.createNew') }}</span>
          <span v-show="!hideTitleAndIcon" class="sb-section__chev">
            <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7 10 5 5 5-5" /></svg>
          </span>
          <span v-show="hideTitleAndIcon" class="sb-mini-divider" />
        </button>
        <div class="sb-items">
          <div class="sb-items-inner">
            <button
              class="sb-action"
              :class="{ 'sb-action--mini': hideTitleAndIcon }"
              title="Booking Number"
              @click="isBookingDocumentNumberDialogVisible = true"
            >
              <span class="sb-action__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke-width="1.7" d="M10.5 7h9.5M10.5 16.5h9.5" />
                  <path stroke-width="1.5" d="M4.1 5.9 5.5 5.1V10" />
                  <path stroke-width="1.5" d="M3.7 14.1c.1-1.5 2.6-1.5 2.6.1 0 1.1-2.6 2.3-2.6 4.1h2.8" />
                </svg>
              </span>
              <span v-show="!hideTitleAndIcon" class="sb-action__label">{{ t('nav.bookingNumber') }}</span>
              <span v-show="!hideTitleAndIcon" class="sb-action__plus">
                <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M12 5.5v13M5.5 12h13" /></svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Dynamic groups from navigation/vertical/index.ts -->
      <div
        v-for="group in groupedNavItems"
        :key="group.heading"
        class="sb-group"
        :class="{ 'sb-group--collapsed': collapsedSections.has(group.heading) }"
      >
        <button class="sb-section" @click="toggleSection(group.heading)">
          <span v-show="!hideTitleAndIcon" class="sb-section__label">{{ t(group.heading) }}</span>
          <span v-show="!hideTitleAndIcon" class="sb-section__chev">
            <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7 10 5 5 5-5" /></svg>
          </span>
          <span v-show="hideTitleAndIcon" class="sb-mini-divider" />
        </button>
        <div class="sb-items">
          <div class="sb-items-inner">
            <Component
              :is="item.to ? 'RouterLink' : 'a'"
              v-for="(item, i) in group.items"
              :key="i"
              class="sb-link"
              :class="{ 'sb-link--active': isNavLinkActive(item, router) }"
              v-bind="getComputedNavLinkToProp(item)"
              :title="item.title"
            >
              <span class="sb-link__ico">
                <Component
                  :is="layoutConfig.app.iconRenderer || 'span'"
                  v-bind="(item.icon ?? layoutConfig.verticalNav?.defaultNavItemIconProps) as Record<string, unknown>"
                />
              </span>
              <span v-show="!hideTitleAndIcon" class="sb-link__label">{{ t(item.title) }}</span>
            </Component>
          </div>
        </div>
      </div>
    </PerfectScrollbar>

    <!-- Sidebar footer: user profile + theme switcher -->
    <div class="sb-footer">
      <div class="sb-footer__divider" />
      <div class="sb-footer__body" :class="{ 'sb-footer__body--mini': hideTitleAndIcon }">
        <VBadge dot location="bottom right" offset-x="3" offset-y="3" bordered color="success">
          <VAvatar class="cursor-pointer sb-ava" size="34">
            {{ getInitials }}
            <VMenu activator="parent" content-class="sb-menu sb-menu--account" width="230" location="top end" offset="14px">
              <VList>
                <VListItem>
                  <template #prepend>
                    <VListItemAction start>
                      <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                        <VAvatar class="sb-ava">{{ getInitials }}</VAvatar>
                      </VBadge>
                    </VListItemAction>
                  </template>
                  <VListItemTitle class="font-weight-semibold">{{ name }}</VListItemTitle>
                  <VListItemSubtitle>{{ jobPosition }}</VListItemSubtitle>
                </VListItem>
                <VDivider class="my-2" />
                <VListItem link :to="{ name: 'profile' }">
                  <template #prepend>
                    <VIcon class="me-2" icon="tabler-user" size="22" />
                  </template>
                  <VListItemTitle>{{ t('nav.profileMenuItem') }}</VListItemTitle>
                </VListItem>
                <VDivider class="my-2" />
                <VListItem @click="handleLogout">
                  <template #prepend>
                    <VIcon class="me-2" icon="tabler-logout" size="22" />
                  </template>
                  <VListItemTitle>{{ t('nav.logoutMenuItem') }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VAvatar>
        </VBadge>
        <div v-show="!hideTitleAndIcon" class="sb-footer__info">
          <span class="sb-footer__name">{{ name }}</span>
          <span class="sb-footer__pos">{{ jobPosition }}</span>
        </div>
        <ThemeSwitcher v-show="!hideTitleAndIcon" :themes="sbThemes" />

        <!-- Language switcher -->
        <IconBtn
          v-show="!hideTitleAndIcon"
          color="rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))"
        >
          <span class="sb-lang-flag">{{ currentLocale === 'id' ? '🇮🇩' : '🇬🇧' }}</span>
          <VTooltip activator="parent" open-delay="800" scroll-strategy="close">
            {{ t('language.select') }}
          </VTooltip>
          <VMenu activator="parent" content-class="sb-menu" offset="12px" :width="200" location="top end">
            <VList>
              <VListItem
                v-for="lang in langOptions"
                :key="lang.code"
                :value="lang.code"
                :class="{ 'v-list-item--active': currentLocale === lang.code }"
                @click="setLocale(lang.code)"
              >
                <template #prepend>
                  <span class="me-2" style="font-size:18px;">{{ lang.flag }}</span>
                </template>
                <VListItemTitle>{{ lang.label }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </div>
    </div>

    <slot name="after-nav-items" />
  </Component>

  <BookingDocumentNumberDialog
    v-model:isDialogVisible="isBookingDocumentNumberDialogVisible"
    :data="groupedWithFormat"
    v-model:is-refetch-list="isRefetchList"
    @update:isRefetchList="refetchList"
  />
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;
}

.app-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}

.app-logo-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
  text-transform: capitalize;
  white-space: nowrap;
}

.app-logo-sub {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sb-muted);
  white-space: nowrap;
  margin-top: 3px;
}
</style>

<style lang="scss">
@use "@configured-variables" as variables;
@use "@core/scss/base/mixins";
@use "@layouts/styles/mixins" as layoutsMixins;

// ── Layout system styles (preserved) ────────────────────────────
.layout-nav-type-vertical {
  .layout-vertical-nav {
    color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));

    @include mixins.elevation(4);

    .nav-header {
      padding-inline-end: 0.125rem;

      .app-logo .app-title {
        font-size: 22px;
      }
    }

    .nav-items {
      padding-block: 0.25rem;
    }
  }

  &.layout-vertical-nav-collapsed {
    .layout-vertical-nav:not(.hovered) {
      .nav-header .header-action {
        opacity: 0;
      }
    }
  }
}

// ── Core layout (position, size, flex — must stay) ───────────────
.layout-vertical-nav {
  position: fixed;
  z-index: variables.$layout-vertical-nav-z-index;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: variables.$layout-vertical-nav-width;
  inset-block-start: 0;
  inset-inline-start: 0;
  transition: inline-size 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  will-change: transform, inline-size;

  .nav-header {
    display: flex;
    align-items: center;

    .header-action {
      cursor: pointer;

      @at-root {
        #{variables.$selector-vertical-nav-mini} .nav-header .header-action {
          &.nav-pin,
          &.nav-unpin {
            display: none !important;
          }
        }
      }
    }
  }

  .app-title-wrapper { margin-inline-end: auto; }

  .nav-items { block-size: 100%; }

  .nav-item-title {
    overflow: hidden;
    margin-inline-end: auto;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layout-vertical-nav-collapsed & {
    &:not(.hovered) {
      inline-size: variables.$layout-vertical-nav-collapsed-width;
    }
  }
}

// ── Sidebar design tokens — global so VMenu teleports can use them
:root {
  --sb-navy:       #314f91;
  --sb-navy-tint:  #e4efff;
  --sb-text:       #494d54;
  --sb-strong:     #22272f;
  --sb-muted:      #82868e;
  --sb-section-c:  #95989f;
  --sb-hover:      #f3f4f7;
  --sb-divider:    #e4e6ea;
  --sb-act-border: #d7deed;
}

.v-theme--dark {
  --sb-navy:       #6d8fe2;
  --sb-navy-tint:  #1d283f;
  --sb-text:       #b8bec8;
  --sb-strong:     #eff2f7;
  --sb-muted:      #82868e;
  --sb-section-c:  #6b7079;
  --sb-hover:      #1e2229;
  --sb-divider:    #25292f;
  --sb-act-border: #2c3340;
}

// ── Collapse button (chevron) ────────────────────────────────────
.layout-vertical-nav {
  .sb-collapse-btn {
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    color: var(--sb-muted);
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    flex: none;

    svg {
      width: 18px;
      height: 18px;
      transition: transform 0.25s ease-in-out;
    }

    &:hover {
      background: var(--sb-hover);
      color: var(--sb-strong);
    }
  }
}

// Rotate chevron when nav is collapsed (pointing right = expand)
.layout-vertical-nav-collapsed .layout-vertical-nav .sb-collapse-btn svg {
  transform: rotate(180deg);
}

// Hide collapse button in mini mode (collapsed + not hovered)
.layout-vertical-nav-collapsed .layout-vertical-nav:not(.hovered) .sb-collapse-btn {
  display: none !important;
}

// ── Nav container ────────────────────────────────────────────────
.layout-vertical-nav {
  .sb-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 14px 0;
    overflow-x: hidden;
  }

  // ── Group ───────────────────────────────────────────────────────
  .sb-group {
    display: flex;
    flex-direction: column;
  }

  // ── Section header (accordion toggle) ───────────────────────────
  .sb-section {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--sb-section-c);
    padding: 14px 12px 7px;
    white-space: nowrap;
    transition: color 0.16s ease;

    &:hover { color: var(--sb-strong); }

    .sb-section__label { flex: 1; text-align: left; }

    .sb-section__chev {
      width: 16px;
      height: 16px;
      flex: none;
      display: grid;
      place-items: center;
      color: var(--sb-muted);
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);

      svg { width: 14px; height: 14px; }
    }

    .sb-mini-divider {
      display: block;
      height: 1px;
      width: 24px;
      margin: 0 auto;
      background: var(--sb-divider);
    }
  }

  // Collapsed state: rotate chevron + hide items
  .sb-group--collapsed {
    .sb-section .sb-section__chev { transform: rotate(-90deg); }
    .sb-items { max-height: 0; }
  }

  // ── Accordion expand/collapse ────────────────────────────────────
  .sb-items {
    overflow: hidden;
    max-height: 480px; // fits up to ~10 items at 44px + padding
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sb-items-inner {
    display: flex;
    flex-direction: column;
  }

  // ── Action button (Booking Number) ───────────────────────────────
  .sb-action {
    display: flex;
    align-items: center;
    gap: 12px;
    width: calc(100% - 4px);
    margin: 1px 2px;
    height: 46px;
    padding: 0 11px 0 12px;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 700;
    letter-spacing: -0.008em;
    color: var(--sb-navy);
    background: transparent;
    border: 1.5px dashed var(--sb-act-border);
    border-radius: 11px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.18s ease, border-color 0.18s ease;

    &:hover {
      background: var(--sb-navy-tint);
      border-color: var(--sb-navy);
      border-style: solid;
    }

    .sb-action__ico {
      width: 22px;
      height: 22px;
      flex: none;
      display: grid;
      place-items: center;

      svg { width: 21px; height: 21px; }
    }

    .sb-action__label { flex: 1; text-align: left; }

    .sb-action__plus {
      width: 23px;
      height: 23px;
      border-radius: 7px;
      background: var(--sb-navy);
      color: #fff;
      display: grid;
      place-items: center;
      flex: none;

      svg { width: 15px; height: 15px; }
    }

    &.sb-action--mini {
      width: 52px;
      margin: 2px auto;
      padding: 0;
      justify-content: center;
      background: var(--sb-navy);
      border-color: var(--sb-navy);
      border-style: solid;
      color: #fff;
    }
  }

  // ── Nav links ────────────────────────────────────────────────────
  .sb-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: 44px;
    padding: 0 12px;
    margin: 1px 2px;
    border-radius: 10px;
    color: var(--sb-text);
    text-decoration: none;
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: -0.006em;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.16s ease, color 0.16s ease;

    &:hover {
      background: var(--sb-hover);
      color: var(--sb-strong);
    }

    .sb-link__ico {
      width: 22px;
      height: 22px;
      flex: none;
      display: grid;
      place-items: center;
      color: inherit;

      .v-icon { font-size: 21px !important; color: inherit !important; }
    }

    .sb-link__label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // Active state: navy tint bg + left indicator bar
    &.sb-link--active {
      background: var(--sb-navy-tint) !important;
      color: var(--sb-navy) !important;
      font-weight: 700;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3.5px;
        height: 22px;
        border-radius: 0 3px 3px 0;
        background: var(--sb-navy);
      }
    }
  }
}

// ── Mini mode adjustments ────────────────────────────────────────
$mini: ".layout-vertical-nav-collapsed .layout-vertical-nav:not(.hovered)";

#{$mini} {
  .sb-section {
    pointer-events: none;
    padding: 16px 0 6px;
  }

  // Always show items (no accordion collapse in mini mode)
  .sb-items {
    max-height: 480px !important;
  }

  .sb-link {
    justify-content: center;
    padding: 0;
    width: 52px;
    height: 48px;
    margin: 2px auto;
    gap: 0;

    &.sb-link--active::before {
      height: 26px;
    }
  }
}

// ── Sidebar footer ───────────────────────────────────────────────
.layout-vertical-nav {
  .sb-footer {
    padding: 0 14px 12px;
    flex-shrink: 0;

    &__divider {
      height: 1px;
      background: var(--sb-divider);
      margin-bottom: 10px;
    }

    &__body {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 8px;
      border-radius: 10px;
      transition: background 0.16s ease;

      &:hover { background: var(--sb-hover); }

      &--mini {
        justify-content: center;
        padding: 6px 0;
      }
    }

    &__info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    &__name {
      font-size: 13px;
      font-weight: 600;
      color: var(--sb-strong);
      letter-spacing: -0.006em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    &__pos {
      font-size: 11px;
      color: var(--sb-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
  }

  .sb-ava {
    background-color: var(--sb-navy-tint) !important;
    color: var(--sb-navy) !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    flex-shrink: 0;
  }
}

// ── Meridian dropdown menus (sb-menu content-class) ─────────────
// VMenu teleports to body so these must be global (non-scoped)
.sb-menu {
  // Surface card
  > .v-overlay__content {
    border-radius: 14px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06) !important;
    overflow: hidden;
  }

  .v-list {
    padding: 6px !important;
    border-radius: 14px !important;
    background: rgb(var(--v-theme-surface)) !important;
  }

  .v-list-item {
    border-radius: 8px !important;
    min-height: 40px !important;
    padding-inline: 10px !important;

    &:hover > .v-list-item__overlay {
      opacity: 0 !important;
    }

    &:hover {
      background: var(--sb-hover) !important;
    }

    // Active / selected state — replace Vuetify primary purple with navy
    &--active,
    &.v-list-item--active {
      background: var(--sb-navy-tint) !important;
      color: var(--sb-navy) !important;

      .v-list-item__prepend .v-icon,
      .v-icon {
        color: var(--sb-navy) !important;
        opacity: 1 !important;
      }
    }

    // Non-active icon & text opacity
    .v-list-item__prepend .v-icon {
      opacity: 0.75;
    }

    .v-list-item-title {
      font-size: 14px !important;
      font-weight: 500 !important;
      letter-spacing: -0.005em !important;
    }
  }

  // Divider inside menu
  .v-divider {
    border-color: var(--sb-divider) !important;
    margin-block: 4px !important;
    opacity: 1 !important;
  }

  // Avatar in account header row
  .sb-ava {
    background-color: var(--sb-navy-tint) !important;
    color: var(--sb-navy) !important;
    font-weight: 700 !important;
  }

}

// User header row — hanya di account menu, bukan theme menu
.sb-menu--account {
  .v-list-item:first-child {
    cursor: default;
    pointer-events: none;

    .v-list-item-title {
      font-size: 14.5px !important;
      font-weight: 600 !important;
      color: var(--sb-strong) !important;
    }

    .v-list-item-subtitle {
      font-size: 12px !important;
      color: var(--sb-muted) !important;
      opacity: 1 !important;
    }
  }
}

// ── Transition animations ────────────────────────────────────────
.vertical-nav-section-title-enter-active,
.vertical-nav-section-title-leave-active {
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
}

.vertical-nav-section-title-enter-from,
.vertical-nav-section-title-leave-to {
  opacity: 0;
  transform: translateX(15px);

  @include layoutsMixins.rtl {
    transform: translateX(-15px);
  }
}

.vertical-nav-app-title-enter-active,
.vertical-nav-app-title-leave-active {
  transition: opacity 0.1s ease-in-out, transform 0.12s ease-in-out;
}

.vertical-nav-app-title-enter-from,
.vertical-nav-app-title-leave-to {
  opacity: 0;
  transform: translateX(-15px);

  @include layoutsMixins.rtl {
    transform: translateX(15px);
  }
}

// Small screen vertical nav transition
.layout-vertical-nav {
  &:not(.visible) {
    @media (max-width: 1279px) {
      transform: translateX(-#{variables.$layout-vertical-nav-width});

      @include layoutsMixins.rtl {
        transform: translateX(variables.$layout-vertical-nav-width);
      }
    }
  }

  @media (max-width: 1279px) {
    transition: transform 0.25s ease-in-out;
  }
}
</style>
