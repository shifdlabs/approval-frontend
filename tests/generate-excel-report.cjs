/**
 * Generate QA Excel Report from test findings
 * Run: node tests/generate-excel-report.js
 */

// Check if ExcelJS is available, if not use a simple CSV approach
let ExcelJS
try {
  ExcelJS = require('exceljs')
} catch {
  // fallback: install inline
  require('child_process').execSync('npm install exceljs --save-dev 2>/dev/null', { cwd: __dirname + '/..', stdio: 'ignore' })
  ExcelJS = require('exceljs')
}

const path = require('path')
const fs = require('fs')

// ─────────────────────────────────────────────────────────────────────────────
// Bug data — compiled from Playwright test runs + static analysis + code review
// ─────────────────────────────────────────────────────────────────────────────

const bugData = [
  // ── LOGIN FORM ──────────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-01',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email, password',
    bugType: 'Required Validation Not Working',
    severity: 'HIGH',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-02: controller harus return setelah error. Frontend tidak menampilkan required error saat submit form kosong.',
    stepsToReproduce: '1. Buka http://localhost:5173/\n2. Pastikan email dan password kosong\n3. Klik tombol "Login"\n4. Error required tidak muncul',
    actualBehavior: 'Form di-submit tanpa menampilkan pesan validasi "This field is required"',
    expectedBehavior: 'Muncul pesan "This field is required" di bawah field email dan password',
    recommendation: 'Cek apakah form di-submit dengan email default (pre-filled dari controller). Pastikan validation trigger bekerja untuk empty state',
    screenshotFile: 'FE-LOGIN-02-empty-submit.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-02',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email',
    bugType: 'Hardcoded Default Credentials',
    severity: 'HIGH',
    status: 'FAIL',
    backendAlignmentIssue: 'Bukan backend issue — murni frontend security concern',
    stepsToReproduce: '1. Buka http://localhost:5173/ di browser\n2. Perhatikan field email sudah terisi "admin@approval.com"\n3. Password sudah terisi "Test1234!"',
    actualBehavior: 'Form login pre-filled dengan credentials admin yang hardcoded di login-controller.ts',
    expectedBehavior: 'Form login harus kosong saat pertama dibuka',
    recommendation: 'Hapus hardcoded credentials dari loginController. Jangan pernah pre-fill credentials di production code.',
    screenshotFile: 'FE-LOGIN-09-prefilled-credentials.png',
    testedBy: 'Static Code Analysis + Playwright',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-03',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email',
    bugType: 'No Max Length Restriction',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend tidak ada max length check pada email field di login endpoint',
    stepsToReproduce: '1. Di halaman login, isi email dengan 260+ karakter\n2. Tidak ada pesan error max length',
    actualBehavior: 'Email field menerima input sepanjang apapun tanpa batasan',
    expectedBehavior: 'Email dibatasi max 254 karakter (RFC 5321)',
    recommendation: 'Tambahkan maxlength="254" attribute atau maxlengthValidator pada email field login',
    screenshotFile: 'FE-LOGIN-06-long-email.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── ROUTE PROTECTION ──────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-04',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/admin/users',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint. Frontend tidak melindungi halaman ini.',
    stepsToReproduce: '1. Buka browser baru (tanpa login)\n2. Akses langsung: http://localhost:5173/admin/users\n3. Halaman tampil tanpa redirect ke login',
    actualBehavior: 'Halaman /admin/users dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login jika belum autentikasi',
    recommendation: 'Pastikan navigation guard memeriksa token sebelum mengijinkan akses ke semua route terproteksi (/admin/*, /reguler/*, /document/*, /profile)',
    screenshotFile: 'FE-ROUTE--admin-users.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-05',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/admin/positions',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint. Frontend tidak melindungi halaman ini.',
    stepsToReproduce: '1. Tanpa login, akses: http://localhost:5173/admin/positions\n2. Halaman tampil',
    actualBehavior: 'Halaman /admin/positions dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login',
    recommendation: 'Perbaiki navigation guard, pastikan semua route /admin/* terproteksi',
    screenshotFile: 'FE-ROUTE--admin-positions.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-06',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/admin/document-numbers',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint.',
    stepsToReproduce: '1. Tanpa login, akses: http://localhost:5173/admin/document-numbers\n2. Halaman tampil',
    actualBehavior: 'Halaman /admin/document-numbers dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login',
    recommendation: 'Perbaiki navigation guard untuk route /admin/document-numbers',
    screenshotFile: 'FE-ROUTE--admin-document-numbers.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-07',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/reguler/dashboard',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint.',
    stepsToReproduce: '1. Tanpa login, akses: http://localhost:5173/reguler/dashboard',
    actualBehavior: 'Dashboard reguler user dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login',
    recommendation: 'Pastikan route /reguler/* memiliki auth guard',
    screenshotFile: 'FE-ROUTE--reguler-dashboard.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-08',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/document/create',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint.',
    stepsToReproduce: '1. Tanpa login, akses: http://localhost:5173/document/create',
    actualBehavior: 'Halaman Create Document dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login',
    recommendation: 'Pastikan route /document/* memiliki auth guard',
    screenshotFile: 'FE-ROUTE--document-create.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-09',
    component: 'Router / Auth Guard',
    url: 'http://localhost:5173/profile',
    field: 'Route Guard',
    bugType: 'Missing Auth Guard — Route Accessible Without Login',
    severity: 'CRITICAL',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend memerlukan JWT Bearer token untuk semua endpoint.',
    stepsToReproduce: '1. Tanpa login, akses: http://localhost:5173/profile',
    actualBehavior: 'Halaman Profile dapat diakses tanpa autentikasi',
    expectedBehavior: 'Redirect ke halaman login',
    recommendation: 'Pastikan route /profile memiliki auth guard',
    screenshotFile: 'FE-ROUTE--profile.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── CREATE USER DIALOG ────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-10',
    component: 'CreateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'positionId (AppSelect)',
    bugType: 'Missing Required Validation on Select',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-17: PositionID harus berupa UUID valid. Frontend tidak mewajibkan pilih posisi.',
    stepsToReproduce: '1. Login admin\n2. Buka /admin/users\n3. Klik "Add New User"\n4. Isi semua field kecuali Job Position\n5. Klik Register\n6. Form di-submit tanpa posisi',
    actualBehavior: 'Job Position tidak memiliki :rules validator, form bisa submit tanpa pilih posisi',
    expectedBehavior: 'Muncul error "This field is required" jika posisi tidak dipilih',
    recommendation: 'Tambahkan :rules="[requiredValidator]" pada AppSelect positionId di CreateUserDialog.vue baris ~198',
    screenshotFile: 'FE-USER-08-no-position.png',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-11',
    component: 'CreateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'phoneNumber',
    bugType: 'Phone Field type="number" Breaks +62 Input',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-18: phone validate:"required,min=5,max=20" — format fleksibel. Frontend perlu support +62.',
    stepsToReproduce: '1. Buka Create User dialog\n2. Coba isi phone: "+628123456789"\n3. Karakter "+" tidak bisa diinput karena type="number"',
    actualBehavior: 'Input type="number" menolak karakter "+", tidak bisa input nomor dengan prefix internasional',
    expectedBehavior: 'Bisa input "+628123456789" atau "08123456789"',
    recommendation: 'Ubah type="number" ke type="tel" pada field phoneNumber di CreateUserDialog.vue dan UpdateUserDialog.vue',
    screenshotFile: 'FE-USER-07-phone-plus62.png',
    testedBy: 'Playwright Automation + Static Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-12',
    component: 'validators.ts',
    url: '*',
    field: 'passwordValidator',
    bugType: 'Password Validator Accepts Limited Special Chars Only',
    severity: 'HIGH',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-09: min=8 chars. Frontend validator lebih restriktif dari perlu: hanya terima !@#$%&*() sebagai special chars.',
    stepsToReproduce: '1. Di form apapun yang punya passwordValidator\n2. Isi password: "Password123^"\n3. Validator menolak walau ada special char',
    actualBehavior: 'Regex /(?=.*[!@#$%&*()]).{8,}/ — hanya 8 karakter special yang diterima. "^", "+", "=", dll ditolak.',
    expectedBehavior: 'Semua special characters ASCII standar diterima (OWASP rekomendasi)',
    recommendation: 'Update regex ke: /(?=.*[!-/:-@[-`{-~]).{8,}/ atau gunakan /(?=.*[^A-Za-z0-9]).{8,}/ untuk terima semua non-alphanumeric',
    screenshotFile: '-',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── DOCUMENT CREATE ───────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-13',
    component: 'DocumentCreatePage',
    url: 'http://localhost:5173/document/create',
    field: 'Required fields',
    bugType: 'Required Validation Not Working on Document Form',
    severity: 'HIGH',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-02/07: controller validation. Frontend juga harus validate sebelum submit.',
    stepsToReproduce: '1. Login reguler user\n2. Buka /document/create\n3. Klik tombol Submit/Create tanpa isi field\n4. Error required tidak muncul',
    actualBehavior: 'Form dokumen submit tanpa error required muncul (atau submit button tidak terdeteksi dengan benar)',
    expectedBehavior: 'Muncul error required di Subject, Priority, Type, Body, dan Approver',
    recommendation: 'Periksa tombol submit di form create document dan pastikan VForm.validate() dipanggil sebelum submit',
    screenshotFile: 'FE-DOC-01-empty-doc-form.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-14',
    component: 'DocumentCreatePage',
    url: 'http://localhost:5173/document/create',
    field: 'subject',
    bugType: 'No Max Length on Subject Field',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend tidak ada max length validation pada subject field',
    stepsToReproduce: '1. Buka Create Document\n2. Isi Subject dengan 1000 karakter\n3. Field menerima semua input tanpa batas',
    actualBehavior: 'Subject field menerima input sepanjang apapun',
    expectedBehavior: 'Subject dibatasi maxlength yang reasonable (mis. 255 karakter)',
    recommendation: 'Tambahkan maxLengthValidator(255) pada rules field subject di create.vue',
    screenshotFile: 'FE-DOC-03-long-subject.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-15',
    component: 'DocumentCreatePage',
    url: 'http://localhost:5173/document/create',
    field: 'externalRecipient',
    bugType: 'External Recipient Without Email Format Validation',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend menerima string bebas — tidak ada per-item email validation',
    stepsToReproduce: '1. Buka Create Document\n2. Isi External Recipients: "bukan-email, juga-bukan-email"\n3. Form di-submit tanpa error',
    actualBehavior: 'External recipient tidak memiliki email format validation',
    expectedBehavior: 'Setiap item yang dipisah koma harus berformat email valid',
    recommendation: 'Split string by koma, validasi setiap item dengan emailValidator sebelum submit',
    screenshotFile: 'FE-DOC-04-doc-create-page.png',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── PUBLICATION FORMAT ────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-16',
    component: 'CreatePublicationFormatDialog',
    url: 'http://localhost:5173/admin/document-numbers',
    field: 'groupId, separator, format cells',
    bugType: 'Create Format Bypasses Validation',
    severity: 'HIGH',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-23: AppProperty key validation tidak lengkap. Frontend juga tidak validate groupId dan separator.',
    stepsToReproduce: '1. Login admin\n2. Buka /admin/document-numbers\n3. Klik Create Format\n4. Submit tanpa isi groupId, separator, atau format cells\n5. Request dikirim dengan data kosong',
    actualBehavior: 'groupId dan separator tidak memiliki requiredValidator. Format cells tidak divalidasi minimal 1 item.',
    expectedBehavior: 'Error required muncul untuk groupId, separator. Minimal 1 format cell harus ditambahkan.',
    recommendation: '1. Tambahkan :rules="[requiredValidator]" pada AppSelect groupId dan separator\n2. Tambahkan validasi cellFormats.length > 0 sebelum createNewPublicationFormat()',
    screenshotFile: 'FE-FORMAT-01-empty-format.png',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── UPDATE USER DIALOG ────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-17',
    component: 'UpdateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'Global (catch block)',
    bugType: 'Dialog Closes Unconditionally on API Error',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: '-',
    stepsToReproduce: '1. Admin buka Update User dialog\n2. Simulasikan API error (network down/server error)\n3. Dialog tertutup tanpa menampilkan error ke user',
    actualBehavior: 'catch block memanggil emit("update:isDialogVisible", false) tanpa menampilkan error message',
    expectedBehavior: 'Dialog tetap terbuka dan tampilkan pesan error jika API gagal',
    recommendation: 'Ganti unconditional dialog close di catch block dengan: isAllInputtedValid.value = false; (jangan emit close)',
    screenshotFile: '-',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-BUG-18',
    component: 'ChangeEmailDialog',
    url: 'http://localhost:5173/profile',
    field: 'Global (success check)',
    bugType: 'Dialog Closes Without Checking API Success',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: '-',
    stepsToReproduce: '1. Buka Change Email\n2. Submit dengan email yang sudah terdaftar\n3. Dialog tertutup tanpa error walaupun server return failure',
    actualBehavior: 'emit("update:isDialogVisible", false) dipanggil unconditionally setelah API call (sebelum fix oleh linter)',
    expectedBehavior: 'Dialog tetap terbuka jika update gagal, tampilkan error ke user',
    recommendation: 'Sudah diperbaiki oleh linter (cek if data.value?.success sebelum close dialog). Verifikasi perbaikan sudah di-deploy.',
    screenshotFile: '-',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── POSITIONS ────────────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-19',
    component: 'PositionsPage',
    url: 'http://localhost:5173/admin/positions',
    field: 'name',
    bugType: 'No Max Length on Position Name',
    severity: 'LOW',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend tidak ada maxlength pada position name field',
    stepsToReproduce: '1. Admin buka Positions page\n2. Buka Add Position dialog\n3. Isi nama dengan 500 karakter\n4. Diterima tanpa batas',
    actualBehavior: 'Position name field menerima input sepanjang apapun',
    expectedBehavior: 'Field dibatasi maxlength yang reasonable (mis. 100 char)',
    recommendation: 'Tambahkan maxlength validator pada position name field di halaman positions.vue',
    screenshotFile: 'FE-POS-03-long-name.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── VALIDATORS ───────────────────────────────────────────────────────────────
  {
    id: 'FE-BUG-20',
    component: 'validators.ts (phoneValidator)',
    url: '*',
    field: 'phoneNumber',
    bugType: 'phoneValidator Returns true for Empty Input',
    severity: 'MEDIUM',
    status: 'FAIL',
    backendAlignmentIssue: 'Backend BUG-18: phone validate:"required,min=5,max=20"',
    stepsToReproduce: '1. Panggil phoneValidator dengan string kosong\n2. Mengembalikan true (valid)\n3. Jika tanpa requiredValidator, phone kosong bisa lolos validasi',
    actualBehavior: 'phoneValidator: if (isEmpty(value)) return true — empty dianggap valid',
    expectedBehavior: 'Phone kosong harus ditolak jika tidak dipasang bersamaan dengan requiredValidator',
    recommendation: 'Selalu pasangkan phoneValidator dengan requiredValidator: :rules="[requiredValidator, phoneValidator]". Dokumentasikan di semua form yang pakai phone.',
    screenshotFile: '-',
    testedBy: 'Static Code Analysis',
    testDate: new Date().toISOString().split('T')[0],
  },
  // ── ITEMS PASSED ──────────────────────────────────────────────────────────────
  {
    id: 'FE-PASS-01',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email',
    bugType: 'Email Format Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi email "bukan-email" → klik Login',
    actualBehavior: 'Muncul error "The Email field must be a valid email" ✓',
    expectedBehavior: 'Error email format tampil',
    recommendation: '-',
    screenshotFile: 'FE-LOGIN-03-invalid-email.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-02',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email',
    bugType: 'Email Edge Case (abc@) Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi email "abc@" → klik Login',
    actualBehavior: 'Error validasi muncul ✓',
    expectedBehavior: 'Error email format tampil',
    recommendation: '-',
    screenshotFile: 'FE-LOGIN-04-email-no-domain.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-03',
    component: 'LoginPage',
    url: 'http://localhost:5173/',
    field: 'email',
    bugType: 'XSS Injection Prevention',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi email dengan XSS payload → klik Login',
    actualBehavior: 'XSS tidak dieksekusi ✓',
    expectedBehavior: 'XSS tidak berjalan',
    recommendation: '-',
    screenshotFile: 'FE-LOGIN-05-xss.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-04',
    component: 'DocumentCreatePage',
    url: 'http://localhost:5173/document/create',
    field: 'subject',
    bugType: 'XSS Injection Prevention',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi subject dengan XSS payload',
    actualBehavior: 'XSS tidak dieksekusi ✓',
    expectedBehavior: 'XSS tidak berjalan',
    recommendation: '-',
    screenshotFile: 'FE-DOC-02-xss-subject.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-05',
    component: 'PositionsPage',
    url: 'http://localhost:5173/admin/positions',
    field: 'name',
    bugType: 'XSS Injection Prevention',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi position name dengan XSS payload',
    actualBehavior: 'XSS tidak dieksekusi ✓',
    expectedBehavior: 'XSS tidak berjalan',
    recommendation: '-',
    screenshotFile: 'FE-POS-02-xss-position.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-06',
    component: 'ChangeEmailDialog',
    url: 'http://localhost:5173/profile',
    field: 'email',
    bugType: 'Required Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Buka Change Email dialog, klik Change tanpa isi email',
    actualBehavior: 'Muncul "This field is required" ✓',
    expectedBehavior: 'Error required tampil',
    recommendation: '-',
    screenshotFile: 'FE-PROF-03-change-email-empty.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-07',
    component: 'ChangeEmailDialog',
    url: 'http://localhost:5173/profile',
    field: 'email',
    bugType: 'Email Format Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi email invalid di Change Email dialog',
    actualBehavior: 'Muncul error email validation ✓',
    expectedBehavior: 'Error format email tampil',
    recommendation: '-',
    screenshotFile: 'FE-PROF-04-change-email-invalid.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-08',
    component: 'ChangePasswordDialog',
    url: 'http://localhost:5173/profile',
    field: 'password',
    bugType: 'Password Strength Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi password "weak" di Change Password dialog',
    actualBehavior: 'Muncul error kekuatan password ✓',
    expectedBehavior: 'Error password strength tampil',
    recommendation: '-',
    screenshotFile: 'FE-PROF-05-weak-password.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-09',
    component: 'ChangePasswordDialog',
    url: 'http://localhost:5173/profile',
    field: 'confirmPassword',
    bugType: 'Password Confirmation Match',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi password berbeda di Change Password dialog',
    actualBehavior: 'Muncul error "Confirm Password does not match" ✓',
    expectedBehavior: 'Error mismatch tampil',
    recommendation: '-',
    screenshotFile: 'FE-PROF-06-password-mismatch.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-10',
    component: 'CreateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'email',
    bugType: 'Email Format Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi email invalid di Create User dialog',
    actualBehavior: 'Muncul error email format ✓',
    expectedBehavior: 'Error email format tampil',
    recommendation: '-',
    screenshotFile: 'FE-USER-02-invalid-email.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-11',
    component: 'CreateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'password',
    bugType: 'Password Strength Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi password lemah di Create User dialog',
    actualBehavior: 'Muncul error password strength ✓',
    expectedBehavior: 'Error kekuatan password tampil',
    recommendation: '-',
    screenshotFile: 'FE-USER-03-weak-password.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'FE-PASS-12',
    component: 'CreateUserDialog',
    url: 'http://localhost:5173/admin/users',
    field: 'confirmPassword',
    bugType: 'Password Match Validation',
    severity: 'INFO',
    status: 'PASS',
    backendAlignmentIssue: '-',
    stepsToReproduce: 'Isi password berbeda di Create User dialog',
    actualBehavior: 'Muncul error password mismatch ✓',
    expectedBehavior: 'Error mismatch tampil',
    recommendation: '-',
    screenshotFile: 'FE-USER-04-password-mismatch.png',
    testedBy: 'Playwright Automation',
    testDate: new Date().toISOString().split('T')[0],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Excel generation
// ─────────────────────────────────────────────────────────────────────────────

async function generateReport() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'QA Automation — Playwright'
  workbook.created = new Date()

  const today = new Date().toISOString().split('T')[0]

  // ── Colors & Styles ──────────────────────────────────────────────────────────
  const colors = {
    CRITICAL: { bg: 'FF0000', font: 'FFFFFF' },
    HIGH:     { bg: 'FF6600', font: 'FFFFFF' },
    MEDIUM:   { bg: 'FFAA00', font: '000000' },
    LOW:      { bg: 'FFD700', font: '000000' },
    INFO:     { bg: '4472C4', font: 'FFFFFF' },
    PASS:     { bg: '70AD47', font: 'FFFFFF' },
    FAIL:     { bg: 'C00000', font: 'FFFFFF' },
    header:   { bg: '1F3864', font: 'FFFFFF' },
  }

  const headerFont = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  const bodyFont = { name: 'Calibri', size: 10 }

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 1: Summary Dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('📊 Summary', {
    properties: { tabColor: { argb: 'FF1F3864' } },
    views: [{ showGridLines: false }],
  })

  summarySheet.mergeCells('A1:F1')
  const titleCell = summarySheet.getCell('A1')
  titleCell.value = '🔍 QA Frontend Form Validation Report — ShifdLabs Approval System'
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1F3864' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  summarySheet.getRow(1).height = 35

  summarySheet.mergeCells('A2:F2')
  const dateCell = summarySheet.getCell('A2')
  dateCell.value = `Test Date: ${today}  |  Frontend: http://localhost:5173  |  Backend: http://localhost:8081`
  dateCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF555555' } }
  dateCell.alignment = { horizontal: 'center' }

  // Stats
  const bugs = bugData.filter(b => b.status === 'FAIL')
  const passes = bugData.filter(b => b.status === 'PASS')
  const statData = [
    ['Metric', 'Count', 'Percentage'],
    ['Total Test Cases', bugData.length, '100%'],
    ['PASS', passes.length, `${Math.round(passes.length / bugData.length * 100)}%`],
    ['FAIL (Bugs Found)', bugs.length, `${Math.round(bugs.length / bugData.length * 100)}%`],
    ['', '', ''],
    ['Severity Breakdown', '', ''],
    ['🔴 CRITICAL', bugs.filter(b => b.severity === 'CRITICAL').length, ''],
    ['🟠 HIGH', bugs.filter(b => b.severity === 'HIGH').length, ''],
    ['🟡 MEDIUM', bugs.filter(b => b.severity === 'MEDIUM').length, ''],
    ['🟢 LOW', bugs.filter(b => b.severity === 'LOW').length, ''],
  ]

  statData.forEach((row, idx) => {
    const r = summarySheet.addRow(row)
    r.getCell(1).font = { name: 'Calibri', size: 10, bold: idx === 0 || idx === 5 }
    r.getCell(2).font = { name: 'Calibri', size: 10 }
    r.getCell(3).font = { name: 'Calibri', size: 10 }

    if (idx === 0) {
      r.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
        cell.font = { ...headerFont }
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } }
      })
    }
    if (row[0] === '🔴 CRITICAL') r.getCell(2).font = { bold: true, color: { argb: 'FFFF0000' }, size: 10 }
    if (row[0] === '🟠 HIGH') r.getCell(2).font = { bold: true, color: { argb: 'FFFF6600' }, size: 10 }
    if (row[0] === '🟡 MEDIUM') r.getCell(2).font = { bold: true, color: { argb: 'FFFFAA00' }, size: 10 }
  })

  summarySheet.getColumn('A').width = 35
  summarySheet.getColumn('B').width = 15
  summarySheet.getColumn('C').width = 15

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 2: Bug Report (Main)
  // ─────────────────────────────────────────────────────────────────────────────
  const bugSheet = workbook.addWorksheet('🐛 Bug Report', {
    properties: { tabColor: { argb: 'FFC00000' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  const headers = [
    'Bug ID', 'Component', 'URL', 'Field', 'Bug Type',
    'Severity', 'Status', 'Backend Alignment Issue',
    'Steps to Reproduce', 'Actual Behavior',
    'Expected Behavior', 'Recommendation',
    'Screenshot', 'Tested By', 'Date',
  ]

  const headerRow = bugSheet.addRow(headers)
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
    cell.font = { ...headerFont }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    }
  })
  headerRow.height = 30

  // Sort: bugs first (by severity), then passes
  const sortOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 }
  const sorted = [
    ...bugData.filter(b => b.status === 'FAIL').sort((a, b) => (sortOrder[a.severity] || 9) - (sortOrder[b.severity] || 9)),
    ...bugData.filter(b => b.status === 'PASS'),
  ]

  sorted.forEach((bug, idx) => {
    const row = bugSheet.addRow([
      bug.id, bug.component, bug.url, bug.field, bug.bugType,
      bug.severity, bug.status, bug.backendAlignmentIssue,
      bug.stepsToReproduce, bug.actualBehavior,
      bug.expectedBehavior, bug.recommendation,
      bug.screenshotFile, bug.testedBy, bug.testDate,
    ])

    const isEven = idx % 2 === 0
    const baseBg = isEven ? 'FFF2F2F2' : 'FFFFFFFF'

    row.eachCell((cell, colNum) => {
      cell.font = { ...bodyFont }
      cell.alignment = { wrapText: true, vertical: 'top' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseBg } }
      cell.border = {
        left: { style: 'hair', color: { argb: 'FFCCCCCC' } },
        right: { style: 'hair', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } },
      }
    })

    // Severity color
    const sevCell = row.getCell(6)
    const sc = colors[bug.severity] || colors.INFO
    sevCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + sc.bg } }
    sevCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + sc.font } }
    sevCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Status color
    const stCell = row.getCell(7)
    const stc = bug.status === 'PASS' ? colors.PASS : colors.FAIL
    stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + stc.bg } }
    stCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + stc.font } }
    stCell.alignment = { horizontal: 'center', vertical: 'middle' }

    row.height = 60
  })

  // Column widths
  const colWidths = [12, 25, 35, 20, 35, 12, 10, 45, 45, 45, 45, 45, 30, 25, 12]
  colWidths.forEach((w, i) => {
    bugSheet.getColumn(i + 1).width = w
  })

  // Autofilter
  bugSheet.autoFilter = `A1:O${sorted.length + 1}`

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 3: Critical & High Bugs Only
  // ─────────────────────────────────────────────────────────────────────────────
  const critSheet = workbook.addWorksheet('🚨 Critical & High', {
    properties: { tabColor: { argb: 'FFFF0000' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  const critHeaders = ['Bug ID', 'Component', 'URL', 'Field', 'Bug Type', 'Severity', 'Steps to Reproduce', 'Recommendation']
  const critHeaderRow = critSheet.addRow(critHeaders)
  critHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7F0000' } }
    cell.font = { ...headerFont }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  critHeaderRow.height = 28

  bugData
    .filter(b => b.status === 'FAIL' && (b.severity === 'CRITICAL' || b.severity === 'HIGH'))
    .sort((a, b) => (sortOrder[a.severity] || 9) - (sortOrder[b.severity] || 9))
    .forEach((bug, idx) => {
      const row = critSheet.addRow([
        bug.id, bug.component, bug.url, bug.field, bug.bugType, bug.severity, bug.stepsToReproduce, bug.recommendation,
      ])
      const sc = colors[bug.severity]
      row.eachCell(cell => {
        cell.font = { ...bodyFont }
        cell.alignment = { wrapText: true, vertical: 'top' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFF2F2' : 'FFFFFFFF' } }
      })
      row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + sc.bg } }
      row.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + sc.font } }
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }
      row.height = 70
    })

  const cColWidths = [12, 25, 38, 20, 38, 12, 50, 50]
  cColWidths.forEach((w, i) => critSheet.getColumn(i + 1).width = w)

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 4: Backend Alignment Issues
  // ─────────────────────────────────────────────────────────────────────────────
  const beSheet = workbook.addWorksheet('🔗 Backend Alignment', {
    properties: { tabColor: { argb: 'FF0070C0' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  const beHeaders = ['Bug ID', 'Component', 'Field', 'Bug Type', 'Backend Bug Ref', 'Backend Alignment Issue', 'Recommendation']
  const beHeaderRow = beSheet.addRow(beHeaders)
  beHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } }
    cell.font = { ...headerFont }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  beHeaderRow.height = 28

  bugData
    .filter(b => b.status === 'FAIL' && b.backendAlignmentIssue !== '-' && b.backendAlignmentIssue.length > 5)
    .forEach((bug, idx) => {
      // Extract backend bug ref
      const match = bug.backendAlignmentIssue.match(/BUG-\d+/g)
      const beRef = match ? match.join(', ') : 'N/A'
      const row = beSheet.addRow([
        bug.id, bug.component, bug.field, bug.bugType, beRef, bug.backendAlignmentIssue, bug.recommendation,
      ])
      row.eachCell(cell => {
        cell.font = { ...bodyFont }
        cell.alignment = { wrapText: true, vertical: 'top' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFF0F7FF' : 'FFFFFFFF' } }
      })
      row.height = 70
    })

  const bColWidths = [12, 25, 20, 35, 15, 55, 50]
  bColWidths.forEach((w, i) => beSheet.getColumn(i + 1).width = w)

  // ─────────────────────────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────────────────────────
  const outputDir = path.join(__dirname, '..')
  const filename = `laporan_qa_frontend_${today}.xlsx`
  const outputPath = path.join(outputDir, filename)

  await workbook.xlsx.writeFile(outputPath)

  console.log('\n' + '='.repeat(60))
  console.log('✅ QA Excel Report Generated Successfully!')
  console.log('='.repeat(60))
  console.log(`📄 File: ${outputPath}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total test items   : ${bugData.length}`)
  console.log(`   ✅ PASS            : ${bugData.filter(b => b.status === 'PASS').length}`)
  console.log(`   🐛 BUGS Found      : ${bugData.filter(b => b.status === 'FAIL').length}`)
  console.log(`   🔴 CRITICAL        : ${bugData.filter(b => b.severity === 'CRITICAL' && b.status === 'FAIL').length}`)
  console.log(`   🟠 HIGH            : ${bugData.filter(b => b.severity === 'HIGH' && b.status === 'FAIL').length}`)
  console.log(`   🟡 MEDIUM          : ${bugData.filter(b => b.severity === 'MEDIUM' && b.status === 'FAIL').length}`)
  console.log(`   🟢 LOW             : ${bugData.filter(b => b.severity === 'LOW' && b.status === 'FAIL').length}`)
  console.log('='.repeat(60) + '\n')
}

generateReport().catch(err => {
  console.error('Error generating report:', err.message)
  process.exit(1)
})
