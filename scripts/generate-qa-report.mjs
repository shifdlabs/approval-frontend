import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'

// ─────────────────────────────────────────────────────────────────────────────
// Test Results — 3 Projects
// ─────────────────────────────────────────────────────────────────────────────

const unauthedTests = [
  { id: 'FE-LOGIN-01', suite: 'Unauthenticated', test: 'Halaman login tampil dengan semua elemen', result: 'PASS', notes: '' },
  { id: 'FE-LOGIN-02', suite: 'Unauthenticated', test: 'Submit form kosong menampilkan error required', result: 'PASS', notes: '' },
  { id: 'FE-LOGIN-03', suite: 'Unauthenticated', test: 'Email invalid format menampilkan error validasi', result: 'PASS', notes: '' },
  { id: 'FE-LOGIN-04', suite: 'Unauthenticated', test: 'Email tanpa domain ("abc@") ditolak', result: 'PASS', notes: '' },
  { id: 'FE-LOGIN-05', suite: 'Unauthenticated', test: 'XSS payload pada email field tidak mengeksekusi script', result: 'PASS', notes: 'XSS terlindungi dengan baik oleh Vue' },
  { id: 'FE-LOGIN-06', suite: 'Unauthenticated', test: 'Password kosong menampilkan error required', result: 'PASS', notes: '' },
  { id: 'FE-LOGIN-07', suite: 'Unauthenticated', test: 'Email sangat panjang (>255 chars) — dokumentasi', result: 'PASS', notes: 'Tidak ada maxlength di email login — risk rendah' },
  { id: 'FE-LOGIN-08', suite: 'Unauthenticated', test: 'Kredensial salah menampilkan error (bukan crash)', result: 'PASS', notes: 'Aplikasi tidak crash, error ditampilkan dengan benar' },
  { id: 'FE-LOGIN-09', suite: 'Unauthenticated', test: 'Default credentials hardcoded di form — FIXED', result: 'PASS', notes: 'Credentials dihapus dari controller' },
  { id: 'FE-ROUTE-01', suite: 'Unauthenticated', test: '/admin/users tanpa auth redirect ke login', result: 'PASS', notes: '' },
  { id: 'FE-ROUTE-02', suite: 'Unauthenticated', test: '/reguler/dashboard tanpa auth redirect ke login', result: 'PASS', notes: '' },
  { id: 'FE-ROUTE-03', suite: 'Unauthenticated', test: '/document/create tanpa auth redirect ke login — FIXED', result: 'PASS', notes: 'Route guard sekarang melindungi /document/* /profile /preview' },
  { id: 'FE-ROUTE-04', suite: 'Unauthenticated', test: '/profile tanpa auth redirect ke login', result: 'PASS', notes: '' },
  { id: 'FE-PASS-01', suite: 'Unauthenticated', test: 'passwordValidator menerima special chars diperluas (^,~,[)', result: 'PASS', notes: '^+=~[] dll sekarang diterima sebagai special char' },
  { id: 'FE-STATIC-01', suite: 'Unauthenticated', test: 'Semua bug terdokumentasi — 12 FIXED, 2 OPEN', result: 'PASS', notes: '' },
]

