<template>
  <div class="app-wrapper">

    <!-- ════════════════════════════════════════
         SECTION 1 — Header
    ════════════════════════════════════════ -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="header-title">Dashboard Persuratan</h1>
        <p class="header-subtitle">
          <span>{{ formattedDate }}</span>
          <span class="sep">·</span>
          <span>{{ greeting }}, {{ userName }} 👋</span>
        </p>
      </div>
      <div class="header-right">
        <button class="btn-icon" @click="showNotifications = !showNotifications" :class="{ active: showNotifications }" aria-label="Notifikasi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="notifCount > 0" class="notif-badge">{{ notifCount }}</span>
        </button>
        <button class="btn-primary" @click="buatSuratBaru">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span class="btn-label">Buat Surat Baru</span>
        </button>
      </div>
    </header>

    <!-- ════════════════════════════════════════
         SECTION 2 — Alert Banner
    ════════════════════════════════════════ -->
    <div class="alert-banner" v-if="showAlert">
      <div class="alert-dot"></div>
      <span class="alert-text">
        <strong>{{ alertCount }} surat</strong> belum diperiksa lebih dari 3 hari — perlu tindakan segera
      </span>
      <button class="alert-link" @click="lihatSemua">
        Lihat Semua
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
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Cari nomor atau perihal..." class="search-input"/>
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

          <!-- Table header: title + Semua/Masuk/Keluar tabs -->
          <div class="table-card-header">
            <div>
              <h2 class="section-title">Surat Terbaru</h2>
              <p class="section-sub">{{ filteredSurat.length }} surat ditampilkan</p>
            </div>
            <div class="tab-group">
              <button
                v-for="t in suratTabs"
                :key="t"
                class="tab-btn"
                :class="{ active: activeSuratTab === t }"
                @click="activeSuratTab = t"
              >{{ t }}</button>
            </div>
          </div>

          <!-- Desktop table — hidden on mobile, replaced by cards below -->
          <div class="table-wrapper">
            <table class="surat-table">
              <thead>
                <tr>
                  <th>No. Surat</th>
                  <th>Perihal</th>
                  <th>Dari / Kepada</th>
                  <th>Tgl Masuk</th>
                  <th>Status</th>
                  <th>Aksi</th>
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
                  <td class="cell-tanggal">{{ new Date(s.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(s.status)">
                      <span class="status-dot"></span>{{ s.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-group">
                      <!-- Conditional action buttons based on status -->
                      <button v-if="s.status === 'Perlu Diperiksa'" class="btn-action primary" @click="lihatDocument(s.id)">Periksa</button>
                      <button v-if="s.status === 'Ditolak'"         class="btn-action warning" @click="lihatDocument(s.id)">Revisi</button>
                      <button v-if="s.status === 'Perlu Diperiksa' || s.status === 'Ditolak'" class="btn-action ghost">Detail</button>
                      <button v-if="s.status === 'In Progress' || s.status === 'Selesai'"     class="btn-action ghost" @click="lihatDocument(s.id)">Lihat</button>
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
                <button v-if="s.status === 'Perlu Diperiksa'" class="btn-action primary">Periksa</button>
                <button v-if="s.status === 'Ditolak'"         class="btn-action warning">Revisi</button>
                <button v-if="s.status === 'Perlu Diperiksa' || s.status === 'Ditolak'" class="btn-action ghost">Detail</button>
                <button v-if="s.status === 'In Progress' || s.status === 'Selesai'" @click="lihatDocument(s.id)" class="btn-action ghost">Lihat</button>
              </div>
            </div>
          </div>

          <div class="empty-state">
            <svg v-if="filteredSurat.length === 0" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#d1d5db">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p v-if="filteredSurat.length === 0">Belum ada surat</p>
          </div>

        </div>
      </section>

      <!-- ── Right: Widgets ── -->
      <aside class="right-col">

        <!-- Widget 1: Donut Chart — Distribusi Status -->
        <div class="widget-card">
          <h3 class="widget-title">Distribusi Status</h3>
          <p class="widget-sub">Total {{ totalSurat }} surat {{ activeStatTab === 'semua' ? 'keseluruhan' : activeStatTab === 'hari' ? 'hari ini' : activeStatTab === 'minggu' ? 'minggu ini' : 'bulan ini' }}</p>
          <div class="donut-section">
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut-svg">
                <!--
                  Pure SVG donut using stroke-dasharray trick.
                  Circumference = 2π × r (r=45) ≈ 282.74
                  Each segment: dash = (count / total) × circumference
                  Offset shifts the arc start position clockwise.
                -->
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
                <text x="60" y="70" text-anchor="middle" class="donut-center-label">surat</text>
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

        <!-- Widget 2: Deadline Tracker — Mendekati Batas Waktu -->
        <div class="widget-card">
          <h3 class="widget-title">Mendekati Batas Waktu</h3>
          <p class="widget-sub">Surat yang perlu segera ditindak</p>
          <div class="deadline-list">
            <div v-for="dl in mappedDeadlines" :key="dl.id" class="deadline-item">
              <div class="deadline-top">
                <span class="deadline-name">{{ dl.name }}</span>
                <!-- Bar width = urgency progress, color = urgency level -->
                <span class="deadline-label" :class="dl.urgencyClass">{{ dl.urgency }}</span>
              </div>
              <div class="deadline-bar-track">
                <div class="deadline-bar-fill" :style="{ width: dl.progress + '%', background: dl.barColor }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget 3: Activity Feed — Aktivitas Terkini -->
        <div class="widget-card">
          <h3 class="widget-title">Aktivitas Terkini</h3>
          <p class="widget-sub">Current Time Log</p>
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

const router = useRouter()

// ════════════════════════════════════════
// SECTION 1 & 2 — Header & Alert
// ════════════════════════════════════════

const userName = useCookie('name')
const notifCount        = ref(3)
const showNotifications = ref(false)
const showAlert         = ref(false)
const alertCount        = ref(0)
const activeSuratTab = ref('Semua')
const suratTabs = ['Semua', 'Internal', 'External']
const tabTypeMap = { 'Semua': 0, 'Internal': 1, 'External': 2 }
const lihatDocument = (id) => {
  console.log('fungsi dipanggil, id:', id)
  console.log('router:', router)
  router.push(`/preview/${id}`)
}

const now = new Date()

const formattedDate = computed(() =>
  now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const greeting = computed(() => {
  const h = now.getHours()
  if (h < 11) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

const buatSuratBaru = () => router.push('/document/create')
const lihatSemua    = () => alert('Navigasi ke daftar surat belum diperiksa')

// Mapping action per card
const cardActions = {
  0: () => router.push('/reguler/authorization'), // Periksa
  1: () => router.push('/reguler/progress'),      // Lihat (In Progress)
  2: () => router.push('/reguler/rejected'),      // Tinjau
  3: () => router.push('/reguler/complete'),      // Lihat (Selesai)
}

// ════════════════════════════════════════
// SECTION 3 — Stat Cards + API
// ════════════════════════════════════════

const {
	summary, deadlines, activities, recentDocuments,
	isLoading, fetchSummary, fetchDeadlines, fetchActivities, fetchRecentDocuments
} = useDashboardController()

const activeStatTab = ref('semua')
const searchQuery   = ref('')

const statTabs = [
  { label: 'Semua',      value: 'semua'  },
  { label: 'Hari Ini',   value: 'hari'   },
  { label: 'Minggu Ini', value: 'minggu' },
  { label: 'Bulan Ini',  value: 'bulan'  },
]

const warnIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
const okIcon   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`

const statCards = ref([
  {
    id: 1, topColor: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    badgeType: 'badge-warn', badgeIcon: warnIcon, badge: '-',
    count: '-', numberColor: '#d97706', label: 'Perlu Diperiksa',
    note: '-', action: 'Periksa', actionColor: '#d97706',
  },
  {
    id: 2, topColor: '#2563eb', iconBg: '#dbeafe', iconColor: '#2563eb',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><line x1="12" y1="13" x2="12" y2="21"/></svg>`,
    badgeType: 'badge-ok', badgeIcon: okIcon, badge: '-',
    count: '-', numberColor: '#2563eb', label: 'Sedang Diproses',
    note: '-', action: 'Lihat', actionColor: '#2563eb',
  },
  {
    id: 3, topColor: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`,
    badgeType: 'badge-warn', badgeIcon: warnIcon, badge: '-',
    count: '-', numberColor: '#dc2626', label: 'Ditolak',
    note: '-', action: 'Tinjau', actionColor: '#dc2626',
  },
  {
    id: 4, topColor: '#10b981', iconBg: '#d1fae5', iconColor: '#059669',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>`,
    badgeType: 'badge-ok', badgeIcon: okIcon, badge: '-',
    count: '-', numberColor: '#059669', label: 'Selesai Bulan Ini',
    note: '-', action: 'Lihat', actionColor: '#059669',
  },
])

// Mapping response API → statCards
const animateCount = (index, targetValue) => {
  const delay    = 1000 // shimmer terlihat selama 1 detik
  const duration = 1500
  const steps    = 60
  const stepTime = duration / steps
  const target   = parseInt(targetValue) || 0
  let current    = 0

  setTimeout(() => {
    // Matikan shimmer tepat saat angka mulai counting
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

  // Animate counts
  animateCount(0, s.need_approval.total)
  animateCount(1, s.in_progress.total)
  animateCount(2, s.rejected.total)
  animateCount(3, s.completed.total)

  // Card 1 — Perlu Diperiksa
  statCards.value[0].badge     = s.need_approval.alert_label
  statCards.value[0].badgeType = s.need_approval.alert_type === 'warning' ? 'badge-warn' : 'badge-ok'
  statCards.value[0].badgeIcon = s.need_approval.alert_type === 'warning' ? warnIcon : okIcon
  statCards.value[0].note      = `${s.need_approval.urgent} mendesak · ${s.need_approval.normal} normal`

  // Card 2 — Sedang Diproses
  statCards.value[1].badge     = s.in_progress.alert_label
  statCards.value[1].badgeType = s.in_progress.alert_type === 'warning' ? 'badge-warn' : 'badge-ok'
  statCards.value[1].badgeIcon = s.in_progress.alert_type === 'warning' ? warnIcon : okIcon
  statCards.value[1].note      = `Paling lama: ${s.in_progress.longest_processing_days} hari belum selesai`

  // Card 3 — Ditolak
  statCards.value[2].badge     = s.rejected.alert_label
  statCards.value[2].badgeType = s.rejected.alert_type === 'warning' ? 'badge-warn' : 'badge-ok'
  statCards.value[2].badgeIcon = s.rejected.alert_type === 'warning' ? warnIcon : okIcon
  statCards.value[2].note      = `${s.rejected.mine_needs_revision} surat milikmu perlu direvisi`

  // Card 4 — Selesai
  statCards.value[3].badge     = s.completed.alert_label
  statCards.value[3].badgeType = s.completed.alert_type === 'warning' ? 'badge-warn' : 'badge-ok'
  statCards.value[3].badgeIcon = s.completed.alert_type === 'warning' ? warnIcon : okIcon
  statCards.value[3].note      = `Total ${s.completed.total_year} sepanjang tahun`

  showAlert.value  = s.need_approval.oldest_pending_days > 1
  alertCount.value = s.need_approval.total

  // update donut chart dari data API
  statusDistribution.value = [
    { label: 'Selesai',         count: s.completed.total,    color: '#10b981' },
    { label: 'Perlu Diperiksa', count: s.need_approval.total, color: '#f59e0b' },
    { label: 'In Progress',     count: s.in_progress.total,  color: '#3b82f6' },
    { label: 'Ditolak',         count: s.rejected.total,     color: '#ef4444' },
  ]
}

// Fetch ulang setiap kali tab filter berubah
watch(activeStatTab, async (newTab) => {
  await fetchSummary(newTab)
  updateCardsFromSummary()
})

// Fetch ulang saat tab berubah
watch(activeSuratTab, (newTab) => {
	fetchRecentDocuments(tabTypeMap[newTab])
})

// Fetch pertama kali saat halaman dibuka
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

const statusClass = (status) => ({
	'In Progress': 'status-progress',
	'Selesai':     'status-selesai',
	'Ditolak':     'status-ditolak',
	'Cancelled':   'status-ditolak',
}[status] || '')

// ════════════════════════════════════════
// SECTION 4B — Donut Chart
// ════════════════════════════════════════

const statusDistribution = ref([
  { label: 'Selesai',         count: 20, color: '#10b981' },
  { label: 'Perlu Diperiksa', count: 12, color: '#f59e0b' },
  { label: 'In Progress',     count: 8,  color: '#3b82f6' },
  { label: 'Ditolak',         count: 5,  color: '#ef4444' },
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
            urgency      = `+${Math.abs(days)} hari lewat`
            urgencyClass = 'urgency-overdue'
            barColor     = '#ef4444'
            progress     = 100
        } else if (days === 0) {
            urgency      = 'Hari ini'
            urgencyClass = 'urgency-today'
            barColor     = '#f59e0b'
            progress     = 90
        } else if (days <= 14) {
            urgency      = `${days} hari lagi`
            urgencyClass = 'urgency-soon'
            barColor     = '#f59e0b'
            progress     = Math.max(20, 100 - (days / 14 * 100))
        } else {
            urgency      = `${days} hari lagi`
            urgencyClass = 'urgency-ok'
            barColor     = '#10b981'
            progress     = Math.max(10, 100 - (days / 60 * 100))
        }

        return {
            id:           d.id,
            name:         d.subject,
            urgency,
            urgencyClass,
            progress,
            barColor,
        }
    })
)


// ════════════════════════════════════════
// SECTION 4D — Activity Feed
// ════════════════════════════════════════

const mappedActivities = computed(() => {
	if (!activities.value) return []

	return activities.value.map(act => ({
		id:      act.id,
		icon:    act.is_approved ? iconCheck : iconX,
		iconBg:  act.is_approved ? '#d1fae5' : '#fee2e2',
		iconColor: act.is_approved ? '#059669' : '#dc2626',
		text:    act.is_approved
			? `<strong>${act.subject}</strong> disetujui oleh <strong>${act.approver_name}</strong>`
			: `<strong>${act.subject}</strong> ditolak, diminta revisi`,
		time: formatRelativeTime(act.updated_at),
	}))
})

const iconCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>`
const iconMail  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
const iconX     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`

const formatRelativeTime = (isoString) => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)

  if (diff <= 0)    return 'Baru saja'
  if (diff < 60)    return `${diff} detik lalu`
  if (diff < 3600)  return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return                   `${Math.floor(diff / 86400)} hari lalu`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ════════════════════════════════════════
   BASE WRAPPER
════════════════════════════════════════ */
.app-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f4f6fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #1e2a3a;
}

/* ════════════════════════════════════════
   SECTION 1 — Header
════════════════════════════════════════ */
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
  background: #fff; border-radius: 16px;
  padding: 20px 28px; box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.header-title    { font-size: 1.35rem; font-weight: 700; color: #111827; letter-spacing: -.3px; }
.header-subtitle { font-size: .82rem; color: #6b7280; margin-top: 4px; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
.sep             { color: #d1d5db; }
.header-right    { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* Notification icon button */
.btn-icon {
  position: relative; width: 40px; height: 40px;
  border-radius: 10px; border: 1.5px solid #e5e7eb;
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #374151; transition: all .15s;
}
.btn-icon:hover, .btn-icon.active { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.notif-badge {
  position: absolute; top: -5px; right: -5px;
  background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}

/* Primary CTA button */
.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: #2563eb; color: #fff; border: none; border-radius: 10px;
  padding: 10px 18px; font-family: inherit; font-size: .875rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: background .15s, transform .1s;
}
.btn-primary:hover  { background: #1d4ed8; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

/* ════════════════════════════════════════
   SECTION 2 — Alert Banner
════════════════════════════════════════ */
.alert-banner {
  display: flex; align-items: center; flex-wrap: wrap; gap: 11px;
  background: #fffbeb; border: 1.5px solid #fde68a;
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
.alert-text          { flex: 1; font-size: .875rem; color: #92400e; min-width: 0; }
.alert-text strong   { color: #78350f; }
.alert-link {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; color: #2563eb;
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
  border: 1.5px solid #e5e7eb; background: #fff;
  font-family: inherit; font-size: .875rem; font-weight: 600;
  color: #374151; cursor: pointer; white-space: nowrap; transition: all .15s;
}
.tab:hover  { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
.tab.active { background: #111827; border-color: #111827; color: #fff; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1.5px solid #e5e7eb;
  border-radius: 10px; padding: 9px 16px; color: #9ca3af;
  min-width: 260px; transition: border-color .15s;
}
.search-box:focus-within { border-color: #2563eb; color: #2563eb; }
.search-input {
  border: none; background: transparent; font-family: inherit;
  font-size: .875rem; color: #111827; outline: none; width: 100%;
}
.search-input::placeholder { color: #9ca3af; }

/* 4-column card grid */
.cards-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
}
.stat-card {
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,.06); display: flex; flex-direction: column;
  transition: transform .18s, box-shadow .18s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.09); }

.card-bar     { height: 5px; background: var(--top-color); flex-shrink: 0; }
.card-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 20px 20px 0; }
.card-icon    { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-badge   { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px; font-size: .76rem; font-weight: 600; line-height: 1.4; max-width: 160px; }
.badge-warn   { background: #fef3c7; color: #b45309; }
.badge-ok     { background: #d1fae5; color: #065f46; }
.card-number  { font-size: 2.8rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1; padding: 16px 20px 4px; }
.card-label   { font-size: 1rem; font-weight: 700; color: #111827; padding: 0 20px 20px; }
.card-divider { height: 1px; background: #f3f4f6; margin: 0 20px; }
.card-footer  { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 20px; }
.card-note    { font-size: .8rem; color: #6b7280; line-height: 1.4; flex: 1; }
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
  background: #fff; border-radius: 16px; box-shadow: 0 1px 6px rgba(0,0,0,.06);
}

/* ── Left Column: Table ── */
.left-col { display: flex; flex-direction: column; }

.table-card-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 22px 24px 18px;
  border-bottom: 1.5px solid #f3f4f6;
}
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; }
.section-sub   { font-size: .8rem; color: #6b7280; margin-top: 2px; }

/* Segmented tab control */
.tab-group  { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; gap: 2px; }
.tab-btn    { padding: 6px 16px; border: none; border-radius: 8px; font-family: inherit; font-size: .82rem; font-weight: 600; color: #6b7280; background: transparent; cursor: pointer; transition: all .15s; }
.tab-btn.active { background: #fff; color: #111827; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

/* Desktop table — hidden on mobile */
.table-wrapper { overflow-x: auto; }
.surat-table   { width: 100%; border-collapse: collapse; font-size: .84rem; }
.surat-table th {
  text-align: left; padding: 10px 16px; font-size: .72rem; font-weight: 600;
  color: #9ca3af; text-transform: uppercase; letter-spacing: .5px;
  white-space: nowrap; border-bottom: 1.5px solid #f3f4f6;
}
.table-row {
  border-bottom: 1px solid #f9fafb; animation: fadeUp .3s ease both; transition: background .1s;
}
.table-row:hover      { background: #fafafa; }
.table-row:last-child { border-bottom: none; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.surat-table td { padding: 13px 16px; vertical-align: middle; }

.cell-nomor   { font-family: 'JetBrains Mono', monospace; font-size: .76rem; color: #2563eb; font-weight: 500; white-space: nowrap; }
.cell-perihal { max-width: 200px; }
.perihal-text { display: block; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.perihal-sub  { display: block; font-size: .75rem; color: #9ca3af; margin-top: 1px; }
.cell-dari    { color: #374151; white-space: nowrap; }
.cell-tanggal { color: #6b7280; font-size: .8rem; white-space: nowrap; }

/* Status badges */
.status-badge    { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
.status-dot      { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.status-periksa  { background: #fef3c7; color: #b45309; }
.status-progress { background: #dbeafe; color: #1d4ed8; }
.status-selesai  { background: #d1fae5; color: #065f46; }
.status-ditolak  { background: #fee2e2; color: #991b1b; }

/* Table action buttons */
.action-group { display: flex; gap: 6px; }
.btn-action {
  padding: 5px 12px; border-radius: 7px; font-family: inherit; font-size: .78rem;
  font-weight: 600; cursor: pointer; border: 1.5px solid; transition: all .15s; white-space: nowrap;
}
.btn-action.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.btn-action.primary:hover { background: #1d4ed8; }
.btn-action.warning { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.btn-action.warning:hover { background: #fde68a; }
.btn-action.ghost   { background: #fff; color: #374151; border-color: #e5e7eb; }
.btn-action.ghost:hover { border-color: #9ca3af; }

/* Mobile surat card list — hidden by default, shown on mobile */
.mobile-surat-list { display: none; flex-direction: column; gap: 10px; padding: 14px; }
.surat-mobile-card {
  border: 1.5px solid #f3f4f6; border-radius: 12px; padding: 14px;
  background: #fafafa; animation: fadeUp .3s ease both;
}
.smc-top     { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.smc-perihal { font-size: .88rem; font-weight: 600; color: #111827; margin-bottom: 8px; line-height: 1.4; }
.smc-meta    { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; font-size: .8rem; color: #6b7280; }
.smc-actions { display: flex; gap: 8px; }
.smc-actions .btn-action { flex: 1; justify-content: center; text-align: center; }

/* ── Right Column: Widgets ── */
.right-col    { display: flex; flex-direction: column; gap: 16px; }
.widget-card  { padding: 20px 22px; }
.widget-title { font-size: 1rem; font-weight: 700; color: #111827; }
.widget-sub   { font-size: .78rem; color: #6b7280; margin-top: 2px; margin-bottom: 16px; }

/* Donut chart */
.donut-section      { display: flex; align-items: center; gap: 20px; }
.donut-wrap         { width: 110px; height: 110px; flex-shrink: 0; }
.donut-svg          { width: 100%; height: 100%; }
.donut-center-num   { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; fill: #111827; }
.donut-center-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 9px; fill: #9ca3af; font-weight: 500; }

/* Donut legend */
.donut-legend { list-style: none; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.legend-item  { display: flex; align-items: center; gap: 8px; }
.legend-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { font-size: .82rem; color: #374151; flex: 1; }
.legend-count { font-size: .82rem; font-weight: 700; color: #111827; }

/* Deadline tracker */
.deadline-list      { display: flex; flex-direction: column; gap: 14px; }
.deadline-top       { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.deadline-name      { font-size: .84rem; font-weight: 600; color: #111827; }
.deadline-label     { font-size: .75rem; font-weight: 700; white-space: nowrap; }
.urgency-overdue    { color: #dc2626; }
.urgency-today      { color: #d97706; }
.urgency-soon       { color: #d97706; }
.urgency-ok         { color: #6b7280; }
.deadline-bar-track { height: 6px; background: #f3f4f6; border-radius: 999px; overflow: hidden; }
.deadline-bar-fill  { height: 100%; border-radius: 999px; transition: width .6s ease; }

/* Activity feed */
.activity-list { display: flex; flex-direction: column; gap: 14px; }
.activity-item { display: flex; align-items: flex-start; gap: 12px; }
.activity-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.activity-body { flex: 1; min-width: 0; }
.activity-text { font-size: .84rem; color: #374151; line-height: 1.45; }
.activity-time { font-size: .75rem; color: #9ca3af; margin-top: 2px; display: block; }

/* ════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
════════════════════════════════════════ */

/* ── Large tablet landscape (≤ 1200px) ──
   Stat cards: 4 → 2 columns */
@media (max-width: 1200px) {
  .cards-grid  { grid-template-columns: repeat(2, 1fr); }
}

/* ── Tablet portrait (≤ 1024px) ──
   Main content: side-by-side → stacked
   Right widgets: column → 2-col grid */
@media (max-width: 1024px) {
  .main-content { grid-template-columns: 1fr; }
  .right-col    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

/* ── Small tablet (≤ 768px) ──
   Reduce padding, tighten spacing */
@media (max-width: 768px) {
  .app-wrapper       { padding: 16px 18px; gap: 14px; }
  .dashboard-header  { padding: 16px 20px; }
  .search-box        { min-width: 0; flex: 1; }
  .toolbar           { flex-wrap: wrap; }
  .table-card-header { padding: 16px 18px 14px; }
  .surat-table td    { padding: 11px 14px; }
}

/* ── Mobile (≤ 640px) ──
   Full single-column layout, table → mobile cards */
@media (max-width: 640px) {
  /* Wrapper */
  .app-wrapper { padding: 12px; gap: 12px; }

  /* Header: stack vertically */
  .dashboard-header { flex-direction: column; align-items: flex-start; padding: 14px 16px; gap: 12px; }
  .header-right     { width: 100%; justify-content: flex-end; }
  .header-title     { font-size: 1.1rem; }
  .header-subtitle  { font-size: .78rem; }
  /* Hide button text, show icon only */
  .btn-label        { display: none; }
  .btn-primary      { padding: 10px 13px; }

  /* Alert */
  .alert-banner { padding: 11px 14px; }
  .alert-text   { font-size: .8rem; }

  /* Stat cards: 2 columns */
  .cards-grid   { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .card-number  { font-size: 2.2rem; }
  .card-badge   { display: none; } /* hide badge on small cards */

  /* Filter toolbar: stack */
  .toolbar      { flex-direction: column; align-items: stretch; }
  .search-box   { width: 100%; }
  .tabs         { overflow-x: auto; padding-bottom: 2px; flex-wrap: nowrap; }

  /* Main content: single column */
  .main-content { grid-template-columns: 1fr; }

  /* Table: hide desktop table, show mobile cards */
  .table-wrapper     { display: none; }
  .mobile-surat-list { display: flex; }

  /* Table header */
  .table-card-header { flex-direction: column; align-items: flex-start; padding: 14px 14px 12px; gap: 10px; }
  .tab-group         { width: 100%; justify-content: stretch; }
  .tab-btn           { flex: 1; text-align: center; padding: 6px 8px; font-size: .78rem; }

  /* Widgets: back to single column */
  .right-col { grid-template-columns: 1fr; }

  /* Donut: side by side still works, just smaller */
  .donut-wrap { width: 90px; height: 90px; }
}

/* ── Very small phones (≤ 380px) ──
   Stat cards: 1 column */
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
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite; /* ← naikkan dari 1.2s ke 1.5s */
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
  background: #fff;
  color: #9ca3af;
  font-size: .875rem;
  min-height: 300px;
  border-radius: 0 0 16px 16px;
}
</style>
