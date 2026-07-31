<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Open Door Rooms</title>
  <link rel="stylesheet" href="/site.css">
</head>
<body>
  <header><a href="/">Open Door Rooms</a><a href="#book">Book a room</a></header>
  <main>
    <section class="hero"><p>Three rooms in one old civic building</p><h1>Make room for the thing.</h1><div>Workshops, rehearsals, dinners, meetings, and the ideas that need a real table.</div></section>
    @if ($confirmed)<div class="notice">Your booking is confirmed. We saved the time and room.</div>@endif
    <section class="rooms">
      @foreach ($rooms as $room)
        <article><span>{{ $room->capacity }} people</span><h2>{{ $room->name }}</h2><p>{{ $room->description }}</p><strong>${{ number_format($room->hourly_rate / 100) }} per hour</strong></article>
      @endforeach
    </section>
    <section id="book" class="booking">
      <div><p class="kicker">Public booking form</p><h2>Choose your time.</h2><p>We lock the room while checking availability, so two people cannot reserve the same slot.</p></div>
      <form method="post" action="/bookings">
        @csrf
        <label>Room<select name="room_id" required>@foreach ($rooms as $room)<option value="{{ $room->id }}" @selected(old('room_id') === $room->id)>{{ $room->name }}</option>@endforeach</select></label>
        <label>Your name<input name="name" value="{{ old('name') }}" required maxlength="100"></label>
        <label>Email<input name="email" type="email" value="{{ old('email') }}" required maxlength="180"></label>
        <label>Start time<input name="starts_at" type="datetime-local" value="{{ old('starts_at') }}" required></label>
        <label>Hours<input name="hours" type="number" min="1" max="8" value="{{ old('hours', 2) }}" required></label>
        <label>What are you planning?<input name="purpose" value="{{ old('purpose') }}" required maxlength="180"></label>
        @if ($errors->any())<div class="errors">@foreach ($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
        <button>Confirm booking</button>
      </form>
    </section>
  </main>
</body>
</html>
