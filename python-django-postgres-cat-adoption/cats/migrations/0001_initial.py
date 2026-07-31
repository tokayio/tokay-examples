from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Cat",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=80, unique=True)),
                ("age", models.PositiveSmallIntegerField()),
                ("temperament", models.CharField(max_length=160)),
                ("room", models.CharField(choices=[("sunroom", "Sunroom"), ("library", "Library"), ("garden", "Garden room"), ("quiet", "Quiet room")], max_length=20)),
                ("status", models.CharField(choices=[("available", "Ready to meet"), ("pending", "Meeting scheduled"), ("adopted", "Heading home")], default="available", max_length=20)),
                ("note", models.TextField()),
            ],
            options={"ordering": ["name"]},
        ),
    ]
