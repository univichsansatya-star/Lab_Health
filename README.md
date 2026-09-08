# UIS Health Lab

Project full-stack untuk manajemen inventaris dan peminjaman alat laboratorium.

## Prasyarat

- Windows PowerShell 5.1 atau PowerShell 7+
- Python 3.11 atau lebih baru
- Node.js LTS dan npm
- Akses ke database MySQL yang dikonfigurasi di `backend/.env`

## Menjalankan FE dan BE Bersamaan

Dari folder root project:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\run-dev.ps1
```

Script akan memeriksa command Python/Node/npm, memeriksa package backend, memeriksa `frontend/node_modules`, menjalankan instalasi dependency yang belum tersedia, memeriksa koneksi MySQL Django, lalu menjalankan kedua server.

URL local:

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000/api/
- Django admin: http://127.0.0.1:8000/admin/
- API docs: http://127.0.0.1:8000/api/docs/

Tekan `Ctrl+C` pada terminal script untuk menghentikan FE dan BE.

Jika muncul pesan port sedang digunakan, berarti server sudah berjalan di terminal lain. Gunakan URL yang ditampilkan, atau hentikan process lama terlebih dahulu. Runner menggunakan port frontend `3000` dan backend `8000`.

## Migration Database

Migration tidak dijalankan otomatis karena database MySQL dapat berisi data lama. Jalankan hanya setelah memastikan backup tersedia:

```powershell
.\run-dev.ps1 -ApplyMigrations
```

## Menjalankan Manual

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py check --database default
python manage.py runserver 127.0.0.1:8000
```

Frontend, pada terminal lain:

```powershell
cd frontend
npm install
npm run dev
```

## Environment

Buat `backend/.env` dari `backend/.env.example`, kemudian isi konfigurasi MySQL. Jangan commit `backend/.env` karena berisi kredensial database.
