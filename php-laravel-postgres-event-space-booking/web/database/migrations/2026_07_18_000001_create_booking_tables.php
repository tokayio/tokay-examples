<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->unsignedInteger('capacity');
            $table->unsignedInteger('hourly_rate');
            $table->text('description');
            $table->timestampsTz();
        });

        Schema::create('bookings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('room_id')->constrained('rooms');
            $table->string('name');
            $table->string('email');
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->string('purpose');
            $table->string('source')->default('public form');
            $table->timestampsTz();
            $table->index(['room_id', 'starts_at', 'ends_at']);
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained('bookings');
            $table->string('kind');
            $table->timestampTz('sent_at');
            $table->string('delivery');
            $table->timestampsTz();
            $table->unique(['booking_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rooms');
    }
};
