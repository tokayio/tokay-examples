import os
import signal
import socket
import threading
import time
from pathlib import Path
from uuid import UUID

import psycopg
from anthropic import Anthropic
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

LEASE_SECONDS = 8
HEARTBEAT_SECONDS = 2
WORKER_ID = f"{socket.gethostname()}:{os.getpid()}"
DOCUMENT_DIRECTORY = Path(__file__).parent / "documents"
# The key is optional. Without it, the worker uses the bundled document demo.
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
STOP = threading.Event()


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


def wait_for_database() -> None:
    delay = 1.0
    while not STOP.is_set():
        try:
            with connect() as connection:
                connection.execute("SELECT 1 FROM research_jobs LIMIT 1")
            return
        except psycopg.Error as error:
            print(f"Database not ready, retrying in {delay:.0f}s · {error}", flush=True)
            STOP.wait(delay)
            delay = min(delay * 2, 12)


def reclaim_expired_jobs() -> int:
    with connect() as connection:
        rows = connection.execute(
            """
            UPDATE research_jobs
            SET status = 'queued', locked_by = NULL, lease_expires_at = NULL,
                available_at = now(), updated_at = now(),
                last_error = 'Worker lease expired. Resuming from the last checkpoint.'
            WHERE status = 'running' AND lease_expires_at < now()
            RETURNING id
            """
        ).fetchall()
    return len(rows)


def claim_job() -> dict | None:
    with connect() as connection:
        row = connection.execute(
            """
            SELECT * FROM research_jobs
            WHERE status = 'queued' AND available_at <= now()
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
            """
        ).fetchone()
        if not row:
            return None
        claimed = connection.execute(
            """
            UPDATE research_jobs
            SET status = 'running', locked_by = %s,
                lease_expires_at = now() + make_interval(secs => %s),
                attempts = attempts + 1, updated_at = now()
            WHERE id = %s
            RETURNING *
            """,
            (WORKER_ID, LEASE_SECONDS, row["id"]),
        ).fetchone()
    return claimed


class LeaseHeartbeat:
    def __init__(self, job_id: UUID):
        self.job_id = job_id
        self.stop = threading.Event()
        self.thread = threading.Thread(target=self.run, daemon=True)

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, _error_type, _error, _traceback):
        self.stop.set()
        self.thread.join(timeout=HEARTBEAT_SECONDS + 1)

    def run(self):
        while not self.stop.wait(HEARTBEAT_SECONDS):
            try:
                with connect() as connection:
                    connection.execute(
                        """
                        UPDATE research_jobs
                        SET lease_expires_at = now() + make_interval(secs => %s), updated_at = now()
                        WHERE id = %s AND status = 'running' AND locked_by = %s
                        """,
                        (LEASE_SECONDS, self.job_id, WORKER_ID),
                    )
            except psycopg.Error as error:
                print(f"Heartbeat failed for {self.job_id} · {error}", flush=True)


def update_checkpoint(job_id: UUID, step: int, checkpoint: dict) -> None:
    with connect() as connection:
        connection.execute(
            """
            UPDATE research_jobs
            SET current_step = %s, checkpoint = %s, updated_at = now()
            WHERE id = %s AND locked_by = %s
            """,
            (step, Jsonb(checkpoint), job_id, WORKER_ID),
        )


def load_documents() -> list[dict]:
    return [
        {"source": path.name, "text": path.read_text(encoding="utf-8")}
        for path in sorted(DOCUMENT_DIRECTORY.glob("*.md"))
    ]


def local_evidence_notes(documents: list[dict]) -> list[dict]:
    notes = []
    for document in documents:
        paragraphs = [part.strip() for part in document["text"].split("\n\n") if part.strip() and not part.startswith("#")]
        notes.append({
            "source": document["source"],
            "note": " ".join(paragraphs[:2]),
        })
    return notes


def model_evidence_notes(question: str, documents: list[dict]) -> list[dict]:
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
    notes = []
    for document in documents:
        message = client.messages.create(
            model=model,
            max_tokens=16000,
            output_config={"effort": "low"},
            system="Extract only evidence relevant to the question. The document is the full evidence boundary. Write a compact note and do not invent citations.",
            messages=[{
                "role": "user",
                "content": f"Question\n{question}\n\nDocument\n{document['text']}",
            }],
        )
        text = "".join(block.text for block in message.content if block.type == "text")
        notes.append({"source": document["source"], "note": text.strip()})
    return notes


def local_synthesis(question: str, notes: list[dict]) -> str:
    source_names = ", ".join(note["source"].removesuffix(".md").replace("-", " ") for note in notes)
    return (
        f"This bundled document demo reviewed {source_names} for the question “{question}” "
        "The notes agree that the decision should begin with the home, climate, existing systems, complete project cost, and a plan for the coldest conditions. "
        "Use the findings below as a comparison checklist, then replace the bundled documents when you adapt this worker to your own research."
    )


