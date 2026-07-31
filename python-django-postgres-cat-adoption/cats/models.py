from django.db import models


class Cat(models.Model):
    ROOM_CHOICES = [
        ("sunroom", "Sunroom"),
        ("library", "Library"),
        ("garden", "Garden room"),
        ("quiet", "Quiet room"),
    ]
    STATUS_CHOICES = [
        ("available", "Ready to meet"),
        ("pending", "Meeting scheduled"),
        ("adopted", "Heading home"),
    ]

    name = models.CharField(max_length=80, unique=True)
    age = models.PositiveSmallIntegerField()
    temperament = models.CharField(max_length=160)
    room = models.CharField(max_length=20, choices=ROOM_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    note = models.TextField()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def initials(self):
        return "".join(part[0] for part in self.name.split()[:2]).upper()
