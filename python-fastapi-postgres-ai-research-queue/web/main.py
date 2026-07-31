import asyncio
import json
import os
import time
from contextlib import asynccontextmanager
from uuid import UUID, uuid4

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel, Field
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

SEEDED_JOB_ID = UUID("00000000-0000-4000-8000-000000000017")
SEEDED_RESULT = {
    "mode": "Bundled document demo",
    "summary": "In this sample evidence set, heat pumps trade more retrofit planning for efficient heating and cooling. Gas furnaces can be simpler when a home already has usable gas service and ducts. Climate, electrical capacity, insulation, current distribution, local prices, and backup plans decide the better fit.",
    "findings": [
        {
            "source": "Climate and efficiency notes",
            "note": "Start with the building envelope and the heating load. Equipment labels alone do not answer how either system will perform in a specific home.",
        },
        {
            "source": "Costs and retrofit notes",
            "note": "Compare the complete project, including electrical work, ducts, gas service, cooling needs, incentives, and expected operating costs.",
        },
        {
            "source": "Cold weather and resilience notes",
            "note": "Cold climate design depends on correct sizing, low temperature capacity, defrost behavior, and a deliberate backup strategy.",
        },
    ],
    "sources": [
        "climate-and-efficiency.md",
        "costs-and-retrofit.md",
        "cold-weather-and-resilience.md",
    ],
}


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


def seed_completed_job() -> None:
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO research_jobs
                (id, question, status, current_step, total_steps, checkpoint, result, attempts)
            VALUES (%s, %s, 'done', 4, 4, %s, %s, 1)
            ON CONFLICT (id) DO NOTHING
            """,
            (
                SEEDED_JOB_ID,
                "Compare heat pumps and gas furnaces for an older home.",
                Jsonb({"seeded": True}),
                Jsonb(SEEDED_RESULT),
            ),
        )


def wait_for_database() -> None:
    delay = 1.0
    for attempt in range(8):
        try:
            seed_completed_job()
            return
        except psycopg.Error:
            if attempt == 7:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 8)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await asyncio.to_thread(wait_for_database)
    yield


app = FastAPI(title="Research queue", lifespan=lifespan)


class JobInput(BaseModel):
    question: str = Field(min_length=8, max_length=500)
    restart_demo: bool = False


def serialize_job(row: dict) -> dict:
    return {
        key: value.isoformat() if hasattr(value, "isoformat") else value
        for key, value in row.items()
    }


def fetch_job(job_id: UUID) -> dict | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM research_jobs WHERE id = %s",
            (job_id,),
        ).fetchone()
    return serialize_job(row) if row else None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/jobs")
def list_jobs():
    with connect() as connection:
        rows = connection.execute(
            "SELECT * FROM research_jobs ORDER BY created_at DESC LIMIT 30"
        ).fetchall()
    return [serialize_job(row) for row in rows]


@app.get("/api/jobs/{job_id}")
def get_job(job_id: UUID):
    job = fetch_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/jobs", status_code=202)
def create_job(job_input: JobInput):
    job_id = uuid4()
    with connect() as connection:
        row = connection.execute(
            """
            INSERT INTO research_jobs (id, question, restart_demo)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (job_id, job_input.question.strip(), job_input.restart_demo),
        ).fetchone()
    return serialize_job(row)


@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: UUID):
    async def events():
        previous = None
        for _ in range(600):
            job = await asyncio.to_thread(fetch_job, job_id)
            if not job:
                yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
                return
            snapshot = json.dumps(job, sort_keys=True, default=str)
            if snapshot != previous:
                yield f"data: {json.dumps(job, default=str)}\n\n"
                previous = snapshot
            if job["status"] in {"done", "failed"}:
                return
            await asyncio.sleep(1)

    return StreamingResponse(events(), media_type="text/event-stream")


