<template>
  <div class="app-wrapper">

    <!-- ════════════════════════════════════════
         SECTION 1 — Header
    ════════════════════════════════════════ -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="header-title">{{ t('dashboard.title') }}</h1>
        <p class="header-subtitle">
          <span>{{ formattedDate }}</span>
          <span class="sep">·</span>
          <span class="live-clock">{{ currentTime }}</span>
          <span class="sep">·</span>
          <span>{{ greeting }}, {{ userName }} 👋</span>
        </p>
      </div>
      <div class="header-right">
        <button class="btn-primary" @click="buatSuratBaru">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span class="btn-label">{{ t('dashboard.createNew') }}</span>
        </button>
      </div>
    </header>

    <!-- ════════════════════════════════════════
         SECTION 2 — Alert Banner
    ════════════════════════════════════════ -->
    <div class="alert-banner" v-if="showAlert">
      <div class="alert-dot"></div>
      <span class="alert-text">
        <strong>{{ alertCount }} {{ t('dashboard.alertLetterWord') }}</strong> {{ t('dashboard.alertRestSuffix') }}
      </span>
      <button class="alert-link" @click="lihatSemua">
        {{ t('dashboard.viewAll') }}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>

    <!-- ════════════════════════════════════════
         SECTION 3 — Stat Cards (Filter + Grid)
    ════════════════════════════════════════ -->
    <div class="stats-section">

      <!-- Filter tabs + search bar -->
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in statTabs"
            :key="tab.value"
            class="tab"
            :class="{ active: activeStatTab === tab.value }"
            @click="activeStatTab = tab.value"
          >{{ tab.label }}</button>
        </div>
        <div class="search-wrapper">
          <div class="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQuery" type="text" :placeholder="t('dashboard.searchPlaceholder')" class="search-input"/>
            <svg v-if="isSearching" class="search-spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          </div>

          <!-- Dropdown hasil search -->
          <div v-if="searchQuery.trim().length > 0" class="search-dropdown">
            <div v-if="isSearching" class="search-state">
              <div class="search-loading-spinner"></div>
              <span>{{ t('dashboard.searching') }}</span>
            </div>
            <template v-else>
              <div v-if="searchResults.length === 0" class="search-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#d1d5db">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>{{ t('dashboard.noData') }}</span>
              </div>
              <div
                v-for="item in searchResults"
                :key="item.id"
                class="search-item"
                @click="lihatDocument(item.id)"
              >
                <span class="search-item-number">{{ item.document_number ?? '—' }}</span>
                <span class="search-item-subject">{{ item.subject }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 4 stat cards — 4col → 2col → 1col -->
      <div class="cards-grid">
        <div
          v-for="card in statCards"
          :key="card.id"
          class="stat-card"
          :style="{ '--top-color': card.topColor }"
        >
          <div class="card-bar"></div>
          <div class="card-top-row">
            <div class="card-icon" :style="{ background: card.iconBg, color: card.iconColor }">
              <span v-html="card.icon"></span>
            </div>
            <div class="card-badge" :class="card.badgeType">
              <span v-html="card.badgeIcon"></span>
              <span>{{ card.badge }}</span>
            </div>
          </div>
          <div class="card-number" :style="{ color: card.numberColor }">
            <span v-if="isLoading" class="shimmer"></span>
            <span v-else :class="{ 'fade-in': !isLoading }">{{ card.count }}</span>
          </div>
          <div class="card-label">{{ card.label }}</div>
          <div class="card-divider"></div>
          <div class="card-footer">
            <span class="card-note">{{ card.note }}</span>
            <button
              class="card-action"
              :style="{ color: card.actionColor }"
              @click="cardActions[card.id - 1]()"
            >
              {{ card.action }} →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         SECTION 4 — Main Content (Table + Widgets)
    ════════════════════════════════════════ -->
    <div class="main-content">

      <!-- ── Left: Surat Table ── -->
      <section class="left-col">
        <div class="table-card">

          <!-- Table header: title + tabs -->
          <div class="table-card-header">
            <div>
              <h2 class="section-title">{{ t('dashboard.latestLetters') }}</h2>
              <p class="section-sub">{{ t('dashboard.showing', { count: filteredSurat.length }) }}</p>
            </div>
            <div class="tab-group">
              <button
                v-for="tab in suratTabs"
                :key="tab.value"
                class="tab-btn"
                :class="{ active: activeSuratTab === tab.value }"
                @click="activeSuratTab = tab.value"
              >{{ tab.label }}</button>
            </div>
          </div>

          <!-- Desktop table — hidden on mobile, replaced by cards below -->
          <div class="table-wrapper">
            <table class="surat-table">
              <thead>
                <tr>
                  <th>{{ t('dashboard.columns.number') }}</th>
                  <th>{{ t('dashboard.columns.subject') }}</th>
                  <th>{{ t('dashboard.columns.fromTo') }}</th>
                  <th>{{ t('dashboard.columns.receivedAt') }}</th>
                  <th>{{ t('dashboard.columns.status') }}</th>
                  <th>{{ t('dashboard.columns.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(s, i) in filteredSurat"
                  :key="s.id"
                  class="table-row"
                  :style="{ animationDelay: i * 0.04 + 's' }"
                >
                  <td class="cell-nomor">{{ s.number }}</td>
                  <td class="cell-perihal">
                    <span class="perihal-text">{{ s.subject }}</span>
                    <span class="perihal-sub">{{ s.from_to }}</span>
                  </td>
                  <td class="cell-dari">{{ s.from_to }}</td>
                  <td class="cell-tanggal">{{ new Date(s.updated_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(s.status)">
                      <span class="status-dot"></span>{{ s.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-group">
                      <button v-if="s.status === 'Perlu Diperiksa'" class="btn-action primary" @click="lihatDocument(s.id)">{{ t('dashboard.actions.review') }}</button>
                      <button v-if="s.status === 'Ditolak'"         class="btn-action warning" @click="lihatDocument(s.id)">{{ t('dashboard.actions.revise') }}</button>
                      <button v-if="s.status === 'Perlu Diperiksa' || s.status === 'Ditolak'" class="btn-action ghost">{{ t('dashboard.actions.detail') }}</button>
                      <button v-if="s.status === 'In Progress' || s.status === 'Selesai'"     class="btn-action ghost" @click="lihatDocument(s.id)">{{ t('dashboard.actions.view') }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile card list — shown only on small screens instead of table -->
          <div class="mobile-surat-list">
            <div
              v-for="(s, i) in filteredSurat"
              :key="'m-' + s.id"
              class="surat-mobile-card"
              :style="{ animationDelay: i * 0.05 + 's' }"
            >
              <div class="smc-top">
                <span class="cell-nomor">{{ s.nomor }}</span>
                <span class="status-badge" :class="statusClass(s.status)">
                  <span class="status-dot"></span>{{ s.status }}
                </span>
              </div>
              <p class="smc-perihal">{{ s.perihal }}</p>
              <div class="smc-meta">
                <span>{{ s.dari }}</span>
                <span class="cell-tanggal">{{ s.tanggal }}</span>
              </div>
              <div class="smc-actions">
                <button v-if="s.status === 'Perlu Diperiksa'" class="btn-action primary">{{ t('dashboard.actions.review') }}</button>
                <button v-if="s.status === 'Ditolak'"         class="btn-action warning">{{ t('dashboard.actions.revise') }}</button>
                <button v-if="s.status === 'Perlu Diperiksa' || s.status === 'Ditolak'" class="btn-action ghost">{{ t('dashboard.actions.detail') }}</button>
                <button v-if="s.status === 'In Progress' || s.status === 'Selesai'" @click="lihatDocument(s.id)" class="btn-action ghost">{{ t('dashboard.actions.view') }}</button>
              </div>
            </div>
          </div>

          <div class="empty-state">
            <svg v-if="filteredSurat.length === 0" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#d1d5db">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p v-if="filteredSurat.length === 0">{{ t('dashboard.noLetters') }}</p>
          </div>

        </div>
      </section>

      <!-- ── Right: Widgets ── -->
      <aside class="right-col">

        <!-- Widget 1: Donut Chart — Status Distribution -->
        <div class="widget-card">
          <h3 class="widget-title">{{ t('dashboard.statusDist') }}</h3>
          <p class="widget-sub">{{ widgetDistribusiSub }}</p>
          <div class="donut-section">
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut-svg">
                <circle
                  v-for="(seg, i) in donutSegments"
                  :key="i"
                  cx="60" cy="60" r="45"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="16"
                  stroke-linecap="butt"
                  :stroke-dasharray="`${seg.dash} ${circumference - seg.dash}`"
                  :stroke-dashoffset="seg.offset"
                />
                <text x="60" y="56" text-anchor="middle" class="donut-center-num">{{ totalSurat }}</text>
                <text x="60" y="70" text-anchor="middle" class="donut-center-label">{{ t('dashboard.alertLetterWord') }}</text>
              </svg>
            </div>
            <ul class="donut-legend">
              <li v-for="item in statusDistribution" :key="item.label" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-count">{{ item.count }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Widget 2: Deadline Tracker -->
        <div class="widget-card">
          <h3 class="widget-title">{{ t('dashboard.nearDeadline') }}</h3>
          <p class="widget-sub">{{ t('dashboard.needsAction') }}</p>
          <div class="deadline-list">
            <div v-for="dl in mappedDeadlines" :key="dl.id" class="deadline-item">
              <div class="deadline-top">
                <span class="deadline-name">{{ dl.name }}</span>
                <span class="deadline-label" :class="dl.urgencyClass">{{ dl.urgency }}</span>
              </div>
              <div class="deadline-bar-track">
                <div class="deadline-bar-fill" :style="{ width: dl.progress + '%', background: dl.barColor }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget 3: Activity Feed -->
        <div class="widget-card">
          <h3 class="widget-title">{{ t('dashboard.recentActivity') }}</h3>
          <p class="widget-sub">{{ t('dashboard.timeLog') }}</p>
          <div class="activity-list">
            <div v-for="act in mappedActivities" :key="act.id" class="activity-item">
              <div class="activity-icon" :style="{ background: act.iconBg, color: act.iconColor }">
                <span v-html="act.icon"></span>
              </div>
              <div class="activity-body">
                <p class="activity-text" v-html="act.text"></p>
                <span class="activity-time">{{ act.time }}</span>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </div>

  </div>
</template>

<script setup>
import { useDashboardController } from '@/controllers/reguler/document-dashboard-controller'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })

// ════════════════════════════════════════
// SECTION 1 & 2 — Header & Alert
// ════════════════════════════════════════

const userName   = useCookie('name')
const showAlert  = ref(false)
const alertCount = ref(0)

const activeSuratTab = ref('semua')

const suratTabs = computed(() => [
  { value: 'semua',    label: t('dashboard.tabs.all') },
  { value: 'internal', label: t('common.internal') },
  { value: 'external', label: t('common.external') },
])

const tabTypeMap = { semua: 0, internal: 1, external: 2 }

const lihatDocument = id => router.push(`/preview/${id}`)

const dateLocale = computed(() => locale.value === 'id' ? 'id-ID' : 'en-US')

const now = new Date()

const formattedDate = computed(() =>
  now.toLocaleDateString(dateLocale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const greeting = computed(() => {
  const h = now.getHours()
  if (h < 11) return t('dashboard.greeting.morning')
  if (h < 15) return t('dashboard.greeting.afternoon')
  if (h < 18) return t('dashboard.greeting.evening')
  return t('dashboard.greeting.night')
})

const buatSuratBaru = () => router.push('/document/create')
const lihatSemua    = () => router.push('/reguler/authorization')

const cardActions = {
  0: () => router.push('/reguler/authorization'),
  1: () => router.push('/reguler/progress'),
  2: () => router.push('/reguler/rejected'),
  3: () => router.push('/reguler/complete'),
}

// ════════════════════════════════════════
// SECTION 3 — Stat Cards + API
// ════════════════════════════════════════

const {
  summary, deadlines, activities, recentDocuments,
  isLoading, fetchSummary, fetchDeadlines, fetchActivities, fetchRecentDocuments,
  searchResults, isSearching, searchDocuments,
} = useDashboardController()

const activeStatTab = ref('semua')
const searchQuery   = ref('')

const statTabs = computed(() => [
  { label: t('dashboard.tabs.all'),      value: 'semua'  },
  { label: t('dashboard.tabs.today'),    value: 'hari'   },
  { label: t('dashboard.tabs.thisWeek'), value: 'minggu' },
  { label: t('dashboard.tabs.thisMonth'),value: 'bulan'  },
])

const widgetDistribusiSub = computed(() => {
  const periods = {
    semua:  t('dashboard.period.all'),
    hari:   t('dashboard.period.today'),
    minggu: t('dashboard.period.week'),
    bulan:  t('dashboard.period.month'),
  }
  return t('dashboard.totalLetters', {
    count: totalSurat.value,
    period: periods[activeStatTab.value] ?? t('dashboard.period.all'),
  })
})

const warnIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
const okIcon   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`

const statCards = ref([
  {
    id: 1, topColor: '#f59e0b', iconBg: 'rgba(245,158,11,.15)', iconColor: '#f59e0b',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    badgeType: 'badge-warn', badgeIcon: warnIcon, badge: '-',
    count: '-', numberColor: '#d97706', label: t('status.needsReview'),
    note: '-', action: t('dashboard.actions.review'), actionColor: '#d97706',
  },
  {
    id: 2, topColor: '#2563eb', iconBg: 'rgba(37,99,235,.15)', iconColor: '#3b82f6',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><line x1="12" y1="13" x2="12" y2="21"/></svg>`,
    badgeType: 'badge-ok', badgeIcon: okIcon, badge: '-',
    count: '-', numberColor: '#2563eb', label: t('status.inProgress'),
    note: '-', action: t('dashboard.actions.view'), actionColor: '#2563eb',
  },
  {
    id: 3, topColor: '#ef4444', iconBg: 'rgba(239,68,68,.15)', iconColor: '#ef4444',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`,
    badgeType: 'badge-warn', badgeIcon: warnIcon, badge: '-',
    count: '-', numberColor: '#dc2626', label: t('status.rejected'),
    note: '-', action: t('dashboard.actions.tinjau'), actionColor: '#dc2626',
  },
  {
    id: 4, topColor: '#10b981', iconBg: 'rgba(16,185,129,.15)', iconColor: '#10b981',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>`,
    badgeType: 'badge-ok', badgeIcon: okIcon, badge: '-',
    count: '-', numberColor: '#059669', label: t('dashboard.cardCompletedLabel'),
    note: '-', action: t('dashboard.actions.view'), actionColor: '#059669',
  },
])

const animateCount = (index, targetValue) => {
  const delay    = 1000
  const duration = 1500
  const steps    = 60
  const stepTime = duration / steps
  const target   = parseInt(targetValue) || 0
  let current    = 0

  setTimeout(() => {
    if (index === 0) isLoading.value = false

    const timer = setInterval(() => {
      current += Math.ceil(target / steps)
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      statCards.value[index].count = String(current)
    }, stepTime)
  }, delay)
}

const updateCardsFromSummary = () => {
  if (!summary.value) return

  const s = summary.value

  animateCount(0, s.need_approval.total)
  animateCount(1, s.in_progress.total)
  animateCount(2, s.rejected.total)
  animateCount(3, s.completed.total)

  statCards.value[0].label  = t('status.needsReview')
  statCards.value[0].action = t('dashboard.actions.review')
  statCards.value[1].label  = t('status.inProgress')
  statCards.value[1].action = t('dashboard.actions.view')
  statCards.value[2].label  = t('status.rejected')
  statCards.value[2].action = t('dashboard.actions.tinjau')
  statCards.value[3].label  = t('dashboard.cardCompletedLabel')
  statCards.value[3].action = t('dashboard.actions.view')

  const isWarn0 = s.need_approval.alert_type === 'warning'
  statCards.value[0].badge     = isWarn0
    ? t('dashboard.badge.oldestPending', { days: s.need_approval.oldest_pending_days })
    : t('dashboard.badge.onTrack')
  statCards.value[0].badgeType = isWarn0 ? 'badge-warn' : 'badge-ok'
  statCards.value[0].badgeIcon = isWarn0 ? warnIcon : okIcon
  statCards.value[0].note      = t('dashboard.noteNeedApproval', { urgent: s.need_approval.urgent, normal: s.need_approval.normal })

  const isWarn1 = s.in_progress.alert_type === 'warning'
  statCards.value[1].badge     = isWarn1
    ? t('dashboard.noteInProgress', { days: s.in_progress.longest_processing_days })
    : t('dashboard.badge.onTrack')
  statCards.value[1].badgeType = isWarn1 ? 'badge-warn' : 'badge-ok'
  statCards.value[1].badgeIcon = isWarn1 ? warnIcon : okIcon
  statCards.value[1].note      = t('dashboard.noteInProgress', { days: s.in_progress.longest_processing_days })

  const isWarn2 = s.rejected.alert_type === 'warning'
  statCards.value[2].badge     = isWarn2
    ? t('dashboard.badge.needsRevision', { n: s.rejected.mine_needs_revision })
    : t('dashboard.badge.noRejected')
  statCards.value[2].badgeType = isWarn2 ? 'badge-warn' : 'badge-ok'
  statCards.value[2].badgeIcon = isWarn2 ? warnIcon : okIcon
  statCards.value[2].note      = t('dashboard.noteRejected', { n: s.rejected.mine_needs_revision })

  statCards.value[3].badge     = t('dashboard.badge.onTrack')
  statCards.value[3].badgeType = 'badge-ok'
  statCards.value[3].badgeIcon = okIcon
  statCards.value[3].note      = t('dashboard.noteCompleted', { total: s.completed.total_year })

  showAlert.value  = s.need_approval.oldest_pending_days > 1
  alertCount.value = s.need_approval.total

  statusDistribution.value = [
    { label: t('status.completed'),   count: s.completed.total,     color: '#10b981' },
    { label: t('status.needsReview'), count: s.need_approval.total, color: '#f59e0b' },
    { label: t('status.inProgress'),  count: s.in_progress.total,   color: '#3b82f6' },
    { label: t('status.rejected'),    count: s.rejected.total,      color: '#ef4444' },
  ]
}

watch(activeStatTab, async newTab => {
  await fetchSummary(newTab)
  updateCardsFromSummary()
})

watch(activeSuratTab, newTab => {
  fetchRecentDocuments(tabTypeMap[newTab])
})

// Re-translate labels/notes when sidebar language changes
watch(locale, () => {
  statCards.value[0].label  = t('status.needsReview')
  statCards.value[0].action = t('dashboard.actions.review')
  statCards.value[1].label  = t('status.inProgress')
  statCards.value[1].action = t('dashboard.actions.view')
  statCards.value[2].label  = t('status.rejected')
  statCards.value[2].action = t('dashboard.actions.tinjau')
  statCards.value[3].label  = t('dashboard.cardCompletedLabel')
  statCards.value[3].action = t('dashboard.actions.view')

  statusDistribution.value[0].label = t('status.completed')
  statusDistribution.value[1].label = t('status.needsReview')
  statusDistribution.value[2].label = t('status.inProgress')
  statusDistribution.value[3].label = t('status.rejected')

  if (summary.value) {
    updateCardsFromSummary()
  } else {
    // Translate static badge labels even when API data hasn't loaded yet
    statCards.value[0].badge = t('dashboard.badge.onTrack')
    statCards.value[1].badge = t('dashboard.badge.onTrack')
    statCards.value[2].badge = t('dashboard.badge.noRejected')
    statCards.value[3].badge = t('dashboard.badge.onTrack')
  }
})

onMounted(async () => {
  await fetchSummary(activeStatTab.value)
  updateCardsFromSummary()
  fetchDeadlines()
  fetchActivities()
  fetchRecentDocuments(0)
})

// ════════════════════════════════════════
// SECTION 4A — Surat Table
// ════════════════════════════════════════

const filteredSurat = computed(() => recentDocuments.value ?? [])

const statusClass = status => ({
  'In Progress': 'status-progress',
  'Selesai':     'status-selesai',
  'Ditolak':     'status-ditolak',
  'Cancelled':   'status-ditolak',
}[status] || '')

// ════════════════════════════════════════
// SECTION 4B — Donut Chart
// ════════════════════════════════════════

const statusDistribution = ref([
  { label: t('status.completed'),   count: 20, color: '#10b981' },
  { label: t('status.needsReview'), count: 12, color: '#f59e0b' },
  { label: t('status.inProgress'),  count: 8,  color: '#3b82f6' },
  { label: t('status.rejected'),    count: 5,  color: '#ef4444' },
])

const totalSurat    = computed(() => statusDistribution.value.reduce((a, b) => a + b.count, 0))
const circumference = 2 * Math.PI * 45

const donutSegments = computed(() => {
  let offset = circumference * 0.25
  return statusDistribution.value.map(item => {
    const dash = (item.count / totalSurat.value) * circumference
    const seg  = { color: item.color, dash, offset: -offset + circumference }
    offset += dash
    return seg
  })
})

// ════════════════════════════════════════
// SECTION 4C — Deadline Tracker
// ════════════════════════════════════════

const mappedDeadlines = computed(() =>
  deadlines.value.map(d => {
    const days = d.days_remaining

    let urgency, urgencyClass, barColor, progress

    if (days < 0) {
      urgency      = t('dashboard.daysOverdue', { days: `+${Math.abs(days)}` })
      urgencyClass = 'urgency-overdue'
      barColor     = '#ef4444'
      progress     = 100
    } else if (days === 0) {
      urgency      = t('dashboard.today')
      urgencyClass = 'urgency-today'
      barColor     = '#f59e0b'
      progress     = 90
    } else if (days <= 14) {
      urgency      = t('dashboard.daysLeft', { days })
      urgencyClass = 'urgency-soon'
      barColor     = '#f59e0b'
      progress     = Math.max(20, 100 - (days / 14 * 100))
    } else {
      urgency      = t('dashboard.daysLeft', { days })
      urgencyClass = 'urgency-ok'
      barColor     = '#10b981'
      progress     = Math.max(10, 100 - (days / 60 * 100))
    }

    return { id: d.id, name: d.subject, urgency, urgencyClass, progress, barColor }
  })
)

// ════════════════════════════════════════
// SECTION 4D — Activity Feed
// ════════════════════════════════════════

const mappedActivities = computed(() => {
  if (!activities.value) return []

  return activities.value.map(act => ({
    id:        act.id,
    icon:      act.is_approved ? iconCheck : iconX,
    iconBg:    act.is_approved ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
    iconColor: act.is_approved ? '#10b981' : '#ef4444',
    text:      act.is_approved
      ? `<strong>${act.subject}</strong> ${t('dashboard.approvedBy')} <strong>${act.approver_name}</strong>`
      : `<strong>${act.subject}</strong> ${t('dashboard.rejectedRevision')}`,
    time: formatRelativeTime(act.updated_at),
  }))
})

const iconCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>`
const iconX     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`

const formatRelativeTime = isoString => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)

  if (diff <= 0)    return t('dashboard.justNow')
  if (diff < 60)    return t('dashboard.secondsAgo', { n: diff })
  if (diff < 3600)  return t('dashboard.minutesAgo', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('dashboard.hoursAgo',   { n: Math.floor(diff / 3600) })
  return                   t('dashboard.daysAgo',    { n: Math.floor(diff / 86400) })
}

// ════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════

let searchTimer = null

watch(searchQuery, val => {
  if (val && val.length > 100) {
    searchQuery.value = val.substring(0, 100)
    return
  }

  clearTimeout(searchTimer)

  if (val.trim().length === 0) {
    searchResults.value = []
    isSearching.value   = false
    return
  }

  isSearching.value = true

  searchTimer = setTimeout(() => {
    searchDocuments(val)
  }, 1000)
})

// Live clock
const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  const hh  = String(now.getHours()).padStart(2, '0')
  const mm  = String(now.getMinutes()).padStart(2, '0')
  const ss  = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hh}:${mm}:${ss}`
}

updateTime()
onMounted(() => {
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ════════════════════════════════════════
   DESIGN TOKENS — light & dark
════════════════════════════════════════ */
.app-wrapper {
  --d-bg:              #F8F7FA;
  --d-card:            #ffffff;
  --d-hover:           #FAFAFA;
  --d-surface:         #F5F5F5;
  --d-border:          #E0E0E0;
  --d-border-sm:       #F5F5F5;
  --d-heading:         #2F2B3D;
  --d-body:            #444050;
  --d-muted:           #757575;
  --d-subtle:          #9E9E9E;
  --d-blue:            #2563eb;
  --d-blue-dark:       #1d4ed8;
  --d-blue-tint:       #eff6ff;
  --d-tab-active-bg:   #111827;
  --d-amber-bg:        #fef3c7;
  --d-amber-fg:        #b45309;
  --d-amber-dark:      #78350f;
  --d-amber-border:    #fde68a;
  --d-green-bg:        #d1fae5;
  --d-green-fg:        #065f46;
  --d-blue-status-bg:  #dbeafe;
  --d-blue-status-fg:  #1d4ed8;
  --d-red-bg:          #fee2e2;
  --d-red-fg:          #991b1b;
  --d-alert-bg:        #fffbeb;
  --d-alert-border:    #fde68a;
  --d-shimmer-1:       #f0f0f0;
  --d-shimmer-2:       #e0e0e0;
}

.v-theme--dark .app-wrapper {
  --d-bg:              #25293C;
  --d-card:            #2F3349;
  --d-hover:           #353A52;
  --d-surface:         #26293A;
  --d-border:          #4A5072;
  --d-border-sm:       #2F3349;
  --d-heading:         #E1DEF5;
  --d-body:            #B6BEE3;
  --d-muted:           #7983BB;
  --d-subtle:          #5E6692;
  --d-blue:            #60a5fa;
  --d-blue-dark:       #93c5fd;
  --d-blue-tint:       #1e2d45;
  --d-tab-active-bg:   #314f91;
  --d-amber-bg:        rgba(245,158,11,.15);
  --d-amber-fg:        #fbbf24;
  --d-amber-dark:      #fcd34d;
  --d-amber-border:    rgba(245,158,11,.3);
  --d-green-bg:        rgba(16,185,129,.15);
  --d-green-fg:        #34d399;
  --d-blue-status-bg:  rgba(59,130,246,.15);
  --d-blue-status-fg:  #60a5fa;
  --d-red-bg:          rgba(239,68,68,.15);
  --d-red-fg:          #f87171;
  --d-alert-bg:        rgba(245,158,11,.08);
  --d-alert-border:    rgba(245,158,11,.25);
  --d-shimmer-1:       #2a2f38;
  --d-shimmer-2:       #1e2229;
}

/* ════════════════════════════════════════
   BASE WRAPPER
════════════════════════════════════════ */
.app-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--d-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--d-body);
}

/* ════════════════════════════════════════
   SECTION 1 — Header
════════════════════════════════════════ */
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
  background: var(--d-card); border-radius: 16px;
  padding: 20px 28px; box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.header-title    { font-size: 1.35rem; font-weight: 700; color: var(--d-heading); letter-spacing: -.3px; }
.header-subtitle { font-size: .82rem; color: var(--d-muted); margin-top: 4px; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
.sep             { color: var(--d-border); }
.header-right    { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* Primary CTA button */
.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: var(--d-blue); color: #fff; border: none; border-radius: 10px;
  padding: 10px 18px; font-family: inherit; font-size: .875rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: background .15s, transform .1s;
}
.btn-primary:hover  { background: var(--d-blue-dark); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

/* ════════════════════════════════════════
   SECTION 2 — Alert Banner
════════════════════════════════════════ */
.alert-banner {
  display: flex; align-items: center; flex-wrap: wrap; gap: 11px;
  background: var(--d-alert-bg); border: 1.5px solid var(--d-alert-border);
  border-radius: 12px; padding: 13px 18px;
}
.alert-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #f59e0b; flex-shrink: 0;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 3px rgba(245,158,11,.2); }
  50%      { box-shadow: 0 0 0 7px rgba(245,158,11,.06); }
}
.alert-text          { flex: 1; font-size: .875rem; color: var(--d-amber-fg); min-width: 0; }
.alert-text strong   { color: var(--d-amber-dark); }
.alert-link {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; color: var(--d-blue);
  font-family: inherit; font-size: .875rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: gap .15s;
}
.alert-link:hover { gap: 8px; }

/* ════════════════════════════════════════
   SECTION 3 — Stat Cards
════════════════════════════════════════ */
.stats-section { display: flex; flex-direction: column; gap: 16px; }

/* Toolbar: filter tabs + search */
.toolbar     { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.tabs        { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tab {
  padding: 8px 20px; border-radius: 999px;
  border: 1.5px solid var(--d-border); background: var(--d-card);
  font-family: inherit; font-size: .875rem; font-weight: 600;
  color: var(--d-body); cursor: pointer; white-space: nowrap; transition: all .15s;
}
.tab:hover  { border-color: var(--d-blue); color: var(--d-blue); background: var(--d-blue-tint); }
.tab.active { background: var(--d-tab-active-bg); border-color: var(--d-tab-active-bg); color: #fff; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--d-card); border: 1.5px solid var(--d-border);
  border-radius: 10px; padding: 9px 16px; color: var(--d-subtle);
  width: 420px;
  transition: border-color .15s;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  background: var(--d-card);
  border: 1.5px solid var(--d-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.10);
  z-index: 100;
  overflow: hidden;
  animation: fadeUp .15s ease both;
}
.search-box:focus-within { border-color: var(--d-blue); color: var(--d-blue); }
.search-input {
  border: none; background: transparent; font-family: inherit;
  font-size: .875rem; color: var(--d-heading); outline: none; width: 100%;
}
.search-input::placeholder { color: var(--d-subtle); }

/* 4-column card grid */
.cards-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
}
.stat-card {
  background: var(--d-card); border-radius: 16px; overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,.06); display: flex; flex-direction: column;
  transition: transform .18s, box-shadow .18s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.09); }

.card-bar     { height: 5px; background: var(--top-color); flex-shrink: 0; }
.card-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 20px 20px 0; }
.card-icon    { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-badge   { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px; font-size: .76rem; font-weight: 600; line-height: 1.4; max-width: 160px; }
.badge-warn   { background: var(--d-amber-bg); color: var(--d-amber-fg); }
.badge-ok     { background: var(--d-green-bg); color: var(--d-green-fg); }
.card-number  { font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1; padding: 16px 20px 4px; }
.card-label   { font-size: 1rem; font-weight: 700; color: var(--d-heading); padding: 0 20px 20px; }
.card-divider { height: 1px; background: var(--d-surface); margin: 0 20px; }
.card-footer  { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 20px; }
.card-note    { font-size: .8rem; color: var(--d-muted); line-height: 1.4; flex: 1; }
.card-action  { background: none; border: none; font-family: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: opacity .15s; }
.card-action:hover { opacity: .7; }

/* ════════════════════════════════════════
   SECTION 4 — Main Content (Table + Widgets)
════════════════════════════════════════ */
.main-content {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 20px; align-items: start;
}

/* Shared white card base */
.table-card, .widget-card {
  background: var(--d-card); border-radius: 16px; box-shadow: 0 1px 6px rgba(0,0,0,.06);
}

/* ── Left Column: Table ── */
.left-col { display: flex; flex-direction: column; }

.table-card-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 22px 24px 18px;
  border-bottom: 1.5px solid var(--d-surface);
}
.section-title { font-size: 1.1rem; font-weight: 700; color: var(--d-heading); }
.section-sub   { font-size: .8rem; color: var(--d-muted); margin-top: 2px; }

/* Segmented tab control */
.tab-group  { display: flex; background: var(--d-surface); border-radius: 10px; padding: 3px; gap: 2px; }
.tab-btn    { padding: 6px 16px; border: none; border-radius: 8px; font-family: inherit; font-size: .82rem; font-weight: 600; color: var(--d-muted); background: transparent; cursor: pointer; transition: all .15s; }
.tab-btn.active { background: var(--d-card); color: var(--d-heading); box-shadow: 0 1px 4px rgba(0,0,0,.1); }

/* Desktop table — hidden on mobile */
.table-wrapper { overflow-x: auto; }
.surat-table   { width: 100%; border-collapse: collapse; font-size: .84rem; }
.surat-table th {
  text-align: left; padding: 10px 16px; font-size: .72rem; font-weight: 600;
  color: var(--d-subtle); text-transform: uppercase; letter-spacing: .5px;
  white-space: nowrap; border-bottom: 1.5px solid var(--d-surface);
}
.table-row {
  border-bottom: 1px solid var(--d-border-sm); animation: fadeUp .3s ease both; transition: background .1s;
}
.table-row:hover      { background: var(--d-hover); }
.table-row:last-child { border-bottom: none; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.surat-table td { padding: 13px 16px; vertical-align: middle; }

.cell-nomor   { font-family: 'JetBrains Mono', monospace; font-size: .76rem; color: var(--d-blue); font-weight: 500; white-space: nowrap; }
.cell-perihal { min-width: 180px; max-width: 280px; }
.perihal-text { display: block; font-weight: 600; color: var(--d-heading); white-space: normal; word-break: break-word; line-height: 1.4; }
.perihal-sub  { display: block; font-size: .75rem; color: var(--d-subtle); margin-top: 1px; }
.cell-dari    { color: var(--d-body); white-space: nowrap; }
.cell-tanggal { color: var(--d-muted); font-size: .8rem; white-space: nowrap; }

/* Status badges */
.status-badge    { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
.status-dot      { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.status-periksa  { background: var(--d-amber-bg);       color: var(--d-amber-fg); }
.status-progress { background: var(--d-blue-status-bg); color: var(--d-blue-status-fg); }
.status-selesai  { background: var(--d-green-bg);        color: var(--d-green-fg); }
.status-ditolak  { background: var(--d-red-bg);          color: var(--d-red-fg); }

/* Table action buttons */
.action-group { display: flex; gap: 6px; }
.btn-action {
  padding: 5px 12px; border-radius: 7px; font-family: inherit; font-size: .78rem;
  font-weight: 600; cursor: pointer; border: 1.5px solid; transition: all .15s; white-space: nowrap;
}
.btn-action.primary { background: var(--d-blue); color: #fff; border-color: var(--d-blue); }
.btn-action.primary:hover { background: var(--d-blue-dark); }
.btn-action.warning { background: var(--d-amber-bg); color: var(--d-amber-fg); border-color: var(--d-amber-border); }
.btn-action.warning:hover { filter: brightness(.95); }
.btn-action.ghost   { background: var(--d-card); color: var(--d-body); border-color: var(--d-border); }
.btn-action.ghost:hover { border-color: var(--d-muted); }

/* Mobile surat card list — hidden by default, shown on mobile */
.mobile-surat-list { display: none; flex-direction: column; gap: 10px; padding: 14px; }
.surat-mobile-card {
  border: 1.5px solid var(--d-surface); border-radius: 12px; padding: 14px;
  background: var(--d-hover); animation: fadeUp .3s ease both;
}
.smc-top     { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.smc-perihal { font-size: .88rem; font-weight: 600; color: var(--d-heading); margin-bottom: 8px; line-height: 1.4; }
.smc-meta    { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; font-size: .8rem; color: var(--d-muted); }
.smc-actions { display: flex; gap: 8px; }
.smc-actions .btn-action { flex: 1; justify-content: center; text-align: center; }

/* ── Right Column: Widgets ── */
.right-col    { display: flex; flex-direction: column; gap: 16px; }
.widget-card  { padding: 20px 22px; }
.widget-title { font-size: 1rem; font-weight: 700; color: var(--d-heading); }
.widget-sub   { font-size: .78rem; color: var(--d-muted); margin-top: 2px; margin-bottom: 16px; }

/* Donut chart */
.donut-section      { display: flex; align-items: center; gap: 20px; }
.donut-wrap         { width: 110px; height: 110px; flex-shrink: 0; }
.donut-svg          { width: 100%; height: 100%; }
.donut-center-num   { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; fill: var(--d-heading); }
.donut-center-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 9px; fill: var(--d-subtle); font-weight: 500; }

/* Donut legend */
.donut-legend { list-style: none; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.legend-item  { display: flex; align-items: center; gap: 8px; }
.legend-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { font-size: .82rem; color: var(--d-body); flex: 1; }
.legend-count { font-size: .82rem; font-weight: 700; color: var(--d-heading); }

/* Deadline tracker */
.deadline-list      { display: flex; flex-direction: column; gap: 14px; }
.deadline-top       { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.deadline-name      { font-size: .84rem; font-weight: 600; color: var(--d-heading); }
.deadline-label     { font-size: .75rem; font-weight: 700; white-space: nowrap; }
.urgency-overdue    { color: #ef4444; }
.urgency-today      { color: #f59e0b; }
.urgency-soon       { color: #f59e0b; }
.urgency-ok         { color: var(--d-muted); }
.deadline-bar-track { height: 6px; background: var(--d-surface); border-radius: 999px; overflow: hidden; }
.deadline-bar-fill  { height: 100%; border-radius: 999px; transition: width .6s ease; }

/* Activity feed */
.activity-list { display: flex; flex-direction: column; gap: 14px; }
.activity-item { display: flex; align-items: flex-start; gap: 12px; }
.activity-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.activity-body { flex: 1; min-width: 0; }
.activity-text { font-size: .84rem; color: var(--d-body); line-height: 1.45; }
.activity-time { font-size: .75rem; color: var(--d-subtle); margin-top: 2px; display: block; }

/* ════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
════════════════════════════════════════ */

@media (max-width: 1200px) {
  .cards-grid  { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
  .main-content { grid-template-columns: 1fr; }
  .right-col    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

@media (max-width: 768px) {
  .app-wrapper       { padding: 16px 18px; gap: 14px; }
  .dashboard-header  { padding: 16px 20px; }
  .search-box        { min-width: 0; flex: 1; }
  .toolbar           { flex-wrap: wrap; }
  .table-card-header { padding: 16px 18px 14px; }
  .surat-table td    { padding: 11px 14px; }
}

@media (max-width: 640px) {
  .app-wrapper { padding: 12px; gap: 12px; }

  .dashboard-header { flex-direction: column; align-items: flex-start; padding: 14px 16px; gap: 12px; }
  .header-right     { width: 100%; justify-content: flex-end; }
  .header-title     { font-size: 1.1rem; }
  .header-subtitle  { font-size: .78rem; }
  .btn-label        { display: none; }
  .btn-primary      { padding: 10px 13px; }

  .alert-banner { padding: 11px 14px; }
  .alert-text   { font-size: .8rem; }

  .cards-grid   { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .card-number  { font-size: 2.2rem; }
  .card-badge   { display: none; }

  .toolbar      { flex-direction: column; align-items: stretch; }
  .search-box   { width: 100%; }
  .tabs         { overflow-x: auto; padding-bottom: 2px; flex-wrap: nowrap; }

  .main-content { grid-template-columns: 1fr; }

  .table-wrapper     { display: none; }
  .mobile-surat-list { display: flex; }

  .table-card-header { flex-direction: column; align-items: flex-start; padding: 14px 14px 12px; gap: 10px; }
  .tab-group         { width: 100%; justify-content: stretch; }
  .tab-btn           { flex: 1; text-align: center; padding: 6px 8px; font-size: .78rem; }

  .right-col { grid-template-columns: 1fr; }

  .donut-wrap { width: 90px; height: 90px; }
}

@media (max-width: 380px) {
  .cards-grid { grid-template-columns: 1fr; }
  .card-badge { display: none; }
}

/* Shimmer */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.shimmer {
  display: inline-block;
  width: 60px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--d-shimmer-1) 25%, var(--d-shimmer-2) 50%, var(--d-shimmer-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.card-number {
  transition: opacity 0.4s ease;
}

.card-number.fade-in {
  animation: fadeInNum 0.5s ease both;
}

@keyframes fadeInNum {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  background: var(--d-card);
  color: var(--d-subtle);
  font-size: .875rem;
  min-height: 300px;
  border-radius: 0 0 16px 16px;
}

/* Search wrapper & dropdown */
.search-wrapper { position: relative; }

.search-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 16px;
  font-size: .84rem;
  color: var(--d-subtle);
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--d-surface);
  transition: background .1s;
}
.search-item:last-child { border-bottom: none; }
.search-item:hover      { background: var(--d-hover); }

.search-item-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: .75rem;
  color: var(--d-blue);
  font-weight: 500;
}

.search-item-subject {
  font-size: .85rem;
  font-weight: 600;
  color: var(--d-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Spinner animation */
.search-spinner {
  animation: spin .8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.search-loading-spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid var(--d-border);
  border-top-color: var(--d-blue);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

.live-clock {
  font-family: 'JetBrains Mono', monospace;
  font-size: .82rem;
  color: var(--d-body);
  letter-spacing: .5px;
}
</style>
