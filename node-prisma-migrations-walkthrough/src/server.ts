import process from "node:process"
import { PrismaPg } from "@prisma/adapter-pg"
import express from "express"
import { Prisma, PrismaClient } from "./generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })
const app = express()
const port = Number(process.env.PORT || 3000)

function escapeHtml(value: unknown) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }
  return String(value).replace(/[&<>'"]/g, character => entities[character])
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value)
}

async function seed() {
  if (await prisma.signup.count() === 0) {
    await prisma.signup.create({
      data: {
        name: "Mina Shah",
        email: "mina@example.test",
      },
    })
  }
}

app.use(express.urlencoded({ extended: false }))

app.get("/health", async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`
  response.json({ ok: true })
})

app.get("/", async (_request, response) => {
  await prisma.pageVisit.create({ data: { path: "/" } })
  const signups = await prisma.signup.findMany({ orderBy: { createdAt: "desc" } })
  const cards = signups.map(signup => `
    <li>
      <span>${escapeHtml(signup.name).slice(0, 1).toUpperCase()}</span>
      <div><strong>${escapeHtml(signup.name)}</strong><small>${escapeHtml(signup.email)}</small></div>
      <div class="status">${signup.confirmedAt
        ? `<b>Confirmed</b><time>${formatDate(signup.confirmedAt)}</time>`
        : `<form action="/signups/${encodeURIComponent(signup.id)}/confirm" method="post"><button class="confirm">Confirm signup</button></form>`
      }</div>
    </li>
  `).join("")

  response.send(`<!doctype html>
    <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Field Notes</title>
    <style>
      :root{font-family:ui-sans-serif,system-ui,sans-serif;background:#f2efe8;color:#25312d}*{box-sizing:border-box}body{margin:0}main{width:min(1060px,calc(100% - 36px));margin:auto;padding:32px 0 90px}nav{display:flex;justify-content:space-between;align-items:center;padding-bottom:28px;border-bottom:1px solid #c8c4ba}nav strong{font:600 1.25rem Georgia,serif}nav span{color:#65716b;font-size:.84rem}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:64px;padding:76px 0 56px}.eyebrow{color:#bd553e;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}h1{max-width:680px;margin:12px 0 22px;font:500 clamp(3.3rem,8vw,7.4rem)/.88 Georgia,serif;letter-spacing:-.055em}.intro{max-width:580px;color:#59645f;font-size:1.06rem;line-height:1.6}.panel{align-self:end;padding:27px;border-radius:18px;background:#fffdf8;box-shadow:0 20px 55px #5c514314}.panel h2{margin:0 0 7px;font:500 1.85rem Georgia,serif}.panel p{margin:0 0 20px;color:#6c756f;line-height:1.5}label{display:block;margin:14px 0 6px;font-size:.76rem;font-weight:800}input,button{width:100%;padding:12px 13px;border:1px solid #c9c5bb;border-radius:8px;background:white;font:inherit}button{margin-top:18px;border:0;background:#305f50;color:white;font-weight:800;cursor:pointer}.list-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:14px}.list-head h2{margin:0;font:500 2rem Georgia,serif}.list-head span{color:#69736e}ul{display:grid;gap:10px;margin:0;padding:0;list-style:none}li{display:grid;grid-template-columns:44px 1fr auto;gap:14px;align-items:center;padding:15px 18px;border-radius:12px;background:#fffdf8}li>span{display:grid;width:42px;height:42px;place-items:center;border-radius:50%;background:#e2e7dc;color:#305f50;font-family:Georgia,serif;font-weight:700}li strong,li small{display:block}li small,time{margin-top:3px;color:#747d78;font-size:.8rem}.status{text-align:right}.status b{display:block;color:#305f50;font-size:.78rem}.confirm{width:auto;margin:0;padding:8px 10px;background:#e4eadd;color:#305f50;font-size:.78rem}@media(max-width:760px){.hero{grid-template-columns:1fr;gap:28px;padding-top:50px}li{grid-template-columns:44px 1fr}.status{grid-column:2;text-align:left}}
    </style></head><body><main><nav><strong>Field Notes</strong><span>Small letters about considered work</span></nav>
      <section class="hero"><div><p class="eyebrow">A quieter inbox</p><h1>One useful letter each month.</h1><p class="intro">A short field note for people building thoughtful products. Practical observations, good references, and no urgency theater.</p></div>
      <form class="panel" action="/signups" method="post"><h2>Join the list</h2><p>Leave a name and email. The next note arrives at the beginning of the month.</p><label for="name">Name</label><input id="name" name="name" maxlength="100" required><label for="email">Email</label><input id="email" name="email" type="email" maxlength="254" required><button>Join Field Notes</button></form></section>
      <section><div class="list-head"><h2>People already reading</h2><span>${signups.length} ${signups.length === 1 ? "reader" : "readers"}</span></div><ul>${cards}</ul></section>
    </main></body></html>`)
})

app.post("/signups", async (request, response) => {
  const name = String(request.body.name || "").trim()
  const email = String(request.body.email || "").trim().toLowerCase()
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).send("Enter a name and a valid email address.")
  }

  try {
    await prisma.signup.create({ data: { name, email } })
    response.redirect(303, "/")
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return response.status(409).send("That email is already on the list.")
    }
    throw error
  }
})

app.post("/signups/:id/confirm", async (request, response) => {
  const signup = await prisma.signup.findUnique({ where: { id: request.params.id } })
  if (!signup) return response.status(404).send("That signup was not found.")
  if (!signup.confirmedAt) {
    await prisma.signup.update({
      where: { id: signup.id },
      data: { confirmedAt: new Date() },
    })
  }
  response.redirect(303, "/")
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).send("Field Notes could not complete that request.")
})

await seed()
const server = app.listen(port, "0.0.0.0", () => console.log(`Field Notes ready on port ${port}`))

process.on("SIGTERM", () => server.close(() => void prisma.$disconnect().finally(() => process.exit(0))))
