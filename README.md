<div align="center">
  <h1>Agentic Inbox</h1>
  <p><em>A self-hosted email client with an MCP server for external agents, running entirely on Cloudflare Workers</em></p>
</div>

Agentic Inbox lets you send, receive, and manage emails through a modern web interface -- all powered by your own Cloudflare account. Incoming emails arrive via [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/), each mailbox is isolated in its own [Durable Object](https://developers.cloudflare.com/durable-objects/) with a SQLite database, and attachments are stored in [R2](https://developers.cloudflare.com/r2/).

External AI tools (Claude Code, Cursor, etc.) can read your inbox, search conversations, and draft replies through the built-in **MCP server** at `/mcp` -- built with the [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/). This fork has no built-in AI agent and does not use Workers AI.

This repository is a fork of [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox).

![Agentic Inbox screenshot](./demo_app.png)


Read the blog post to learn more about Cloudflare Email Service and how to use it with the Agents SDK, MCP, and from the Wrangler CLI: [Email for Agents](https://blog.cloudflare.com/email-for-agents/).

## Setup

Follow the step-by-step guide with screenshots: **[docs/README.md](docs/README.md)**.
To connect an MCP client (Claude Code, Cursor and others), see [Step 10](docs/README.md#step-10-connect-an-mcp-client).

## Features

- **Full email client** — Send and receive emails via Cloudflare Email Routing with a rich text composer, reply/forward threading, folder organization, search, and attachments
- **Per-mailbox isolation** — Each mailbox runs in its own Durable Object with SQLite storage and R2 for attachments
- **MCP server** — Email tools for reading, searching, drafting, and sending, for external AI tools at `/mcp`; the side panel shows the connection details

## Stack

- **Frontend:** React 19, React Router v7, Tailwind CSS, Zustand, TipTap, `@cloudflare/kumo`
- **Backend:** Hono, Cloudflare Workers, Durable Objects (SQLite), R2, Email Routing
- **MCP:** Cloudflare Agents SDK (`McpAgent`)
- **Auth:** Cloudflare Access JWT validation (required outside local development)

## Local development

```bash
npm install
npm run dev
```

## Security

Any user who passes the shared Cloudflare Access policy can access all mailboxes in this app by design. This includes the MCP server at `/mcp` -- external AI tools (Claude Code, Cursor, etc.) connected via MCP can operate on any mailbox by passing a `mailboxId` parameter. There is no per-mailbox authorization; the Cloudflare Access policy is the single trust boundary.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────>│  Hono Worker     │────>│  MailboxDO      │
│  React SPA   │     │  (API + SSR)     │     │  (SQLite + R2)  │
│  MCP Panel   │     │                  │     └─────────────────┘
└──────────────┘     │  /mcp/* ─────────┼────>┌─────────────────┐
┌──────────────┐     │                  │     │  EmailMCP DO    │
│ External AI  │────>│                  │     │  (McpAgent)     │
│ tool via MCP │     │                  │     │  email tools    │
└──────────────┘     └──────────────────┘     └─────────────────┘
```

## License

Apache 2.0 -- see [LICENSE](LICENSE).
