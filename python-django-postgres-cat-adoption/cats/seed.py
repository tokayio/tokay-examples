import os
import time

from django.contrib.auth import get_user_model
from django.db import OperationalError, ProgrammingError

from .models import Cat

CATS = [
    ("Ada", 3, "Curious, composed, and fond of high shelves", "library", "available", "Ada likes a slow introduction and settles beside quiet readers."),
    ("Biscuit", 6, "Warm, chatty, and very food motivated", "sunroom", "available", "Biscuit greets familiar people with a small chirp."),
    ("Clover", 2, "Playful, quick, and confident", "garden", "pending", "Clover would enjoy a home with room for an evening chase."),
    ("Dashi", 8, "Gentle, observant, and unhurried", "quiet", "available", "Dashi prefers soft voices and a dependable windowsill."),
    ("Etta", 4, "Social, tidy, and interested in everything", "sunroom", "adopted", "Etta is preparing to leave for her new home."),
    ("Fig", 1, "Bold, bouncy, and always carrying a toy", "garden", "available", "Fig still has kitten energy and learns quickly."),
    ("Gus", 10, "Patient, affectionate, and excellent company", "library", "available", "Gus is happiest close to someone working at a desk."),
    ("Hazel", 5, "Independent, calm, and softly affectionate", "quiet", "pending", "Hazel chooses her people carefully and then stays close."),
    ("Iris", 7, "Friendly, adaptable, and fond of brushing", "sunroom", "available", "Iris has lived with another calm cat."),
    ("Juniper", 2, "Athletic, alert, and eager to play", "garden", "available", "Juniper turns cardboard into an obstacle course."),
    ("Kumo", 9, "Quiet, steady, and happiest near a blanket", "quiet", "available", "Kumo needs daily medicine hidden in a favorite treat."),
    ("Linden", 4, "Tender, shy at first, and deeply loyal", "library", "available", "Linden comes forward when the room becomes still."),
    ("Mabel", 11, "Dignified, sweet, and clear about supper", "sunroom", "adopted", "Mabel found a sunny retirement home."),
    ("Nori", 3, "Bright, busy, and fascinated by water", "garden", "available", "Nori likes puzzle feeders and a sturdy scratching post."),
    ("Olive", 6, "Easygoing, affectionate, and quietly comic", "library", "available", "Olive is an experienced lap cat."),
    ("Pip", 1, "Small, brave, and ready for a patient teacher", "garden", "pending", "Pip is learning that hands bring good things."),
    ("Quincy", 5, "Polite, thoughtful, and devoted to routine", "quiet", "available", "Quincy enjoys one person conversations."),
    ("Romy", 4, "Confident, expressive, and always nearby", "sunroom", "available", "Romy wants to supervise the household."),
    ("Sable", 8, "Soft spoken, affectionate, and settled", "library", "available", "Sable would suit a calm home beautifully."),
    ("Tansy", 2, "Cheerful, nimble, and generous with head bumps", "garden", "available", "Tansy is ready for play and company."),
]


def seed_once():
    for name, age, temperament, room, status, note in CATS:
        Cat.objects.update_or_create(
            name=name,
            defaults={"age": age, "temperament": temperament, "room": room, "status": status, "note": note},
        )

    # The admin is opt in. No password is generated or printed.
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if admin_password:
        user, _created = get_user_model().objects.update_or_create(
            username="shelter-admin",
            defaults={"email": "admin@example.test", "is_staff": True, "is_superuser": True},
        )
        user.set_password(admin_password)
        user.save(update_fields=["password"])


def seed_with_retry():
    delay = 1
    for attempt in range(8):
        try:
            seed_once()
            return
        except (OperationalError, ProgrammingError):
            if attempt == 7:
                return
            time.sleep(delay)
            delay = min(delay * 2, 8)
