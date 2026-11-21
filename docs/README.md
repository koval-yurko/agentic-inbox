# Setup guide

This guide shows how to deploy Agentic Inbox to your Cloudflare account, step by step.
The screenshots come from a real setup of this fork with the domain `kovalchuk.win` and the app URL `inbox.kovalchuk.win`.
Replace these values with your own domain.

## Index

- [What you need](#what-you-need)
- [Step 1: Set the domain in wrangler.jsonc](#step-1-set-the-domain-in-wranglerjsonc)
- [Step 2: Create the Worker from your repository](#step-2-create-the-worker-from-your-repository)
- [Step 3: Check the deploy](#step-3-check-the-deploy)
- [Step 4: Turn on Cloudflare Access](#step-4-turn-on-cloudflare-access)
- [Step 5: Add the Access secrets](#step-5-add-the-access-secrets)
- [Step 6: Receive email with Email Routing](#step-6-receive-email-with-email-routing)
- [Step 7: Send email with Email Sending](#step-7-send-email-with-email-sending)
- [Step 8: Check the custom domain](#step-8-check-the-custom-domain)
- [Step 9: Test the app](#step-9-test-the-app)
- [Step 10: Connect an MCP client](#step-10-connect-an-mcp-client)
  - [10.1 Turn on Managed OAuth](#101-turn-on-managed-oauth)
  - [10.2 Connect a client with OAuth](#102-connect-a-client-with-oauth)
  - [10.3 Create a service token](#103-create-a-service-token)
  - [10.4 Allow the token in the Access application](#104-allow-the-token-in-the-access-application)
  - [10.5 Use the service token](#105-use-the-service-token)
- [Logs](#logs)
- [Troubleshooting](#troubleshooting)

## What you need

- A Cloudflare account.
- A domain that uses Cloudflare DNS (a zone in your account). In this guide, the domain is `yourdomain.com`.
- A GitHub fork of this repository.

## Step 1: Set the domain in `wrangler.jsonc`

Edit `wrangler.jsonc` in your fork, and push the change to `main`.

```jsonc
"workers_dev": false,
"routes": [
    { "pattern": "inbox.yourdomain.com", "custom_domain": true }
],
"vars": {
    "DOMAINS": "yourdomain.com",
    "EMAIL_ADDRESSES": []
},
```

- `DOMAINS` is the domain that receives email. The app accepts mail for any address on it, for example `hello@yourdomain.com`.
- `routes` attaches the custom domain `inbox.yourdomain.com` to the Worker on each deploy.
- `workers_dev: false` turns off the public `*.workers.dev` URL.

> **Important:** Set `DOMAINS` in `wrangler.jsonc`, not only in the dashboard. Each deploy replaces dashboard variables with the values from `wrangler.jsonc`. Secrets are not replaced.

## Step 2: Create the Worker from your repository

1. In the dashboard, open **Workers & Pages** and click **Create application**.
2. Select **Continue with GitHub**, and then select your fork.
3. Set **Build command** to `npm run build` and **Deploy command** to `npx wrangler deploy`.
4. Click **Deploy**.

![Set up your application](images/01-create-worker-from-repo.png)

Or click this button. It copies this repository to your GitHub account and creates the Worker:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/koval-yurko/agentic-inbox)

If your repository is not in the list, the Cloudflare GitHub app has no access to it.
On GitHub, open **Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages**, and give it access to the repository.

## Step 3: Check the deploy

The first deploy creates the R2 bucket and the Durable Objects.
Open the Worker **Overview** tab. The **Bindings** box shows `BUCKET`, `EMAIL`, `EMAIL_MCP` and `MAILBOX`.

![Worker overview with bindings](images/02-worker-overview-bindings.png)

Open **Settings → Builds**. Make sure that the Git repository is your fork and the production branch is `main`.
After this step, each push to `main` starts a new build and deploy.

![Build settings](images/03-build-settings.png)

**Settings → Variables and secrets** shows the variables from `wrangler.jsonc` and the bindings.

![Variables and bindings](images/04-variables-and-bindings.png)

## Step 4: Turn on Cloudflare Access

The app does not start in production without Cloudflare Access. It returns an error until you do this step.

1. Open the Worker **Access** tab, and click **Protect this Worker behind Access**.

   ![Protect this Worker behind Access](images/05-access-protect-worker.png)

2. In **Scope**, select **All traffic**. The default value, **Previews only**, does not protect production.
3. In **Authentication policy**, add a policy. For example, select **Cloudflare account members**.
4. Click **Apply Access**.

   ![Manage Worker access](images/06-access-scope-all-traffic.png)

5. The next dialog shows 2 values: `POLICY_AUD` and `TEAM_DOMAIN`. Copy them.

## Step 5: Add the Access secrets

1. Open **Settings → Variables and secrets**, and click **Add variable**.
2. Add `POLICY_AUD` and `TEAM_DOMAIN` with the values from Step 4.
3. Select **Secret** for each value.
4. Click **Add 2 variables and deploy**.

![Add the Access secrets](images/07-access-secrets.png)

`TEAM_DOMAIN` can be the team URL (`https://<team>.cloudflareaccess.com`) or the full `.../cdn-cgi/access/certs` URL.

## Step 6: Receive email with Email Routing

1. Open your domain, and then open **Email → Email Routing**. Turn on Email Routing.
2. Open the **Settings** tab. If the DNS records show **Missing**, click **Add missing records**.

   ![Email Routing DNS records](images/08-email-routing-dns.png)

3. Open the **Routing rules** tab. Edit the **Catch-all** rule:
   - Set **Action** to **Send to a Worker**.
   - Set **Destination** to your Worker (`agentic-inbox`).
4. Make sure that the rule status is **Active**.

   ![Catch-all rule to the Worker](images/09-email-routing-catch-all.png)

## Step 7: Send email with Email Sending

The Worker sends email through the `EMAIL` binding. The domain must be onboarded to Email Sending.

1. Open **Compute → Email Service → Email Sending**, and click **Onboard Domain**.
2. Select your domain, and click **Continue**.
3. Review the DNS records, and click **Activate**.

   ![Email Sending DNS records](images/10-email-sending-dns.png)

4. Wait until **Sending status** is **Enabled** and **DNS records** is **Configured**.

   ![Email Sending is enabled](images/11-email-sending-enabled.png)

## Step 8: Check the custom domain

Open the Worker **Domains** tab. The custom domain from `wrangler.jsonc` shows with the type **Production**.
The **Worker URL** switches are off, because `workers_dev` is `false`.

![Custom domain](images/12-custom-domain.png)

A custom domain is not a Worker route. It does not show on the zone **Workers Routes** page.
It shows here, and in the zone DNS records as a read-only record of type **Worker**.

## Step 9: Test the app

1. Open `https://inbox.yourdomain.com`. Cloudflare Access asks you to log in.

   ![Cloudflare Access login](images/13-access-login.png)

2. After you log in, click **New Mailbox**, and create a mailbox, for example `test@yourdomain.com`.

   ![Mailboxes](images/14-mailboxes.png)

3. Send an email to the new address from an external mailbox. The email shows in **Inbox**.
4. Click **Compose**, and send an email to an external address. Make sure that it arrives.

![Inbox with the MCP panel](images/15-inbox-and-mcp.png)

The panel on the right shows the MCP server URL (`https://inbox.yourdomain.com/mcp`) and the available tools.
The `/mcp` endpoint is also behind Access. An external MCP client connects with OAuth or with an Access service token. See [Step 10](#step-10-connect-an-mcp-client).

> **Note:** Some screenshots hide account names and `workers.dev` URLs with grey boxes.

## Step 10: Connect an MCP client

The MCP server is at `https://inbox.yourdomain.com/mcp`. It uses the Streamable HTTP transport.
Cloudflare Access protects it. There are 2 ways to connect:

- **OAuth (recommended for people):** Claude Code, Cursor and other MCP clients connect with the URL only. A browser login opens 1 time. See 10.1 and 10.2.
- **Service token (for scripts and CI):** the client sends 2 headers with each request. No browser login is necessary. See 10.3 to 10.5.

In both cases, Access adds a signed JWT (`Cf-Access-Jwt-Assertion`) to the request, and the Worker accepts it. No code change is necessary.

> **Warning:** Each connected client can read and send email from **all** mailboxes. The app has no access control for each mailbox.

### 10.1 Turn on Managed OAuth

Managed OAuth makes Access a standard OAuth server for the app. It is a Beta feature.

1. Open **Zero Trust → Access controls → Applications**. Find the application that Step 4 created. Its name is similar to `agentic-inbox - Cloudflare Workers`.
2. Open the **Additional settings** tab, and click the **OAuth** filter.
3. Turn on **Managed OAuth**. Keep **Allow localhost clients** and **Allow loopback clients** on. Claude Code and other local clients use these redirect URIs.
4. Add redirect URIs for clients that do not use `localhost` or `127.0.0.1`. Under **Allowed redirect URIs**, click **+ Add URI**, and enter the exact URI. Add 1 URI for each client:
   - Claude connectors (claude.ai, Claude Desktop, Claude mobile): `https://claude.ai/api/mcp/auth_callback` and `https://claude.com/api/mcp/auth_callback`. Add both.
   - Cursor: `cursor://anysphere.cursor-mcp/oauth/callback`.

   Custom-scheme URIs must match exactly. HTTP and HTTPS URIs can end with `/*` to match all paths. Claude Code does not need this step, because it uses `localhost`.
5. Click **Save**.

The screenshot shows Managed OAuth on, the 2 localhost switches, and the 2 Claude redirect URIs in **Allowed redirect URIs**:

![Managed OAuth is on](images/18-managed-oauth.png)

After this change:

- A request to `/mcp` without credentials gets `401` with `WWW-Authenticate: Bearer ... resource_metadata=...`. Before, it got `302` to the login page.
- `https://inbox.yourdomain.com/.well-known/oauth-authorization-server` shows the OAuth endpoints, including `registration_endpoint` for dynamic client registration.
- The web UI still sends the browser to the Access login page, as before.

### 10.2 Connect a client with OAuth

**Claude Code:**

```bash
claude mcp add --transport http agentic-inbox https://inbox.yourdomain.com/mcp
```

Then run `/mcp` in Claude Code, select `agentic-inbox`, and select **Authenticate**. The Access login page opens in the browser. Log in with the same account as for the web UI.

After the login, Access shows an **Authorize Client** page. It shows the client name and its redirect URL. Click **Allow**. The client gets an access token (15 minutes) and a refresh token, and it renews the access token without a new login.

![Authorize Client page](images/19-oauth-consent.png)

> **Warning:** Click **Allow** only for clients that you started yourself. Each allowed client can read and send email from all mailboxes. To remove the access later, use the link at the bottom of the page.

**Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "agentic-inbox": {
      "url": "https://inbox.yourdomain.com/mcp"
    }
  }
}
```

A client that uses a custom-scheme redirect URI, for example `cursor://anysphere.cursor-mcp/oauth/callback`, needs that URI in **Allowed redirect URIs** (Step 10.1).

**Claude connector** (claude.ai, Claude Desktop, Claude mobile):

1. Make sure that the 2 Claude redirect URIs are in **Allowed redirect URIs** (Step 10.1, step 4).
2. In Claude, open **Settings → Connectors**, and click **Add custom connector**.
3. Enter a name, for example `agentic-inbox`, and the URL `https://inbox.yourdomain.com/mcp`. Leave the OAuth client ID and secret empty. Claude registers itself.
4. Click **Add**, and then click **Connect**. Log in to Access, and click **Allow** on the **Authorize Client** page.

The connector is in your Claude account, so it also works in Claude Desktop and Claude mobile.

### 10.3 Create a service token

1. Open **Zero Trust → Access controls → Service credentials → Service Tokens**, and click **Create Service Token**.
2. Enter a name, for example `agentic-inbox-mcp`, and select a duration.
3. Copy the **Client ID** and the **Client Secret**.

> **Warning:** Cloudflare shows the Client Secret only 1 time. Keep it in a password manager or in a local `.env` file. Do not put it in the repository.

![Service token](images/16-service-token.png)

### 10.4 Allow the token in the Access application

1. Open the application from Step 10.1, and open the **Policies** section.
2. Click **Create new policy**, and set:
   - **Action:** `Service Auth`. Do not use `Allow`, because `Allow` sends the client to the login page.
   - **Include:** `Service Token` → `agentic-inbox-mcp`.
3. Save the policy, and save the application. Keep the current login policy, so that the browser login continues to work.

![Access policies with the Service Auth policy](images/17-service-auth-policy.png)

### 10.5 Use the service token

**Claude Code:**

```bash
claude mcp add --transport http agentic-inbox https://inbox.yourdomain.com/mcp \
  --header "CF-Access-Client-Id: <client-id>" \
  --header "CF-Access-Client-Secret: <client-secret>"
```

**Other clients** that accept a URL with headers:

```json
{
  "mcpServers": {
    "agentic-inbox": {
      "url": "https://inbox.yourdomain.com/mcp",
      "headers": {
        "CF-Access-Client-Id": "<client-id>",
        "CF-Access-Client-Secret": "<client-secret>"
      }
    }
  }
}
```

To keep the values out of your shell history, put them in a `.env` file as `MCP_CLIENT_ID` and `MCP_CLIENT_SECRET`, and load it with [direnv](https://direnv.net/) (`echo dotenv > .envrc && direnv allow`). Then test the connection:

```bash
curl -i -X POST https://inbox.yourdomain.com/mcp \
  -H "CF-Access-Client-Id: $MCP_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $MCP_CLIENT_SECRET" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

A good result is HTTP `200` with an MCP response.

In the MCP client, call `list_mailboxes` first. The other tools need a `mailboxId`, for example `test@yourdomain.com`.

For local development, `npm run dev` does not use Access. A local client can use `http://localhost:<port>/mcp` with no headers.

## Logs

- Open the Worker **Observability** tab to see the logs in the dashboard.
- Or run `npx wrangler tail agentic-inbox` to see live logs in a terminal.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Cloudflare Access must be configured in production` | `POLICY_AUD` or `TEAM_DOMAIN` is not set. Do Step 4 and Step 5. |
| `Invalid or expired Access token` | The secrets are wrong. Turn Access off and on again, and set the new values. |
| A push to `main` does not start a build | The Cloudflare GitHub app has no access to the repository. See Step 2. |
| An email does not arrive | Check that the catch-all rule is **Active** (Step 6). Check that the mailbox exists in the app. The Worker ignores mail for addresses without a mailbox. |
| A dashboard variable changes back after a deploy | Set the value in `wrangler.jsonc` (Step 1). |
| The MCP client gets `302` to a login page | Managed OAuth is off (Step 10.1). For a service token, the policy must use the action `Service Auth` (Step 10.4). |
| The MCP client gets `401` with `WWW-Authenticate: Bearer` | The client has no valid credentials. Run the OAuth login again (Step 10.2), or check the service token headers (Step 10.5). |
| The MCP client gets `403 Invalid or expired Access token` | The token belongs to a different Access application. Add it to the application of the Worker (Step 10.4). |
| Claude shows `Couldn’t register with agentic-inbox’s sign-in service` | Access rejected the client registration with `redirect_uri is not allowed by the account configuration`. Add the 2 Claude redirect URIs to **Allowed redirect URIs** (Step 10.1). The change can take up to 1 minute. Then click **Connect** again. |
