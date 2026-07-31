<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Upcoming bookings</title><link rel="stylesheet" href="/site.css"></head>
<body>
  <main class="admin">
    <p class="kicker">Staff view</p><h1>Upcoming bookings</h1>
    @if (!$enabled)
      <p>Admin access is off. Add <code>ADMIN_PASSWORD</code> as a Project Secret and deploy again.</p>
    @elseif (!$authorized)
      <form method="post">@csrf<label>Admin password<input name="password" type="password" required></label><button>Open bookings</button></form>
    @else
      <div class="booking-list">@foreach ($bookings as $booking)<article><strong>{{ $booking->room->name }}</strong><h2>{{ $booking->purpose }}</h2><p>{{ $booking->starts_at->format('D, M j · g:i A') }} to {{ $booking->ends_at->format('g:i A') }}</p><p>{{ $booking->name }} · {{ $booking->email }}</p></article>@endforeach</div>
    @endif
    <a href="/">Return to the public page</a>
  </main>
</body>
</html>