@app.get("/", response_class=HTMLResponse)
def home():
    return """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Research queue</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #eef2f6; color: #1d2835; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(1000px, calc(100% - 36px)); margin: 52px auto 90px; }
    header { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 28px; padding: 38px; border-radius: 26px; background: #172a42; color: white; }
    h1 { margin: 0 0 14px; font: 500 clamp(2.5rem, 7vw, 5.5rem)/0.96 Georgia, serif; }
    header p { margin: 0; color: #c3d1df; line-height: 1.6; }
    .steps { display: grid; align-content: center; gap: 10px; }
    .steps span { padding: 10px 12px; border: 1px solid #48627d; border-radius: 10px; color: #dce7f1; }
    form, article { margin-top: 24px; padding: 26px; border: 1px solid #ccd6df; border-radius: 20px; background: white; }
    label { display: block; margin-bottom: 8px; font-weight: 700; }
    textarea { width: 100%; min-height: 104px; resize: vertical; padding: 14px; border: 1px solid #aebbc7; border-radius: 12px; font: inherit; line-height: 1.5; }
    textarea:focus { outline: 3px solid #b6d2ec; border-color: #315f8b; }
    .form-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 14px; }
    .check { display: flex; align-items: center; gap: 8px; margin: 0; font-weight: 500; color: #4e6072; }
    button { border: 0; border-radius: 12px; padding: 12px 18px; background: #b34e35; color: white; font: inherit; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.55; cursor: wait; }
    #jobs { display: grid; gap: 18px; }
    .job-head { display: flex; align-items: start; justify-content: space-between; gap: 16px; }
    h2 { margin: 0; font-size: 1.2rem; }
    .status { flex: none; padding: 6px 9px; border-radius: 999px; background: #e7edf2; color: #526373; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .done { background: #dceee3; color: #26603a; }
    .failed { background: #f7dfdc; color: #8b3328; }
    .progress { height: 8px; margin: 18px 0; border-radius: 999px; background: #e9edf1; overflow: hidden; }
    .progress span { display: block; height: 100%; background: #3e779f; transition: width 300ms ease; }
    .meta, .question { color: #5b6b79; line-height: 1.55; }
    .result { margin-top: 18px; padding-top: 18px; border-top: 1px solid #e1e6ea; }
    .result h3 { margin: 0 0 8px; }
    .result li { margin: 8px 0; line-height: 1.5; }
    .mode { display: inline-block; margin-bottom: 10px; color: #8a4b2f; font-weight: 700; }
    @media (max-width: 700px) { main { margin-top: 18px; } header { grid-template-columns: 1fr; padding: 26px 22px; } form, article { padding: 21px; } .form-row { align-items: stretch; flex-direction: column; } button { width: 100%; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Research that keeps going.</h1>
        <p>Submit a question, close the tab, or restart the worker. The job, lease, checkpoint, and result live in PostgreSQL.</p>
      </div>
      <div class="steps"><span>1 · Read bundled documents</span><span>2 · Build evidence notes</span><span>3 · Draft the synthesis</span><span>4 · Save the result</span></div>
    </header>

    <form id="research-form">
      <label for="question">What should the worker research?</label>
      <textarea id="question" minlength="8" maxlength="500">What should a homeowner compare before replacing a gas furnace with a heat pump?</textarea>
      <div class="form-row">
        <label class="check"><input id="restart" type="checkbox"> Restart the worker once during this job</label>
        <button id="submit" type="submit">Start research</button>
      </div>
    </form>

    <section id="jobs" aria-live="polite"></section>
  </main>
  <script>
    const jobsElement = document.querySelector('#jobs');
    const form = document.querySelector('#research-form');
    const submit = document.querySelector('#submit');
    const streams = new Map();

    function escapeHtml(value) {
      const element = document.createElement('div');
      element.textContent = value == null ? '' : String(value);
      return element.innerHTML;
    }

    function renderResult(result) {
      if (!result) return '';
      const findings = (result.findings || []).map(item => '<li><strong>' + escapeHtml(item.source) + '</strong> · ' + escapeHtml(item.note) + '</li>').join('');
      return '<div class="result"><span class="mode">' + escapeHtml(result.mode) + '</span><h3>Brief</h3><p>' + escapeHtml(result.summary) + '</p><ul>' + findings + '</ul></div>';
    }

    function renderJob(job) {
      let article = document.querySelector('[data-job="' + job.id + '"]');
      if (!article) {
        article = document.createElement('article');
        article.dataset.job = job.id;
        jobsElement.prepend(article);
      }
      const percent = Math.round((job.current_step / job.total_steps) * 100);
      const recovery = job.restart_observed ? ' · worker restart observed' : '';
      article.innerHTML = '<div class="job-head"><h2>' + escapeHtml(job.question) + '</h2><span class="status ' + job.status + '">' + escapeHtml(job.status) + '</span></div>' +
        '<div class="progress"><span style="width:' + percent + '%"></span></div>' +
        '<p class="meta">Step ' + job.current_step + ' of ' + job.total_steps + ' · attempt ' + job.attempts + recovery + '</p>' +
        (job.last_error ? '<p class="meta">Last error · ' + escapeHtml(job.last_error) + '</p>' : '') + renderResult(job.result);
    }

    function watch(job) {
      if (streams.has(job.id) || job.status === 'done' || job.status === 'failed') return;
      const stream = new EventSource('/api/jobs/' + job.id + '/events');
      streams.set(job.id, stream);
      stream.onmessage = event => {
        const current = JSON.parse(event.data);
        renderJob(current);
        if (current.status === 'done' || current.status === 'failed') {
          stream.close();
          streams.delete(job.id);
        }
      };
      stream.onerror = () => {
        stream.close();
        streams.delete(job.id);
        setTimeout(loadJobs, 1500);
      };
    }

    async function loadJobs() {
      const response = await fetch('/api/jobs');
      const jobs = await response.json();
      jobs.slice().reverse().forEach(renderJob);
      jobs.forEach(watch);
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      submit.disabled = true;
      try {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: document.querySelector('#question').value,
            restart_demo: document.querySelector('#restart').checked
          })
        });
        if (!response.ok) throw new Error('The job could not be created.');
        const job = await response.json();
        renderJob(job);
        watch(job);
      } finally {
        submit.disabled = false;
      }
    });

    loadJobs();
  </script>
</body>
</html>"""
