<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# UIS Health Lab

Frontend React untuk sistem peminjaman alat laboratorium. Backend Django dijalankan dari folder `backend`.

## Menjalankan seluruh project

Dari root project, buka PowerShell dan jalankan:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\run-dev.ps1
```

Script akan:

1. Memastikan Node.js, npm, dan Python tersedia.
2. Menginstal dependency backend jika import package gagal.
3. Menjalankan `npm install` jika `frontend/node_modules` belum ada.
4. Memeriksa konfigurasi Django dan koneksi MySQL.
5. Menjalankan backend di `http://127.0.0.1:8000`.
6. Menjalankan frontend di `http://localhost:3000`.

Migration tidak dijalankan otomatis untuk mencegah perubahan schema database tanpa sengaja. Jika database memang membutuhkan migration, jalankan:

```powershell
.\run-dev.ps1 -ApplyMigrations
```

## Menjalankan manual

Terminal backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py check --database default
python manage.py runserver 127.0.0.1:8000
```

Terminal frontend:

```powershell
cd frontend
npm install
npm run dev
```

Pastikan `backend/.env` tersedia dan berisi konfigurasi database MySQL. Jangan commit file `.env` karena berisi kredensial.
