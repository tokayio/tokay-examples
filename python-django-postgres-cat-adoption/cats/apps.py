import sys
import threading
from pathlib import Path

from django.apps import AppConfig


class CatsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "cats"

    def ready(self):
        executable = Path(sys.argv[0]).name
        if "gunicorn" not in executable and "runserver" not in sys.argv:
            return
        from .seed import seed_with_retry

        threading.Thread(target=seed_with_retry, name="cat-seed", daemon=True).start()
