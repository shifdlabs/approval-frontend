# ShifdLabs Approval Frontend — CLAUDE.md

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **UI Library**: Vuetify 3.7.5
- **Router**: `unplugin-vue-router` (file-based routing)
- **HTTP**: `useApi` composable (wraps `ofetch`)
- **Auth**: Cookie-based (`accessToken`), guard di `src/plugins/1.router/index.ts`
- **State**: `ref` / `reactive` (Composition API)
- **Testing**: Playwright (62 tests, semua PASS)
- **Auto-imports**: `unplugin-auto-import` — validator dan composable tersedia global tanpa import manual

---

## Arsitektur Project

```
src/
  pages/              → Route otomatis dari nama file (unplugin-vue-router)
  components/dialogs/ → Dialog form (Create/Update/Change*)
  controllers/        → Logic non-UI (binding data, API call)
  @core/utils/        → validators.ts — semua validator form
  plugins/1.router/   → Auth guard (beforeEach)
  models/             → TypeScript interface
tests/e2e/            → Playwright test files
```

### Penting: Konvensi Routing File-Based

`unplugin-vue-router` mengkonversi **titik (.) dalam nama file menjadi slash (/) di path**:

| File | Route yang dihasilkan |
|------|----------------------|
| `src/pages/admin/document.numbers.vue` | `/admin/document/numbers` |
| `src/pages/admin/app.log.vue` | `/admin/app/log` |

Jangan gunakan titik di nama file kecuali memang ingin membuat nested route.

---

## Aturan Penting saat Mengerjakan Kode Ini

### 1. Validasi Form — Pola Wajib

Semua dialog form menggunakan pola ini:

```vue
<VForm ref="refVForm" @submit.prevent="onFormSubmit">
  <AppTextField
    v-model="fieldName"
    :rules="[requiredValidator, maxLengthValidator(100)]"
  />
  <VBtn type="submit">Submit</VBtn>
</VForm>
```

```ts
const onFormSubmit = async () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) callApi()
    else isAllInputtedValid.value = false
  })
}
```

**Jangan pernah memanggil API langsung dari tombol tanpa melewati VForm validate.**

### 2. Dialog Hanya Menutup saat Sukses

```ts
// SALAH — dialog menutup meski API error
const { data, error } = await useApi(...)
emit('update:isDialogVisible', false)  // ← unconditional close

// BENAR
if (data.value?.success) {
  emit('update:isDialogVisible', false)
} else {
  isAllInputtedValid.value = false      // tampilkan error di dalam dialog
}
```

### 3. Validator yang Tersedia (auto-import dari `validators.ts`)

| Validator | Kegunaan |
|-----------|----------|
| `requiredValidator` | Field wajib diisi |
| `emailValidator` | Format email valid |
| `passwordValidator` | Min 8, harus ada uppercase + lowercase + digit + special char |
| `confirmedValidator` | Confirm password harus sama |
| `phoneValidator` | Format nomor telepon (opsional — pakai bersama requiredValidator) |
| `maxLengthValidator(n)` | Panjang string maksimal n karakter |

### 4. Input Type untuk Nomor Telepon

```vue
<!-- SALAH — memblok karakter + dan non-digit -->
<AppTextField type="number" v-model="phone" />

<!-- BENAR — mengizinkan +62 dan format internasional -->
<AppTextField type="tel" v-model="phone" />
```

### 5. Route Guard — Path yang Dilindungi

File: `src/plugins/1.router/index.ts`

Protected routes: `/admin/*`, `/reguler/*`, `/document/*`, `/profile`, `/preview/*`

Jika menambah halaman baru yang butuh auth, pastikan pathnya tercakup di guard.

---

## Bug yang Sudah Diperbaiki (Juni 2026)

### CRITICAL

| ID | Komponen | Fix |
|----|----------|-----|
| FE-BUG-13 | `login-controller.ts` | Hardcoded credentials dihapus — `credentials.ref` dimulai dengan `email: '', password: ''` |
| FE-BUG-14 | `src/plugins/1.router/index.ts` | `/document`, `/profile`, `/preview` sudah masuk route guard |

### HIGH

| ID | Komponen | Fix |
|----|----------|-----|
| FE-BUG-06 | `CreatePublicationFormatDialog.vue` | VForm sudah membungkus field utama, tombol terhubung ke `onFormSubmit`, semua field punya `:rules` |
| FE-BUG-08 | `UpdateUserDialog.vue`, `CreateUserDialog.vue` | emit close hanya di blok success |
| FE-BUG-09 | `ChangeEmailDialog.vue`, `UpdateBiodataDialog.vue` | emit close hanya di blok success |

