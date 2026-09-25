import csv
import secrets

from django.core.management.base import BaseCommand

from accounts.models import User
from documents.models import LabDocument
from equipment.models import Equipment


CONSUMABLE_NAMES = (
    "handscoen",
    "handscoon",
    "sarung tangan",
    "kapas",
    "kasa",
    "alkohol",
    "masker bedah",
    "spuit",
    "abocath",
    "infus set",
    "plester",
    "cateter",
)


def _load_tsv(path):
    if not path:
        return []
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))


def _to_int(value, default=0):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def _infer_equipment(name, code):
    upper = f"{code.upper()} {name.upper()}"
    consumable = "BHP" in code.upper() or any(k in name.lower() for k in CONSUMABLE_NAMES)
    if consumable:
        return Equipment.Category.PHARMA, True
    if "MIKROSKOP" in upper or "MICROSCOPE" in upper:
        return Equipment.Category.DIAGNOSTIC, False
    return Equipment.Category.NURSING, False


class Command(BaseCommand):
    help = "Import legacy data (users, equipment, SOP documents) from phpMyAdmin TSV exports."

    def add_arguments(self, parser):
        parser.add_argument("--users", default="", help="TSV: id,nama,username,password,kelas")
        parser.add_argument("--barang", default="", help="TSV: id,nama_barang,gambar_barang,stok_barang,kd_lokasi")
        parser.add_argument("--lokasi", default="", help="TSV: kd_lokasi,nama_lokasi")
        parser.add_argument("--tilik", default="", help="TSV: id_tilik,file")
        parser.add_argument("--passwords-out", default="", help="File target daftar password sementara")
        parser.add_argument("--dry-run", action="store_true", help="Validasi tanpa menulis ke database")

    def handle(self, *args, **options):
        users_rows = _load_tsv(options["users"])
        barang_rows = _load_tsv(options["barang"])
        lokasi_rows = _load_tsv(options["lokasi"])
        tilik_rows = _load_tsv(options["tilik"])
        dry_run = options["dry_run"]

        lokasi_map = {
            str(r.get("kd_lokasi", "")).strip(): str(r.get("nama_lokasi", "")).strip()
            for r in lokasi_rows
        }

        stats = {"users": 0, "users_skip": 0, "equipment": 0, "equipment_skip": 0, "docs": 0, "docs_skip": 0}
        passwords = []

        if users_rows:
            for row in users_rows:
                email = str(row.get("username", "")).strip().lower()
                name = str(row.get("nama", "")).strip()
                old_id = str(row.get("id", "")).strip()
                kelas = str(row.get("kelas", "")).strip()
                if not email or not name:
                    stats["users_skip"] += 1
                    continue
                if User.objects.filter(email=email).exists():
                    stats["users_skip"] += 1
                    continue
                is_admin = email == "admin@labstikes" or old_id == "1"
                temp_password = secrets.token_urlsafe(12)
                if dry_run:
                    stats["users"] += 1
                    passwords.append((email, name, temp_password))
                    continue
                user = User(
                    email=email,
                    name=name,
                    nim_nip=f"LEGACY-{old_id or email}",
                    role=User.Role.ADMIN if is_admin else User.Role.NURSE_STAFF,
                    department=kelas,
                    phone="",
                    is_active=True,
                    is_staff=is_admin,
                    status=User.Status.ACTIVE,
                )
                user.set_password(temp_password)
                user.save()
                stats["users"] += 1
                passwords.append((user.email, user.name, temp_password))

        if barang_rows:
            for row in barang_rows:
                code = str(row.get("id", "")).strip()
                name = str(row.get("nama_barang", "")).strip()
                if not code or not name:
                    stats["equipment_skip"] += 1
                    continue
                if Equipment.objects.filter(code=code).exists():
                    stats["equipment_skip"] += 1
                    continue
                kd_lokasi = str(row.get("kd_lokasi", "")).strip()
                location = lokasi_map.get(kd_lokasi, kd_lokasi) or "Tidak Diketahui"
                qty = _to_int(row.get("stok_barang"), 1)
                category, consumable = _infer_equipment(name, code)
                if dry_run:
                    stats["equipment"] += 1
                    continue
                Equipment.objects.create(
                    code=code,
                    name=name,
                    category=category,
                    brand="",
                    model="",
                    description="",
                    total_quantity=qty,
                    available_quantity=qty,
                    borrowed_quantity=0,
                    maintenance_quantity=0,
                    condition=Equipment.Condition.GOOD,
                    location=location,
                    image_url="",
                    specifications=[],
                    usage_guidelines=[],
                    is_consumable=consumable,
                    requires_special_approval=False,
                    qr_code="",
                )
                stats["equipment"] += 1

        if tilik_rows:
            for row in tilik_rows:
                file_name = str(row.get("file", "")).strip()
                if not file_name:
                    stats["docs_skip"] += 1
                    continue
                stem = file_name.rsplit(".", 1)[0].strip().rstrip("()")
                if dry_run:
                    stats["docs"] += 1
                    continue
                LabDocument.objects.create(
                    title=stem,
                    file_name=file_name,
                    document_type=LabDocument.DocumentType.SOP,
                    description="",
                )
                stats["docs"] += 1

        if not dry_run and options["passwords_out"] and passwords:
            with open(options["passwords_out"], "w", encoding="utf-8", newline="") as fh:
                writer = csv.writer(fh)
                writer.writerow(["email", "nama", "password_sementara"])
                writer.writerows(passwords)
            self.stdout.write(self.style.SUCCESS(f"Password sementara ditulis ke {options['passwords_out']}"))

        self.stdout.write(self.style.SUCCESS(
            f"users={stats['users']} (skip {stats['users_skip']}), "
            f"equipment={stats['equipment']} (skip {stats['equipment_skip']}), "
            f"documents={stats['docs']} (skip {stats['docs_skip']})"
        ))