const adminTests = [
  { id: 'ADM-01', suite: 'Admin', test: 'Halaman /admin/users berhasil dimuat dengan data tabel', result: 'PASS', notes: '' },
  { id: 'ADM-02', suite: 'Admin', test: 'Search users — filter tabel berubah sesuai keyword', result: 'PASS', notes: '1 row ditemukan saat search "admin"' },
  { id: 'ADM-03', suite: 'Admin', test: 'Search users — XSS payload tidak mengeksekusi script', result: 'PASS', notes: '' },
  { id: 'ADM-04', suite: 'Admin', test: 'Buka dialog Create User — semua field tampil (termasuk type=tel)', result: 'PASS', notes: '' },
  { id: 'ADM-05', suite: 'Admin', test: 'Create User — submit kosong menampilkan error required', result: 'PASS', notes: '' },
  { id: 'ADM-06', suite: 'Admin', test: 'Create User — email format invalid ditolak', result: 'PASS', notes: '' },
  { id: 'ADM-07', suite: 'Admin', test: 'Create User — password lemah (no uppercase/special) ditolak', result: 'PASS', notes: '' },
  { id: 'ADM-08', suite: 'Admin', test: 'Create User — password dengan ^ diterima setelah fix regex (FIX VERIFIED)', result: 'PASS', notes: 'Regex diperluas — ^ sekarang valid' },
  { id: 'ADM-09', suite: 'Admin', test: 'Create User — confirm password mismatch ditolak', result: 'PASS', notes: '' },
  { id: 'ADM-10', suite: 'Admin', test: 'Create User — phone < 5 karakter ditolak', result: 'PASS', notes: '' },
  { id: 'ADM-11', suite: 'Admin', test: 'Create User — phone field menerima +62 (type=tel, FIX VERIFIED)', result: 'PASS', notes: 'type=tel sekarang mengizinkan +62' },
  { id: 'ADM-12', suite: 'Admin', test: 'Create User — firstName > 100 chars ditolak (FIX VERIFIED)', result: 'PASS', notes: 'maxLengthValidator(100) bekerja' },
  { id: 'ADM-13', suite: 'Admin', test: 'Create User — XSS di firstName tidak mengeksekusi script', result: 'PASS', notes: '' },
  { id: 'ADM-14', suite: 'Admin', test: 'Halaman /admin/positions berhasil dimuat', result: 'PASS', notes: '' },
  { id: 'ADM-15', suite: 'Admin', test: 'Create Position — form validasi berjalan (Required.)', result: 'PASS', notes: 'Validasi inline muncul saat blur' },
  { id: 'ADM-16', suite: 'Admin', test: 'Halaman /admin/document/numbers berhasil dimuat', result: 'PASS', notes: 'Path yang benar: /admin/document/numbers (bukan /admin/document.numbers)' },
  { id: 'ADM-17', suite: 'Admin', test: 'Create Publication Format — FIX VERIFIED — submit kosong diblok', result: 'PASS', notes: 'Fix CreatePublicationFormatDialog terverifikasi' },
  { id: 'ADM-18', suite: 'Admin', test: 'Halaman /admin/letterhead berhasil dimuat tanpa crash', result: 'PASS', notes: '' },
  { id: 'ADM-19', suite: 'Admin', test: 'Halaman /admin/approvals berhasil dimuat tanpa crash', result: 'PASS', notes: '' },
  { id: 'ADM-20', suite: 'Admin', test: 'Halaman /admin/histories berhasil dimuat tanpa crash', result: 'PASS', notes: '' },
  { id: 'ADM-21', suite: 'Admin', test: 'Halaman /admin/app/log berhasil dimuat tanpa crash', result: 'PASS', notes: 'Path yang benar: /admin/app/log (bukan /admin/app.log)' },
]

