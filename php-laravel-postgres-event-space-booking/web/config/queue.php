<?php

return [
    'default' => 'sync',
    'connections' => ['sync' => ['driver' => 'sync']],
    'batching' => ['database' => 'pgsql', 'table' => 'job_batches'],
    'failed' => ['driver' => 'null', 'database' => 'pgsql', 'table' => 'failed_jobs'],
];