def model_synthesis(question: str, notes: list[dict]) -> str:
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
    evidence = "\n\n".join(f"Source: {note['source']}\n{note['note']}" for note in notes)
    message = client.messages.create(
        model=model,
        max_tokens=16000,
        output_config={"effort": "low"},
        system="Write a concise research brief from only the supplied evidence. State uncertainty plainly. Do not invent sources.",
        messages=[{"role": "user", "content": f"Question\n{question}\n\nEvidence notes\n{evidence}"}],
    )
    return "".join(block.text for block in message.content if block.type == "text").strip()


def mark_restart_observed(job_id: UUID) -> None:
    with connect() as connection:
        connection.execute(
            """
            UPDATE research_jobs
            SET restart_observed = true, updated_at = now()
            WHERE id = %s AND locked_by = %s
            """,
            (job_id, WORKER_ID),
        )


def complete_job(job_id: UUID, checkpoint: dict, result: dict) -> None:
    with connect() as connection:
        connection.execute(
            """
            UPDATE research_jobs
            SET status = 'done', current_step = total_steps, checkpoint = %s, result = %s,
                locked_by = NULL, lease_expires_at = NULL, last_error = NULL, updated_at = now()
            WHERE id = %s AND locked_by = %s
            """,
            (Jsonb(checkpoint), Jsonb(result), job_id, WORKER_ID),
        )


def fail_or_retry_job(job: dict, error: Exception) -> None:
    failed = job["attempts"] >= 3
    status = "failed" if failed else "queued"
    delay = min(job["attempts"] * 5, 20)
    with connect() as connection:
        connection.execute(
            """
            UPDATE research_jobs
            SET status = %s, locked_by = NULL, lease_expires_at = NULL,
                available_at = now() + make_interval(secs => %s),
                last_error = %s, updated_at = now()
            WHERE id = %s AND locked_by = %s
            """,
            (status, delay, str(error)[:1000], job["id"], WORKER_ID),
        )


def process_job(job: dict) -> None:
    job_id = job["id"]
    checkpoint = dict(job["checkpoint"] or {})
    model_enabled = bool(ANTHROPIC_API_KEY)
    print(f"Claimed {job_id} at step {job['current_step']} · attempt {job['attempts']}", flush=True)

    with LeaseHeartbeat(job_id):
        if job["current_step"] < 1:
            documents = load_documents()
            checkpoint["documents"] = documents
            checkpoint["mode"] = "Anthropic" if model_enabled else "Bundled document demo"
            update_checkpoint(job_id, 1, checkpoint)
            job["current_step"] = 1
            print(f"{job_id} · step 1 of 4 · read {len(documents)} documents", flush=True)
            time.sleep(1)

        if job["current_step"] < 2:
            documents = checkpoint["documents"]
            notes = model_evidence_notes(job["question"], documents) if model_enabled else local_evidence_notes(documents)
            checkpoint["notes"] = notes
            update_checkpoint(job_id, 2, checkpoint)
            job["current_step"] = 2
            print(f"{job_id} · step 2 of 4 · saved evidence notes", flush=True)
            time.sleep(1)

        if job["restart_demo"] and not job["restart_observed"]:
            mark_restart_observed(job_id)
            print(f"{job_id} · restart demo · exiting after checkpoint 2", flush=True)
            os._exit(23)

        if job["current_step"] < 3:
            notes = checkpoint["notes"]
            summary = model_synthesis(job["question"], notes) if model_enabled else local_synthesis(job["question"], notes)
            checkpoint["summary"] = summary
            update_checkpoint(job_id, 3, checkpoint)
            job["current_step"] = 3
            print(f"{job_id} · step 3 of 4 · saved draft", flush=True)
            time.sleep(1)

        result = {
            "mode": checkpoint["mode"],
            "summary": checkpoint["summary"],
            "findings": checkpoint["notes"],
            "sources": [document["source"] for document in checkpoint["documents"]],
        }
        checkpoint["completed"] = True
        complete_job(job_id, checkpoint, result)
        print(f"{job_id} · step 4 of 4 · done", flush=True)


def stop_worker(_signal_number, _frame):
    STOP.set()


signal.signal(signal.SIGTERM, stop_worker)
signal.signal(signal.SIGINT, stop_worker)


def main():
    wait_for_database()
    print(f"Research worker ready · {WORKER_ID}", flush=True)
    while not STOP.is_set():
        try:
            reclaimed = reclaim_expired_jobs()
            if reclaimed:
                print(f"Reclaimed {reclaimed} expired job lease", flush=True)
            job = claim_job()
            if not job:
                STOP.wait(1)
                continue
            try:
                process_job(job)
            except Exception as error:
                print(f"Job {job['id']} failed · {error}", flush=True)
                fail_or_retry_job(job, error)
        except psycopg.Error as error:
            print(f"Queue loop database error · {error}", flush=True)
            STOP.wait(2)
    print("Research worker stopped", flush=True)


if __name__ == "__main__":
    main()
