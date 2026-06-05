# Prompt untuk Backend Claude Code Session

Salin teks di bawah ini ke sesi Claude Code di repo backend:

---

## PROMPT YANG BISA LANGSUNG DI-PASTE

```
Saya baru selesai melakukan QA lengkap pada frontend (Vue 3 + Vuetify).
Ditemukan beberapa bug yang sudah diperbaiki di FE, namun memerlukan fix di backend juga agar validasi konsisten.

Konteks backend: Go 1.24 + Gin + GORM + go-playground/validator/v10

## Masalah yang ditemukan dari QA Frontend

### 1. helper.ValidateStruct tidak pernah dipanggil (PALING KRITIS)
File: semua controller
Masalah: ShouldBindJSON hanya parsing JSON. Tag `validate:` pada struct tidak otomatis dijalankan.
Akibat: Data invalid (email salah format, field kosong, role invalid) lolos ke service layer.

Fix yang harus diterapkan di SETIAP endpoint POST/PUT:
  if errs := helper.ValidateStruct(payload); len(errs) > 0 {
    utils.ErrorResponse(ctx, helper.ErrorModel{Code: 400, Message: "Bad Request"})
    return
  }

### 2. Missing `return` setelah utils.ErrorResponse (menyebabkan panic)
File: auth.controller.go, user.controller.go, document.controller.go, dan 7 controller lain
Masalah: Eksekusi berlanjut setelah error response dikirim → nil dereference → server panic.

Pola yang salah:
  if err != nil {
    utils.ErrorResponse(ctx, ...)   // response dikirim
  }
  service.DoSomething(payload)      // ← PANIC jika payload nil

Pola yang benar:
  if err != nil {
    utils.ErrorResponse(ctx, ...)
    return   // ← WAJIB
  }

### 3. Validasi DTO yang tidak konsisten dengan frontend

Frontend sudah memvalidasi:
- Email: format email valid (bukan hanya `required`)
- Password: min 8 karakter
- Role: hanya boleh 1 (user) atau 99 (admin)
- Phone: min 5, max 20 karakter
- FirstName/LastName: required, max 100 karakter
- Document type: oneof=1 2
- Document priority: oneof=1 2 3
- Document state (authorize): oneof=1 2 3

Backend perlu sinkron dengan menambahkan tag validate yang sesuai di semua DTO.

File-file yang perlu dicek:
- data/request/User/create.user.request.go
- data/request/User/update.user.request.go
- data/request/User/update.biodata.request.go
- data/request/User/update.password.go
- data/request/Document/create.document.request.go
- data/request/Document/update.document.request.go
- data/request/Document/authorize.document.request.go

### 4. Temuan langsung dari QA: PUT /user/biodata menerima firstName kosong
Endpoint PUT /user/biodata menerima dan menyimpan firstName: "" (string kosong).
Fix: tambah `validate:"required,min=1,max=100"` pada field FirstName dan LastName di update.biodata.request.go

### 5. Error code yang salah di service layer
File: service/User/user.service.impl.go
Masalah: Validation error mengembalikan HTTP 500, seharusnya 400.
Fix: Ganti semua ErrorCatcher(errStructure, 500, ...) → ErrorCatcher(errStructure, 400, ...)

### 6. Nil pointer dereference di document.controller.go fungsi Update
Masalah: document.ID diakses sebelum `if err != nil` dicek.
Fix: Periksa err langsung setelah documentService.Update(), SEBELUM menggunakan document.

### 7. Password hardcoded di BulkImport
File: service/User/user.service.impl.go, fungsi BulkImport
Masalah: Default password "password123" hardcoded di source code.
Fix: Ganti dengan generateRandomPassword() menggunakan crypto/rand.

## Urutan Pekerjaan yang Disarankan

1. Aktifkan helper.ValidateStruct di semua controller (paling berdampak)
2. Tambah return setelah semua utils.ErrorResponse
3. Fix nil pointer di document.controller.go Update
4. Update semua tag validate di DTO agar sinkron dengan FE
5. Fix error code 500 → 400 untuk validation error di service
6. Ganti hardcoded password di BulkImport

## Checklist untuk setiap PR baru

- [ ] helper.ValidateStruct dipanggil setelah ShouldBindJSON
- [ ] Setiap utils.ErrorResponse diikuti return
- [ ] Error dari service dicek SEBELUM nilai kembaliannya dipakai
- [ ] Semua field email: validate:"required,email"
- [ ] Semua field UUID: validate:"required,uuid" atau omitempty,uuid
- [ ] Field enum integer pakai validate:"required,oneof=..."
- [ ] Password baru: validate:"required,min=8,max=200"
- [ ] Tidak ada password hardcoded di source code

Tolong mulai dari controller mana yang paling banyak dipakai, lalu lanjutkan ke yang lain.
```

---

## CLAUDE.md untuk Backend (jika belum ada)

Jika backend belum punya CLAUDE.md, buat file ini di root backend repo:

```markdown
# ShifdLabs Approval Backend — CLAUDE.md

## Tech Stack
- Language: Go 1.24
- Framework: Gin v1.10
- Database: PostgreSQL via GORM v1.25
- Auth: JWT (golang-jwt/jwt/v4)
- Validation: go-playground/validator/v10
- Cache: Redis v9
- Password: bcrypt (golang.org/x/crypto)

## Arsitektur
controller/ → HTTP handler, binding JSON, validasi input
service/    → Business logic
repository/ → Query database (GORM)
model/      → Struct database
data/request/  → DTO input
data/response/ → DTO output
helper/     → JWT, error handler, validator
middleware/ → Auth middleware
router/     → Definisi route

## Aturan Wajib

### 1. Selalu return setelah utils.ErrorResponse
if err != nil {
    utils.ErrorResponse(ctx, helper.ErrorModel{Code: 400, Message: "Bad Request"})
    return   // ← WAJIB
}

### 2. Selalu panggil helper.ValidateStruct setelah ShouldBindJSON
if err := ctx.ShouldBindJSON(&payload); err != nil {
    utils.ErrorResponse(ctx, helper.ErrorModel{Code: 400, Message: "Bad Request"})
    return
}
if errs := helper.ValidateStruct(payload); len(errs) > 0 {
    utils.ErrorResponse(ctx, helper.ErrorModel{Code: 400, Message: "Bad Request"})
    return
}

### 3. Cek error SEBELUM pakai nilai kembalian
result, err := service.DoSomething(payload)
if err != nil {          // ← cek dulu
    utils.ErrorResponse(ctx, *err)
    return
}
use(result)              // ← baru pakai

### 4. Tag validasi standar per field
Email:    validate:"required,email"
UUID:     validate:"required,uuid"
Password: validate:"required,min=8,max=200"
Role:     validate:"required,oneof=1 99"
Phone:    validate:"required,min=5,max=20"

### 5. Error code yang benar
Validation error (input salah): 400
Server/internal error (DB, bcrypt): 500

## Sinkronisasi dengan Frontend

Frontend (Vue 3 + Vuetify) memvalidasi:
- firstName/lastName: required, max 100 chars
- email: required, format email
- phone: required, min 5 max 20
- password: required, min 8, max 200
- role: oneof=1 99
- document.type: oneof=1 2
- document.priority: oneof=1 2 3
- document.state (authorize): oneof=1 2 3

Backend HARUS konsisten dengan aturan di atas.
```