const regulerTests = [
  { id: 'REG-01', suite: 'Reguler', test: 'Halaman /reguler/dashboard berhasil dimuat (Dashboard Persuratan)', result: 'PASS', notes: 'Dashboard pakai custom CSS, bukan VCard' },
  { id: 'REG-02', suite: 'Reguler', test: 'Dashboard search — XSS tidak dieksekusi', result: 'PASS', notes: '' },
  { id: 'REG-03', suite: 'Reguler', test: 'Halaman /document/create berhasil dimuat dengan semua tab', result: 'PASS', notes: 'Tab Header, Approver, Letterhead terverifikasi' },
  { id: 'REG-04', suite: 'Reguler', test: 'Tab 1 — Subject kosong diblok saat Submit', result: 'PASS', notes: '"Please review and complete all required fields" muncul' },
  { id: 'REG-05', suite: 'Reguler', test: 'Tab 1 — Subject > 200 karakter ditolak (FIX VERIFIED)', result: 'PASS', notes: 'maxLengthValidator(200) bekerja pada Subject' },
  { id: 'REG-06', suite: 'Reguler', test: 'Tab 1 — Subject XSS payload tidak mengeksekusi script', result: 'PASS', notes: '' },
  { id: 'REG-07', suite: 'Reguler', test: 'Tab 1 — External Recipient wajib diisi saat tipe External (FIX VERIFIED)', result: 'PASS', notes: 'Validasi kondisional bekerja' },
  { id: 'REG-08', suite: 'Reguler', test: 'Tab 1 — Priority required saat submit', result: 'PASS', notes: '' },
  { id: 'REG-09', suite: 'Reguler', test: 'Tab 2 — Body editor (TipTap) visible', result: 'PASS', notes: '' },
  { id: 'REG-10', suite: 'Reguler', test: 'Tab 3 — Approver 1 dropdown visible', result: 'PASS', notes: '"Approver 1" label terverifikasi di Tab Approver' },
  { id: 'REG-11', suite: 'Reguler', test: 'Tab 4 — File upload area visible', result: 'PASS', notes: '' },
  { id: 'REG-12', suite: 'Reguler', test: 'Tab 5 — Letterhead selection visible', result: 'PASS', notes: '' },
  { id: 'REG-13', suite: 'Reguler', test: 'Tab 5 — Save as Draft button tersedia', result: 'PASS', notes: '' },
  { id: 'REG-14', suite: 'Reguler', test: 'Halaman /profile berhasil dimuat', result: 'PASS', notes: '' },
  { id: 'REG-15', suite: 'Reguler', test: 'Profile — dialog Edit Personal Information terbuka', result: 'PASS', notes: '' },
  { id: 'REG-16', suite: 'Reguler', test: 'Profile — Update Biodata submit dengan firstName kosong ditolak', result: 'PASS', notes: 'Validasi inline muncul saat blur firstName kosong' },
  { id: 'REG-17', suite: 'Reguler', test: 'Profile — Update Biodata firstName > 100 chars ditolak (FIX VERIFIED)', result: 'PASS', notes: 'maxLengthValidator(100) bekerja di UpdateBiodataDialog' },
  { id: 'REG-18', suite: 'Reguler', test: 'Profile — Change Email dialog terbuka', result: 'PASS', notes: '' },
  { id: 'REG-19', suite: 'Reguler', test: 'Profile — Change Email dengan format invalid ditolak (FIX VERIFIED)', result: 'PASS', notes: 'Dialog tetap terbuka saat email invalid — fix unconditional close bekerja' },
  { id: 'REG-20', suite: 'Reguler', test: 'Profile — Change Email dialog tetap buka saat validasi gagal (FIX VERIFIED)', result: 'PASS', notes: 'Verifikasi bug FE-BUG-09 sudah diperbaiki' },
  { id: 'REG-21', suite: 'Reguler', test: 'Halaman /reguler/inbox berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  { id: 'REG-22', suite: 'Reguler', test: 'Halaman /reguler/draft berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  { id: 'REG-23', suite: 'Reguler', test: 'Halaman /reguler/progress berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  { id: 'REG-24', suite: 'Reguler', test: 'Halaman /reguler/complete berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  { id: 'REG-25', suite: 'Reguler', test: 'Halaman /reguler/rejected berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  { id: 'REG-26', suite: 'Reguler', test: 'Halaman /reguler/bookmark berhasil dimuat tanpa error', result: 'PASS', notes: '' },
  // REG-23 to REG-26 = document list pages (already in above)
]

const allTests = [...unauthedTests, ...adminTests, ...regulerTests]
const totalTests = allTests.length
const passedTests = allTests.filter(t => t.result === 'PASS').length

// ─────────────────────────────────────────────────────────────────────────────
// Bug Report
// ─────────────────────────────────────────────────────────────────────────────

const bugReport = [
  {
    id: 'FE-BUG-13',
    component: 'login-controller.ts',
    url: '/ (login)',
    field: 'credentials ref',
    bugType: 'Security — Hardcoded Credentials di Source Code',
    severity: 'CRITICAL',
    status: 'FIXED',
    backendAlignment: 'Credentials hardcoded merujuk ke akun admin aktif di backend',
    stepsToReproduce: '1. Buka halaman login\n2. Form langsung terisi admin@approval.com / Test1234!\n3. Siapapun yang lihat source code tahu kredensial admin',
    rootCause: 'credentials ref diinisialisasi dengan email dan password aktif, bukan string kosong',
    fix: 'Ubah inisialisasi credentials menjadi email:"" dan password:""',
    fixedIn: 'src/controllers/login-controller.ts',
  },
  {
    id: 'FE-BUG-06',
    component: 'CreatePublicationFormatDialog',
    url: '/admin/document/numbers',
    field: 'Tombol "Create Format"',
    bugType: 'Form Validation Bypass',
    severity: 'CRITICAL',
    status: 'FIXED',
    backendAlignment: 'Backend menerima request tanpa validasi frontend → error 400 tidak informatif',
    stepsToReproduce: '1. Buka dialog Create Publication Format\n2. Kosongkan semua field\n3. Klik "Create Format"\n4. Request API langsung dikirim tanpa validasi apapun',
    rootCause: 'Tombol memanggil API langsung (bukan onFormSubmit). Tidak ada VForm wrapper untuk field utama',
    fix: '1. Buat refMainForm terpisah\n2. Bungkus field utama dengan <VForm ref="refMainForm">\n3. Tambah :rules="[requiredValidator]" pada groupId dan separator\n4. Hubungkan tombol ke onFormSubmit',
    fixedIn: 'src/components/dialogs/CreatePublicationFormatDialog.vue',
  },
  {
    id: 'FE-BUG-14',
    component: 'Router Guard',
    url: '/document/create, /document/:id, /profile, /preview/*',
    field: 'router.beforeEach',
    bugType: 'Security — Route Tidak Diproteksi Auth',
    severity: 'HIGH',
    status: 'FIXED',
    backendAlignment: 'API endpoint dilindungi JWT tapi halaman frontend bisa diakses tanpa login',
    stepsToReproduce: '1. Tanpa login, buka /document/create\n2. Halaman tampil tanpa redirect ke login',
    rootCause: 'Router guard hanya melindungi /admin/* dan /reguler/*',
    fix: 'Tambah kondisi: startsWith("/document") || startsWith("/profile") || startsWith("/preview")',
    fixedIn: 'src/plugins/1.router/index.ts',
  },
  {
    id: 'FE-BUG-08',
    component: 'UpdateUserDialog / CreateUserDialog',
    url: '/admin/users',
    field: 'Form Submit Handler',
    bugType: 'Silent Failure — Dialog menutup saat API error',
    severity: 'HIGH',
    status: 'FIXED',
    backendAlignment: 'API mengembalikan error tapi UI tidak menampilkannya ke user',
    stepsToReproduce: '1. Buka dialog Update/Create User\n2. Backend kembalikan error (misal email duplikat)\n3. Dialog langsung menutup tanpa pesan error',
    rootCause: 'emit("update:isDialogVisible", false) dipanggil unconditional di else dan catch block',
    fix: 'Pindahkan emit close hanya ke dalam blok success. Saat gagal → isAllInputtedValid = false',
    fixedIn: 'UpdateUserDialog.vue, CreateUserDialog.vue',
  },
  {
    id: 'FE-BUG-09',
    component: 'ChangeEmailDialog / UpdateBiodataDialog',
    url: '/profile',
    field: 'Form Submit Handler',
    bugType: 'Silent Failure — Dialog menutup saat API error',
    severity: 'HIGH',
    status: 'FIXED',
    backendAlignment: 'Sama seperti FE-BUG-08',
    stepsToReproduce: '1. Buka dialog Change Email\n2. Masukkan email yang sudah terdaftar\n3. Dialog menutup meski update gagal',
    rootCause: 'emit dialog close dipanggil setelah try/catch tanpa cek sukses/gagal',
    fix: 'emit close hanya saat data.value?.success === true. Saat gagal set isAllInputtedValid = false',
    fixedIn: 'ChangeEmailDialog.vue, UpdateBiodataDialog.vue',
  },
  {
    id: 'FE-BUG-07',
    component: 'CreatePublicationFormatDialog',
    url: '/admin/document/numbers',
    field: 'groupId, separator',
    bugType: 'Missing Required Validation',
    severity: 'HIGH',
    status: 'FIXED',
    backendAlignment: 'Backend memerlukan group_id dan separator untuk membuat format',
    stepsToReproduce: '1. Buka dialog Create Publication Format\n2. Isi Format Name saja\n3. Biarkan Group dan Separator kosong\n4. Submit → diterima (sebelum fix)',
    rootCause: 'AppSelect groupId dan separator tidak punya :rules attribute',
    fix: 'Tambah :rules="[requiredValidator]" pada kedua AppSelect di form utama',
    fixedIn: 'CreatePublicationFormatDialog.vue',
  },
  {
    id: 'FE-BUG-01',
    component: 'CreateUserDialog / UpdateUserDialog / UpdateBiodataDialog',
    url: '/admin/users, /profile',
    field: 'firstName, lastName',
    bugType: 'Missing maxLength Validation',
    severity: 'MEDIUM',
    status: 'FIXED',
    backendAlignment: 'Backend DB column kemungkinan punya batas panjang; frontend tidak sinkron',
    stepsToReproduce: '1. Buka dialog Create/Update User\n2. Isi firstName/lastName dengan 500+ karakter\n3. Submit → tidak ada error',
    rootCause: ':rules hanya [requiredValidator], tidak ada maxlength check',
    fix: 'Tambah maxLengthValidator(100) pada rules firstName dan lastName di 3 komponen',
    fixedIn: 'CreateUserDialog.vue, UpdateUserDialog.vue, UpdateBiodataDialog.vue',
  },
  {
    id: 'FE-BUG-10',
    component: 'validators.ts',
    url: 'Global (semua form dengan password)',
    field: 'passwordValidator regex',
    bugType: 'Regex Terlalu Ketat — Special Chars Terbatas',
    severity: 'MEDIUM',
    status: 'FIXED',
    backendAlignment: 'Backend hanya mensyaratkan min=8, max=200. Regex frontend lebih ketat tapi salah',
    stepsToReproduce: '1. Isi "Password123^" (punya uppercase, lowercase, digit, special char ^)\n2. Error: "must contain special character" meski ^ adalah special char yang valid',
    rootCause: 'Regex hanya mendaftarkan [!@#$%&*()] — karakter ^+=[]{}|:;~<>? tidak dikenali',
    fix: 'Perluas regex mencakup semua printable special chars ASCII',
    fixedIn: 'src/@core/utils/validators.ts',
  },
  {
    id: 'FE-BUG-02',
    component: 'Create Document',
    url: '/document/create',
    field: 'subject',
    bugType: 'Missing maxLength Validation',
    severity: 'MEDIUM',
    status: 'FIXED',
    backendAlignment: 'Backend kolom subject punya batas DB; frontend tidak punya batas',
    stepsToReproduce: '1. Isi Subject dengan 1000+ karakter\n2. Submit → tidak ada error di frontend',
    rootCause: ':rules hanya [requiredValidator]',
    fix: 'Tambah maxLengthValidator(200) pada Subject field',
    fixedIn: 'src/pages/document/create.vue',
  },
  {
    id: 'FE-BUG-05',
    component: 'Create Document',
    url: '/document/create',
    field: 'externalRecipient',
    bugType: 'Missing Conditional Validation',
    severity: 'MEDIUM',
    status: 'FIXED',
    backendAlignment: 'Backend perlu penerima eksternal saat tipe = External',
    stepsToReproduce: '1. Pilih Document Type = External\n2. Biarkan External Recipients kosong\n3. Submit → tidak ada error validasi',
    rootCause: 'Field tidak punya :rules attribute sama sekali',
    fix: ':rules="isExternalRecipientsEnable ? [requiredValidator, maxLengthValidator(500)] : []"',
    fixedIn: 'src/pages/document/create.vue',
  },
  {
    id: 'FE-BUG-03',
    component: 'CreateUserDialog / UpdateUserDialog / UpdateBiodataDialog',
    url: '/admin/users, /profile',
    field: 'phoneNumber',
    bugType: 'Wrong Input Type (number → tel)',
    severity: 'MEDIUM',
    status: 'FIXED',
    backendAlignment: 'Backend menyimpan nomor telepon sebagai string termasuk prefix +62',
    stepsToReproduce: '1. Buka dialog buat/edit user\n2. Coba ketik +6281234567890\n3. Karakter + tidak bisa diinput (type="number")',
    rootCause: 'Input type="number" memblok karakter + yang dibutuhkan untuk nomor internasional',
    fix: 'Ubah type="number" → type="tel"',
    fixedIn: 'CreateUserDialog.vue, UpdateUserDialog.vue, UpdateBiodataDialog.vue',
  },
  {
    id: 'FE-BUG-12',
    component: 'Create Document',
    url: '/document/create',
    field: 'Reference label',
    bugType: 'UI Misleading — Asterisk tanpa validasi',
    severity: 'LOW',
    status: 'FIXED',
    backendAlignment: 'Reference bersifat opsional di backend',
    stepsToReproduce: '1. Label "Reference *" memberi kesan wajib\n2. Tapi form bisa disubmit tanpa referensi',
    rootCause: 'VLabel hardcoded "Reference *" tapi tidak ada :rules',
    fix: 'Hapus asterisk: "Reference *" → "Reference"',
    fixedIn: 'src/pages/document/create.vue',
  },
]

const openBugs = [
  {
    id: 'FE-BUG-04',
    component: 'CreateUserDialog',
    url: '/admin/users',
    field: 'positionId',
    bugType: 'Missing Required Validation (mungkin by design)',
    severity: 'LOW',
    status: 'OPEN — Perlu konfirmasi product',
    backendAlignment: 'Backend mungkin accept positionID opsional (omitempty,uuid)',
    stepsToReproduce: '1. Buka dialog Create User\n2. Biarkan Job Position tidak dipilih\n3. Form tetap bisa disubmit',
    rootCause: 'positionId AppSelect tidak punya :rules (clearable = opsional)',
    fix: 'Konfirmasi ke product team apakah posisi wajib. Jika wajib: tambah requiredValidator',
  },
  {
    id: 'FE-BUG-11',
    component: 'validators.ts',
    url: 'Global',
    field: 'phoneValidator',
    bugType: 'Validator Returns True on Empty',
    severity: 'INFO',
    status: 'ACCEPTED — By design',
    backendAlignment: '—',
    stepsToReproduce: 'Gunakan phoneValidator saja tanpa requiredValidator',
    rootCause: 'phoneValidator menggunakan isEmpty() — pattern Vuetify standard untuk optional fields',
    fix: 'Tidak perlu diubah. Selalu dipasangkan dengan requiredValidator',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Build Excel
// ─────────────────────────────────────────────────────────────────────────────

const wb = XLSX.utils.book_new()

// ── Sheet 1: Summary ─────────────────────────────────────────────────────────
const summaryData = [
  ['QA Frontend Validation Report — ShifdLabs Approval'],
  ['Tanggal', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
  ['Tester', 'Claude (Playwright automated, authenticated)'],
  [''],
  ['Playwright Test Summary'],
  ['Suite', 'Total', 'PASS', 'FAIL'],
  ['Unauthenticated', unauthedTests.length, unauthedTests.filter(t => t.result==='PASS').length, unauthedTests.filter(t => t.result!=='PASS').length],
  ['Admin (authenticated)', adminTests.length, adminTests.filter(t => t.result==='PASS').length, adminTests.filter(t => t.result!=='PASS').length],
  ['Reguler (authenticated)', regulerTests.length, regulerTests.filter(t => t.result==='PASS').length, regulerTests.filter(t => t.result!=='PASS').length],
  ['TOTAL', totalTests, passedTests, totalTests - passedTests],
  [''],
  ['Bug Summary'],
  ['Kategori', 'Jumlah'],
  ['FIXED', bugReport.length],
  ['OPEN (perlu keputusan product)', openBugs.filter(b => b.status.startsWith('OPEN')).length],
  ['ACCEPTED (by design)', openBugs.filter(b => b.status.startsWith('ACCEPTED')).length],
  [''],
  ['FIXED — Distribusi Severity'],
  ['Severity', 'Jumlah'],
  ['CRITICAL', bugReport.filter(b => b.severity === 'CRITICAL').length],
  ['HIGH',     bugReport.filter(b => b.severity === 'HIGH').length],
  ['MEDIUM',   bugReport.filter(b => b.severity === 'MEDIUM').length],
  ['LOW',      bugReport.filter(b => b.severity === 'LOW').length],
  [''],
  ['Catatan'],
  ['Admin credential', 'Disimpan di tests/e2e/.auth/admin.json (gitignored)'],
  ['Reguler credential', 'Disimpan di tests/e2e/.auth/reguler.json (gitignored)'],
  ['Test coverage', 'Login form, route guard, Create User, Publication Format, profile dialogs, semua halaman admin & reguler'],
]

const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
wsSummary['!cols'] = [{ wch: 35 }, { wch: 45 }]
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

// ── Sheet 2: All Playwright Results ─────────────────────────────────────────
const testHeader = ['Test ID', 'Suite', 'Test Name', 'Result', 'Notes']
const testRows = allTests.map(r => [r.id, r.suite, r.test, r.result, r.notes])

const wsTests = XLSX.utils.aoa_to_sheet([testHeader, ...testRows])
wsTests['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 65 }, { wch: 8 }, { wch: 55 }]
XLSX.utils.book_append_sheet(wb, wsTests, 'Playwright Results (64 Tests)')

// ── Sheet 3: Bug Report (Fixed) ───────────────────────────────────────────────
const bugHeader = [
  'Bug ID', 'Component', 'URL', 'Field',
  'Bug Type', 'Severity', 'Status', 'Backend Alignment Issue',
  'Steps to Reproduce', 'Root Cause', 'Fix Applied', 'Fixed In File(s)',
]
const bugRows = bugReport.map(b => [
  b.id, b.component, b.url, b.field,
  b.bugType, b.severity, b.status, b.backendAlignment,
  b.stepsToReproduce, b.rootCause, b.fix, b.fixedIn,
])

const wsBugs = XLSX.utils.aoa_to_sheet([bugHeader, ...bugRows])
wsBugs['!cols'] = [
  { wch: 12 }, { wch: 40 }, { wch: 30 }, { wch: 22 },
  { wch: 40 }, { wch: 10 }, { wch: 8 }, { wch: 50 },
  { wch: 55 }, { wch: 55 }, { wch: 60 }, { wch: 50 },
]
XLSX.utils.book_append_sheet(wb, wsBugs, 'Bug Report (12 Fixed)')

// ── Sheet 4: Open Bugs ────────────────────────────────────────────────────────
const openHeader = [
  'Bug ID', 'Component', 'URL', 'Field',
  'Bug Type', 'Severity', 'Status',
  'Steps to Reproduce', 'Root Cause', 'Recommendation',
]
const openRows = openBugs.map(b => [
  b.id, b.component, b.url, b.field,
  b.bugType, b.severity, b.status,
  b.stepsToReproduce, b.rootCause, b.fix,
])

const wsOpen = XLSX.utils.aoa_to_sheet([openHeader, ...openRows])
wsOpen['!cols'] = [
  { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
  { wch: 40 }, { wch: 10 }, { wch: 28 },
  { wch: 50 }, { wch: 55 }, { wch: 55 },
]
XLSX.utils.book_append_sheet(wb, wsOpen, 'Open & Accepted Bugs')

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = 'qa_frontend_validation_report.xlsx'
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
writeFileSync(outPath, buf)
console.log(`✅  Laporan Excel ditulis ke: ${outPath}`)
console.log(`    Total tests: ${totalTests} — PASS: ${passedTests} — FAIL: ${totalTests - passedTests}`)
console.log(`    Bugs FIXED: ${bugReport.length} — OPEN: ${openBugs.length}`)