### MEDIUM

| ID | Komponen | Fix |
|----|----------|-----|
| FE-BUG-01 | `CreateUserDialog.vue`, `UpdateUserDialog.vue` | `maxLengthValidator(100)` ditambah pada firstName dan lastName |
| FE-BUG-02 | `document/create.vue` | `maxLengthValidator(200)` pada Subject |
| FE-BUG-03 | Dialog user | `type="number"` → `type="tel"` pada field phone |
| FE-BUG-05 | `document/create.vue` | `externalRecipient` pakai rules kondisional berdasarkan tipe dokumen |
| FE-BUG-10 | `validators.ts` | `passwordValidator` regex diperluas ke semua special chars ASCII |

### LOW

| ID | Komponen | Fix |
|----|----------|-----|
| FE-BUG-12 | `document/create.vue` | Asterisk dihapus dari label "Reference" |

---

## Bug Masih Terbuka

| ID | Komponen | Keterangan | Severity |
|----|----------|------------|----------|
| FE-BUG-A | `CreatePublicationFormatDialog.vue` | `createNewPublicationFormat` masih menutup dialog di blok `else` dan `catch` — harus `isAllInputtedValid.value = false` | HIGH |
| FE-BUG-B | `CreatePublicationFormatDialog.vue` | Tombol "Add" di Format Cell Builder tidak memanggil `refVForm.validate()` sebelum push | HIGH |
| FE-BUG-C | `document/create.vue` — `externalRecipient` | Field email tapi tidak ada `emailValidator` di rules | MEDIUM |
| FE-BUG-04 | `CreateUserDialog.vue` — `positionId` | Perlu konfirmasi product: apakah posisi wajib atau opsional? | MEDIUM |

### Detail Fix FE-BUG-A

File: `src/components/dialogs/CreatePublicationFormatDialog.vue`

Cari fungsi `createNewPublicationFormat`, di bagian `else` dan `catch`:

```ts
// SEKARANG — SALAH
} else {
  emit('update:isDialogVisible', false)
}
} catch (e) {
  emit('update:isDialogVisible', false)
}

// HARUS JADI
} else {
  isAllInputtedValid.value = false
}
} catch (e) {
  isAllInputtedValid.value = false
}
```

### Detail Fix FE-BUG-B

File: `src/components/dialogs/CreatePublicationFormatDialog.vue`

Fungsi `onCellFormSubmitted` harus validasi dulu:

```ts
const onCellFormSubmitted = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return
    var type = cellTypes.value.find((item) => item.key === cellFormatKey.value)
    cellFormats.value.push({
      name: type?.name || '',
      key: type?.key || '',
      short: type?.short || '',
      originalValue: type?.name == FormatCellType.Static.name ? cellFormatValue.value : type?.description || '',
      description: type?.description || '',
    })
    isInputFormatCellFormActive.value = false
  })
}
```

Dan di template, `VForm` harus `@submit.prevent` + tombol "Add" pakai `type="submit"`:

```vue
<VForm ref="refVForm" v-model="isCellFromValid" @submit.prevent="onCellFormSubmitted">
  ...
  <VBtn color="primary" type="submit">Add</VBtn>
</VForm>
```

### Detail Fix FE-BUG-C

File: `src/pages/document/create.vue`

Cari baris `externalRecipient` yang punya `:rules`, tambahkan `emailValidator`:

```vue
<!-- SEBELUM -->
:rules="isExternalRecipientsEnable ? [requiredValidator, maxLengthValidator(500)] : []"

<!-- SESUDAH -->
:rules="isExternalRecipientsEnable ? [requiredValidator, emailValidator, maxLengthValidator(500)] : []"
```

---

## QA Test Status (Playwright)

Jalankan: `pnpm exec playwright test`

Auth state: `tests/e2e/.auth/` (gitignored). Jalankan ulang jika token expired.

---

## Status Backend (Juni 2026 — Sudah Selesai)

Backend sudah diperbaiki, tidak perlu action dari FE:

| Yang Sudah Difix di Backend | Dampak |
|---|---|
| `ValidateStruct` aktif di semua controller | Server reject body kosong/invalid dengan `400` |
| DTO: `uuid`, `email`, `oneof`, `min/max` di semua field | Validasi server-side konsisten dengan FE |
| Log audit hanya ditulis setelah operasi sukses | Tidak ada false-positive di log |
