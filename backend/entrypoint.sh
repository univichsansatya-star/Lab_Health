#!/bin/sh
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  python manage.py shell -c "
from accounts.models import User

email = __import__('os').environ.get('DJANGO_SUPERUSER_EMAIL')
nim = __import__('os').environ.get('DJANGO_SUPERUSER_NIM_NIP', 'ADMIN001')
pw = __import__('os').environ['DJANGO_SUPERUSER_PASSWORD']

if not User.objects.filter(email=email).exists():
    u = User()
    u.email = email
    u.nim_nip = nim
    u.name = __import__('os').environ.get('DJANGO_SUPERUSER_NAME', 'Administrator')
    u.department = __import__('os').environ.get('DJANGO_SUPERUSER_DEPARTMENT', 'Laboratorium')
    u.phone = __import__('os').environ.get('DJANGO_SUPERUSER_PHONE', '-')
    u.role = User.Role.ADMIN
    u.is_staff = True
    u.is_superuser = True
    u.set_password(pw)
    u.save()
    print('Superuser ready.')
else:
    print('Superuser already exists.')
"
else
  echo "DJANGO_SUPERUSER_EMAIL/PASSWORD not set; skipping superuser bootstrap."
fi

echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120 --access-logfile -