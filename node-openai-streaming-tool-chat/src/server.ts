import express, { type Request, type Response } from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "10mb" }));

const openAIApiKey = process.env.OPENAI_API_KEY?.trim() || "";
const model = "gpt-5-mini";
const modelName = "GPT-5 mini";
const modelContextLength = 400_000;
const outputTokenLimit = 4_000;
const systemPrompt = "You are a concise, helpful assistant. Answer the user's question directly and clearly.";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const sendEvent = (response: Response, event: Record<string, unknown>) => {
  response.write(`data: ${JSON.stringify(event)}\n\n`);
};

const parseConversation = (value: unknown): ConversationMessage[] | null => {
  if (!Array.isArray(value) || value.length === 0 || value.length % 2 === 0) return null;

  const conversation: ConversationMessage[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const rawContent = (item as { content?: unknown }).content;
    const expectedRole: ConversationMessage["role"] = index % 2 === 0 ? "user" : "assistant";
    if (role !== expectedRole || typeof rawContent !== "string") return null;
    const content = rawContent.trim();
    const contentLimit = role === "user" ? 600 : 24_000;
    if (!content || content.length > contentLimit) return null;
    conversation.push({ role: expectedRole, content });
  }
  return conversation;
};

const parseSessionId = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const sessionId = value.trim();
  return /^[A-Za-z0-9._:-]{1,256}$/.test(sessionId) ? sessionId : null;
};

const streamOpenAIAnswer = async (
  client: OpenAI,
  messages: ConversationMessage[],
  sessionId: string,
  response: Response
) => {
  const stream = await client.responses.create({
    model,
    instructions: systemPrompt,
    input: messages,
    max_output_tokens: outputTokenLimit,
    reasoning: { effort: "low" },
    prompt_cache_key: sessionId,
    store: false,
    stream: true
  });
  let wroteText = false;

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      wroteText = true;
      sendEvent(response, { type: "delta", text: event.delta });
    }
    if (event.type === "response.completed" && event.response.usage) {
      sendEvent(response, {
        type: "usage",
        promptTokens: event.response.usage.input_tokens,
        completionTokens: event.response.usage.output_tokens,
        totalTokens: event.response.usage.total_tokens,
        cachedTokens: event.response.usage.input_tokens_details.cached_tokens
      });
    }
    if (event.type === "response.incomplete") {
      const reason = event.response.incomplete_details?.reason;
      throw new Error(reason === "max_output_tokens"
        ? `${modelName} reached this demo's output limit. Ask for a shorter answer.`
        : `${modelName} could not complete the response.`);
    }
  }

  if (!wroteText) throw new Error(`${modelName} returned no text. Try again.`);
};

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/model", (_request, response) => {
  response.json({
    configured: Boolean(openAIApiKey),
    model,
    name: modelName,
    contextLength: modelContextLength,
    missing: openAIApiKey ? [] : ["OPENAI_API_KEY"]
  });
});

