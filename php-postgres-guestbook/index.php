<?php
declare(strict_types=1);

function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function database(): PDO
{
    $url = getenv('DATABASE_URL');
    if (!$url) {
        throw new RuntimeException('DATABASE_URL is required.');
    }

    $parts = parse_url($url);
    if ($parts === false || !isset($parts['host'], $parts['path'])) {
        throw new RuntimeException('DATABASE_URL is not a valid PostgreSQL URL.');
    }

    $host = $parts['host'];
    $port = $parts['port'] ?? 5432;
    $name = ltrim($parts['path'], '/');
    $user = rawurldecode($parts['user'] ?? '');
    $password = rawurldecode($parts['pass'] ?? '');

    return new PDO(
        "pgsql:host={$host};port={$port};dbname={$name}",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($path === '/health') {
    header('Content-Type: application/json');
    echo json_encode(['ok' => true], JSON_THROW_ON_ERROR);
    exit;
}

try {
    $db = database();
    $db->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS guestbook_entries (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        SQL);

    $count = (int) $db->query('SELECT COUNT(*) FROM guestbook_entries')->fetchColumn();
    if ($count === 0) {
        $seed = $db->prepare('INSERT INTO guestbook_entries (name, message) VALUES (:name, :message)');
        $seed->execute(['name' => 'Your host', 'message' => 'Welcome. Sign below.']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/sign') {
        $name = trim((string) ($_POST['name'] ?? ''));
        $message = trim((string) ($_POST['message'] ?? ''));
        if ($name === '' || $message === '') {
            http_response_code(400);
            throw new InvalidArgumentException('Add your name and a note.');
        }

        $insert = $db->prepare('INSERT INTO guestbook_entries (name, message) VALUES (:name, :message)');
        $insert->execute([
            'name' => mb_substr($name, 0, 60),
            'message' => mb_substr($message, 0, 500),
        ]);
        header('Location: /', true, 303);
        exit;
    }

    $entries = $db->query(<<<'SQL'
        SELECT name, message, created_at AT TIME ZONE 'UTC' AS created_at
        FROM guestbook_entries
        ORDER BY id DESC
        SQL)->fetchAll();
} catch (Throwable $error) {
    error_log($error->__toString());
    $entries = [];
    $pageError = $error instanceof InvalidArgumentException
        ? $error->getMessage()
        : 'The guestbook cannot reach its database yet.';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The PHP guestbook</title>
  <style>
    :root { font-family: ui-sans-serif, system-ui, sans-serif; color: #28251f; background: #f6f1e8; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(680px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0; }
    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(2.5rem, 8vw, 4.5rem); font-weight: 500; }
    .lede, .meta { color: #70695d; }
    form, article { padding: 1.2rem; border: 1px solid #d7cebf; border-radius: 10px; background: #fffdf8; }
    form { display: grid; gap: 0.9rem; margin: 2rem 0; }
    label { display: grid; gap: 0.35rem; font-weight: 700; font-size: 0.85rem; }
    input, textarea, button { font: inherit; }
    input, textarea { padding: 0.7rem; border: 1px solid #bcb1a1; border-radius: 6px; }
    textarea { min-height: 6rem; resize: vertical; }
    button { justify-self: start; padding: 0.7rem 1rem; border: 0; border-radius: 6px; color: white; background: #28251f; }
    .error { color: #a01933; }
    section { display: grid; gap: 0.8rem; }
    article p { margin-top: 0; white-space: pre-wrap; }
    article footer { color: #70695d; font-size: 0.8rem; }
  </style>
</head>
<body>
  <main>
    <h1>The guestbook</h1>
    <p class="lede">A small PHP app with a real PostgreSQL home.</p>
    <?php if (isset($pageError)): ?><p class="error"><?= escape($pageError) ?></p><?php endif; ?>
    <form action="/sign" method="post">
      <label>Your name<input name="name" maxlength="60" required></label>
      <label>Your note<textarea name="message" maxlength="500" required></textarea></label>
      <button type="submit">Sign the book</button>
    </form>
    <p class="meta"><?= count($entries) ?> <?= count($entries) === 1 ? 'entry' : 'entries' ?></p>
    <section>
      <?php foreach ($entries as $entry): ?>
        <article>
          <p><?= nl2br(escape((string) $entry['message'])) ?></p>
          <footer><?= escape((string) $entry['name']) ?> · <?= escape((string) $entry['created_at']) ?> UTC</footer>
        </article>
      <?php endforeach; ?>
    </section>
  </main>
</body>
</html>
