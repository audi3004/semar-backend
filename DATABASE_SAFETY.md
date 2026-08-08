# Database Safety

Server aplikasi tidak menjalankan `sequelize.sync()`, `alter`, atau
`force` ketika startup. Perubahan schema harus dilakukan secara eksplisit
melalui migration setelah backup database dibuat.

## Urutan aman

1. Buat backup database.
2. Pastikan target database pada `.env` sudah benar.
3. Periksa migration yang belum dijalankan:

   ```bash
   npm run db:migrate:status
   ```

4. Jalankan migration:

   ```bash
   npm run db:migrate
   ```

5. Jalankan seeder Super Admin:

   ```bash
   npm run seed:super-admin
   ```

   Atau, untuk menyiapkan seluruh master data mapping Excel, workflow
   approval, module, access module, Admin, serta Super Admin sekaligus:

   ```bash
   npm run seed:initialize
   ```

6. Jalankan aplikasi:

   ```bash
   npm start
   ```

## Super Admin

- Username default: `superadmin`
- Password default: `SuperAdmin123!!`

Nilai tersebut dapat diganti melalui `SUPER_ADMIN_USERNAME` dan
`SUPER_ADMIN_PASSWORD` pada `.env` sebelum seeder dijalankan.

Seeder bersifat idempotent. Menjalankannya kembali akan mengaktifkan akun,
memastikan role `SUPER_ADMIN`, mereset password, dan mencabut refresh token
lama dari akun tersebut.

`seed:initialize` juga bersifat idempotent dan dijalankan dalam satu database
transaction. Seeder tersebut memperbarui record mapping yang sama tanpa
menghapus data lama di luar mapping. Password Admin dan Super Admin akan
diatur ulang sesuai konfigurasi ketika dijalankan kembali.

Segera ganti password default setelah login pertama pada environment yang
dapat diakses pihak lain.

## Mengosongkan data pengujian

Untuk membersihkan seluruh data aplikasi dan langsung mengisinya kembali
hanya dengan dataset mapping, gunakan command berikut dari PowerShell:

```powershell
$env:ALLOW_DATABASE_RESET="true"
$env:RESET_DATABASE_CONFIRM="RESET-MAPPED-DATA"
npm run seed:reset-mapped
Remove-Item Env:ALLOW_DATABASE_RESET
Remove-Item Env:RESET_DATABASE_CONFIRM
```

Command `seed:reset-mapped` menolak berjalan pada `NODE_ENV=production` dan
menjalankan pembersihan serta seeding dalam satu transaction. Struktur tabel
dan riwayat migration pada `SequelizeMeta` tidak dihapus. Jalankan seluruh
migration terlebih dahulu sebelum menggunakan command ini.

Command lama berikut hanya mengosongkan tabel tanpa melakukan seed ulang:

Untuk menghapus seluruh isi tabel aplikasi tanpa menghapus struktur tabel
dan riwayat migration (`SequelizeMeta`), jalankan:

```bash
npm run db:clear
```

Perintah ini bersifat destruktif. Pastikan database pada `.env` benar dan
buat backup apabila datanya masih diperlukan. Setelah itu, master data dapat
dibuat kembali dengan `npm run seed:initialize`.
