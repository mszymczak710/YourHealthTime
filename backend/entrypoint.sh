#!/bin/sh

cd /code
MANAGE_PY_PATH="/code/manage.py"

# Wait for the database to be ready
printf "Waiting for the database to be ready...\n"
until nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
printf "The database is ready!\n"

# Check if new migrations are needed
python $MANAGE_PY_PATH makemigrations --dry-run --check
NEED_MIGRATIONS=$?

if [ "$NEED_MIGRATIONS" -eq 0 ]; then
    printf "\nNo need to create new migrations."
else
    printf "\nCreating new migrations..."
    python $MANAGE_PY_PATH makemigrations
fi

# Check for available migrations
MIGRATIONS=$(python $MANAGE_PY_PATH showmigrations --list | grep -c "\[ \]")

# If there are available migrations, apply them
if [ "$MIGRATIONS" -gt 0 ]; then
    printf "\nApplying available migrations..."
    python $MANAGE_PY_PATH migrate
else
    printf "\nNo available migrations to apply."
fi

# Load dictionary data
python $MANAGE_PY_PATH load_data

# Creating an administrator
if [ -z "$DJANGO_SUPERUSER_FIRST_NAME" ] || [ -z "$DJANGO_SUPERUSER_LAST_NAME" ] || [ -z "$DJANGO_SUPERUSER_EMAIL" ] || [ -z "$DJANGO_SUPERUSER_PASSWORD" ]; then
    printf "Environment variables for the administrator are not set!\n"
else
    # Check if the administrator already exists
    if echo "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(email='$DJANGO_SUPERUSER_EMAIL').count())" | python $MANAGE_PY_PATH shell | grep -q "0"; then
        printf "Creating an administrator...\n"
        echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='$DJANGO_SUPERUSER_EMAIL', password='$DJANGO_SUPERUSER_PASSWORD', first_name='$DJANGO_SUPERUSER_FIRST_NAME', last_name='$DJANGO_SUPERUSER_LAST_NAME');" | python $MANAGE_PY_PATH shell
        printf "Administrator $DJANGO_SUPERUSER_FIRST_NAME $DJANGO_SUPERUSER_LAST_NAME has been created!\n"
    else
        printf "An administrator with the details: $DJANGO_SUPERUSER_FIRST_NAME $DJANGO_SUPERUSER_LAST_NAME ($DJANGO_SUPERUSER_EMAIL) already exists.\n"
    fi
fi

# Start the server
exec python $MANAGE_PY_PATH runserver 0.0.0.0:8000
