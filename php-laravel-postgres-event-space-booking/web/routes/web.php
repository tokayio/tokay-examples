<?php

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

Route::get('/health', fn () => response()->json(['ok' => true]));

Route::get('/', function () {
    return view('home', [
        'rooms' => Room::query()->orderBy('hourly_rate')->get(),
        'confirmed' => request()->boolean('confirmed'),
    ]);
});

Route::post('/bookings', function (Request $request) {
    $input = $request->validate([
        'room_id' => ['required', 'uuid', 'exists:rooms,id'],
        'name' => ['required', 'string', 'max:100'],
        'email' => ['required', 'email', 'max:180'],
        'starts_at' => ['required', 'date', 'after:now'],
        'hours' => ['required', 'integer', 'min:1', 'max:8'],
        'purpose' => ['required', 'string', 'min:5', 'max:180'],
    ]);
    $start = now()->parse($input['starts_at']);
    $end = $start->copy()->addHours((int) $input['hours']);

    DB::transaction(function () use ($input, $start, $end): void {
        Room::query()->whereKey($input['room_id'])->lockForUpdate()->firstOrFail();
        $overlap = Booking::query()
            ->where('room_id', $input['room_id'])
            ->where('starts_at', '<', $end)
            ->where('ends_at', '>', $start)
            ->exists();
        if ($overlap) {
            throw ValidationException::withMessages(['starts_at' => 'That room is already booked during this time.']);
        }
        Booking::query()->create([
            'id' => (string) Str::uuid(),
            'room_id' => $input['room_id'],
            'name' => $input['name'],
            'email' => $input['email'],
            'starts_at' => $start,
            'ends_at' => $end,
            'purpose' => $input['purpose'],
            'source' => 'public form',
        ]);
    });

    return redirect('/?confirmed=1');
});

Route::match(['get', 'post'], '/admin/bookings', function (Request $request) {
    $expected = (string) config('app.admin_password', '');
    if ($expected === '') {
        return view('admin', ['enabled' => false, 'authorized' => false, 'bookings' => collect()]);
    }
    $authorized = $request->isMethod('post') && hash_equals($expected, (string) $request->input('password'));
    return response()->view('admin', [
        'enabled' => true,
        'authorized' => $authorized,
        'bookings' => $authorized
            ? Booking::query()->with('room')->where('starts_at', '>=', now())->orderBy('starts_at')->get()
            : collect(),
    ], $request->isMethod('post') && !$authorized ? 403 : 200);
});