app.post("/api/chat", async (request: Request, response: Response) => {
  const conversation = parseConversation(request.body?.messages);
  const sessionId = parseSessionId(request.body?.sessionId);
  if (!conversation) {
    response.status(400).json({ error: "Send a valid conversation ending with a message from 1 to 600 characters." });
    return;
  }
  if (!sessionId) {
    response.status(400).json({ error: "Start a new chat session and try again." });
    return;
  }
  if (!openAIApiKey) {
    response.status(503).json({ error: "Add OPENAI_API_KEY to start a live OpenAI conversation." });
    return;
  }

  const client = new OpenAI({ apiKey: openAIApiKey });

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();

  try {
    await streamOpenAIAnswer(client, conversation, sessionId, response);
    sendEvent(response, { type: "done" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The OpenAI request failed.";
    console.error("OpenAI request failed", message);
    sendEvent(response, { type: "error", message });
  } finally {
    response.end();
  }
});

app.get("/", (_request, response) => {
  response.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Chat with OpenAI</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f6f6f4; color: #20201e; }
    * { box-sizing: border-box; }
    body { height: 100dvh; margin: 0; padding: 24px; overflow: hidden; }
    main { width: min(820px, 100%); height: calc(100dvh - 48px); margin: 0 auto; background: #fff; border: 1px solid #e3e3df; border-radius: 16px; box-shadow: 0 18px 55px #20201e0a; overflow: hidden; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
    header { padding: 26px 34px 22px; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
    h1 { margin: 0; font-size: clamp(1.7rem, 4vw, 2.45rem); line-height: 1.08; letter-spacing: -0.035em; font-weight: 650; }
    #status { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: #72726d; font-size: 0.8rem; overflow-wrap: anywhere; }
    #status::before { content: ''; width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: #2f9e63; }
    #messages { min-height: 0; padding: 28px 34px; border-top: 1px solid #ecece8; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 24px; scroll-behavior: smooth; }
    .message { line-height: 1.62; overflow-wrap: anywhere; }
    .user { width: 100%; padding: 13px 15px; background: #f3f3f0; border-radius: 8px; color: #3f3f3b; }
    .assistant { padding: 0 2px; font-size: 1.01rem; }
    .assistant.error .message-content { color: #a23c32; }
    .message p { margin: 0 0 0.8em; }
    .message p:last-child { margin-bottom: 0; }
    .message ul, .message ol { margin: 0.6em 0; padding-left: 1.5em; }
    .message pre { overflow-x: auto; padding: 12px 14px; border-radius: 8px; background: #eeeeea; white-space: pre; }
    .message code { padding: 0.12em 0.3em; border-radius: 4px; background: #eeeeea; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
    .message pre code { padding: 0; background: transparent; }
    .message blockquote { margin: 0.8em 0; padding-left: 1em; border-left: 3px solid #d1d1cc; color: #666660; }
    .message a { color: #405da7; }
    .message table { display: block; width: max-content; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
    .message th, .message td { padding: 9px 12px; border: 1px solid #d7d7d2; text-align: left; vertical-align: top; overflow-wrap: normal; }
    .message th { background: #f3f3f0; }
    .message-meta { min-height: 18px; margin-top: 7px; color: #92928c; font-size: 0.76rem; line-height: 1.35; }
    form { padding: 18px 34px 24px; border-top: 1px solid #ecece8; background: #fff; }
    textarea { display: block; width: 100%; height: 72px; resize: none; border: 1px solid #d7d7d2; border-radius: 10px; padding: 12px 14px; background: #fff; color: inherit; font: inherit; line-height: 1.45; }
    textarea:focus { outline: 3px solid #dfe7ff; border-color: #6278b8; }
    textarea:disabled { background: #f2f2ef; color: #888883; }
    .actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 11px; }
    .hint { color: #969690; font-size: 0.76rem; }
    button { border: 0; border-radius: 8px; padding: 9px 16px; background: #262624; color: #fff; font: inherit; font-weight: 650; cursor: pointer; }
    button:hover { background: #41413d; }
    button:focus-visible { outline: 3px solid #bdc9ec; outline-offset: 2px; }
    button:disabled { opacity: 0.45; cursor: wait; }
    #new-chat { flex: 0 0 auto; padding: 8px 11px; border: 1px solid #deded9; background: #fff; color: #666660; font-size: 0.78rem; font-weight: 600; }
    #new-chat:hover { background: #f5f5f2; color: #252522; }
    @media (max-width: 560px) {
      body { padding: 0; }
      main { height: 100dvh; border: 0; border-radius: 0; }
      header { padding: 22px; }
      #messages { padding: 24px 22px; }
      form { padding: 16px 22px 20px; }
      .hint { display: none; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Chat with OpenAI</h1>
        <span id="status">Checking OpenAI setup</span>
      </div>
      <button id="new-chat" type="button">New chat</button>
    </header>
    <section id="messages" aria-live="polite"></section>
    <form id="chat-form">
      <textarea id="message" aria-label="Message" maxlength="600" disabled>Which five U.S. cities are the most popular tourist destinations, and what makes each one worth visiting?</textarea>
      <div class="actions">
        <span class="hint">Enter to send · Shift + Enter for a new line</span>
        <button id="send" type="submit" disabled>Send</button>
      </div>
    </form>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/marked@18.0.7/lib/marked.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.4.12/dist/purify.min.js"></script>
  <script>
    const messages = document.querySelector('#messages');
    const status = document.querySelector('#status');
    const form = document.querySelector('#chat-form');
    const input = document.querySelector('#message');
    const button = document.querySelector('#send');
    const newChatButton = document.querySelector('#new-chat');
    const startingPrompt = input.value;
    let conversation = [];
    let sessionId = crypto.randomUUID();
    let configured = false;
    let sending = false;

    function scrollToLatest() {
      messages.scrollTop = messages.scrollHeight;
    }

    function renderMarkdown(element, markdown) {
      element.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
    }

    function addUserMessage(text) {
      const element = document.createElement('div');
      element.className = 'message user';
      renderMarkdown(element, text);
      messages.append(element);
      scrollToLatest();
    }

    function addAssistantMessage() {
      const element = document.createElement('div');
      element.className = 'message assistant';
      const content = document.createElement('div');
      content.className = 'message-content';
      const meta = document.createElement('div');
      meta.className = 'message-meta';
      element.append(content, meta);
      messages.append(element);
      scrollToLatest();
      return { element, content, meta };
    }

    function secondsSince(startedAt) {
      return ((performance.now() - startedAt) / 1000).toFixed(1) + 's';
    }

    function formatTokens(value) {
      if (value >= 1000000) return (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'K';
      return String(value);
    }

    function completedMeta(startedAt, requestState) {
      const parts = ['Responded in ' + secondsSince(startedAt)];
      if (requestState.usage) {
        parts.push(formatTokens(requestState.usage.promptTokens) + ' input tokens');
        parts.push(formatTokens(requestState.usage.completionTokens) + ' output tokens');
        if (requestState.usage.cachedTokens > 0) parts.push(formatTokens(requestState.usage.cachedTokens) + ' cached');
      }
      return parts.join(' · ');
    }

    async function readEvents(response, requestState) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        const blocks = buffer.split('\\n\\n');
        buffer = blocks.pop() || '';
        for (const block of blocks) {
          const line = block.split('\\n').find(value => value.startsWith('data: '));
          if (!line) continue;
          const event = JSON.parse(line.slice(6));
          if (event.type === 'delta') {
            requestState.phase = 'Responding';
            requestState.text += event.text;
            renderMarkdown(requestState.assistant.content, requestState.text);
            scrollToLatest();
          }
          if (event.type === 'usage') requestState.usage = event;
          if (event.type === 'done') requestState.done = true;
          if (event.type === 'error') throw new Error(event.message);
        }
      }
    }

    fetch('/api/model').then(response => response.json()).then(data => {
      configured = data.configured;
      if (configured) {
        status.textContent = 'Using ' + data.name + ' through OpenAI · ' + formatTokens(data.contextLength) + ' context';
        input.disabled = false;
        button.disabled = false;
        input.focus();
      } else {
        status.textContent = data.missing.join(' and ') + (data.missing.length === 1 ? ' is required' : ' are required');
      }
    }).catch(() => {
      status.textContent = 'Could not check the OpenAI setup';
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !configured) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addUserMessage(text);
      conversation.push({ role: 'user', content: text });
      const startedAt = performance.now();
      const assistant = addAssistantMessage();
      const requestState = { assistant, text: '', phase: 'Thinking', usage: null, done: false };
      assistant.meta.textContent = 'Thinking… 0.0s';
      const timer = setInterval(() => {
        assistant.meta.textContent = requestState.phase + '… ' + secondsSince(startedAt);
      }, 100);
      sending = true;
      button.disabled = true;
      newChatButton.disabled = true;
      button.textContent = 'Sending…';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversation, sessionId })
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || 'The request failed.');
        }
        await readEvents(response, requestState);
        if (!requestState.done || !requestState.text) throw new Error('OpenAI returned no text. Try again.');
        conversation.push({ role: 'assistant', content: requestState.text });
        assistant.meta.textContent = completedMeta(startedAt, requestState);
      } catch (error) {
        conversation.pop();
        if (requestState.text) requestState.text += '\\n\\n';
        requestState.text += error.message;
        renderMarkdown(assistant.content, requestState.text);
        assistant.element.classList.add('error');
        assistant.meta.textContent = 'Stopped after ' + secondsSince(startedAt);
      } finally {
        clearInterval(timer);
        sending = false;
        button.disabled = false;
        newChatButton.disabled = false;
        button.textContent = 'Send';
        input.focus();
        scrollToLatest();
      }
    });

    newChatButton.addEventListener('click', () => {
      if (sending) return;
      conversation = [];
      sessionId = crypto.randomUUID();
      messages.innerHTML = '';
      input.value = startingPrompt;
      input.focus();
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  </script>
</body>
</html>`);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`OpenAI chat listening on ${port}`);
});
