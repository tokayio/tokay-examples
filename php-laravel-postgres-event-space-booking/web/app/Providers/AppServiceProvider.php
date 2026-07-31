<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        try {
            $rooms = [
                ['id' => '259678d7-1503-40d3-bbca-4fd5e5161fd1', 'name' => 'Workshop room', 'capacity' => 18, 'hourly_rate' => 8500, 'description' => 'North light, long worktables, a deep sink, and room to make a mess.'],
                ['id' => 'ff9eb54d-0da4-43b8-a810-c52c3b9acb32', 'name' => 'Gallery', 'capacity' => 45, 'hourly_rate' => 14000, 'description' => 'White walls, quiet floors, and a flexible open plan for gatherings or exhibitions.'],
                ['id' => '48a08887-00dc-48de-b144-5019de740d72', 'name' => 'Hall', 'capacity' => 110, 'hourly_rate' => 24000, 'description' => 'A generous room with a small stage, house chairs, and an adjoining kitchen.'],
            ];
            foreach ($rooms as $room) {
                Room::query()->updateOrCreate(['id' => $room['id']], $room);
            }

            if (!Booking::query()->where('id', '9aa2d30b-5596-4db6-847d-ed4c5fa50a14')->exists()) {
                $start = now()->addHours(18)->startOfHour();
                Booking::query()->create([
                    'id' => '9aa2d30b-5596-4db6-847d-ed4c5fa50a14',
                    'room_id' => $rooms[0]['id'],
                    'name' => 'Mira Bell',
                    'email' => 'mira@example.test',
                    'starts_at' => $start,
                    'ends_at' => $start->copy()->addHours(2),
                    'purpose' => 'Neighborhood printmaking circle',
                    'source' => 'seed',
                ]);
            }
        } catch (QueryException) {
            // The first web process may begin while the migration is finishing.
        }
    }
}
