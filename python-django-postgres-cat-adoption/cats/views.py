from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render

from .models import Cat


def directory(request):
    query = request.GET.get("q", "").strip()
    cats = Cat.objects.all()
    if query:
        cats = cats.filter(
            Q(name__icontains=query)
            | Q(temperament__icontains=query)
            | Q(note__icontains=query)
            | Q(room__icontains=query)
        )
    return render(request, "cats/directory.html", {"cats": cats, "query": query, "room_name": "All rooms"})


def room(request, room_slug):
    room_names = dict(Cat.ROOM_CHOICES)
    cats = Cat.objects.filter(room=room_slug)
    return render(request, "cats/directory.html", {"cats": cats, "query": "", "room_name": room_names.get(room_slug, "Room")})


def health(_request):
    return JsonResponse({"ok": True})
