// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Fork note: the built-in AI agent was removed. This panel now only shows
// MCP connection details for external agents.
import MCPPanel from "./MCPPanel";

export default function AgentSidebar() {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<MCPPanel />
		</div>
	);
}
