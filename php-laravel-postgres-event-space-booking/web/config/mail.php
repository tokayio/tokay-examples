<?php

return [
    'default' => 'log',
    'mailers' => ['log' => ['transport' => 'log', 'channel' => 'stderr']],
    'from' => ['address' => 'bookings@example.test', 'name' => 'Open Door Rooms'],
];
