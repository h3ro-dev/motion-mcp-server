# Motion MCP Server

Connect AI assistants to [Motion](https://www.usemotion.com/) for task and project management.

## Installation

```bash
npm install -g @h3ro-dev/motion-mcp-server
```

## Quick Setup

### 1. Get Motion API Key
[Motion](https://app.usemotion.com) → Settings → API & Integrations → Create New API Key

### 2. Configure

<details>
<summary><strong>Claude Desktop</strong></summary>

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["-y", "@h3ro-dev/motion-mcp-server"],
      "env": {
        "MOTION_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Config location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
</details>

<details>
<summary><strong>Cursor</strong></summary>

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["-y", "@h3ro-dev/motion-mcp-server"],
      "env": {
        "MOTION_API_KEY": "your-api-key"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>VS Code (with Continue)</strong></summary>

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["-y", "@h3ro-dev/motion-mcp-server"],
      "env": {
        "MOTION_API_KEY": "your-api-key"
      }
    }
  }
}
```
</details>

### 3. Restart your AI assistant

## Features

- ✅ **All Motion APIs** - Tasks, projects, workspaces, users, comments, recurring tasks, schedules
- 🚦 **Smart Rate Limiting** - Automatic handling of Motion's 12 req/3min limit
- 💾 **Persistent State** - SQLite database maintains rate limits across restarts
- 🔍 **Clear Errors** - Helpful messages for debugging
- 📝 **Full TypeScript** - Type-safe and reliable

## Usage Examples

```
"List my tasks"
"Create task: Review budget, due Friday, high priority"
"Move task abc123 to Marketing workspace"
"Add comment to task xyz789: Waiting for approval"
"Create recurring task: Daily standup at 9am"
```

## Tools Reference

<details>
<summary><strong>Task Management (7 tools)</strong></summary>

| Tool | Description | Example |
|------|-------------|---------|
| `motion_list_tasks` | List tasks with filters | `workspaceId`, `status`, `assigneeId` |
| `motion_get_task` | Get task details | `taskId` |
| `motion_create_task` | Create new task | `name`, `workspaceId`, `dueDate`, `priority` |
| `motion_update_task` | Update task | `taskId`, `status`, `priority` |
| `motion_delete_task` | Delete task | `taskId` |
| `motion_move_task` | Move to workspace | `taskId`, `workspaceId` |
| `motion_unassign_task` | Remove assignee | `taskId` |
</details>

<details>
<summary><strong>Project Management (5 tools)</strong></summary>

| Tool | Description | Example |
|------|-------------|---------|
| `motion_list_projects` | List projects | `workspaceId` |
| `motion_get_project` | Get project details | `projectId` |
| `motion_create_project` | Create project | `name`, `workspaceId` |
| `motion_update_project` | Update project | `projectId`, `name` |
| `motion_archive_project` | Archive project | `projectId` |
</details>

<details>
<summary><strong>Other Tools (8 tools)</strong></summary>

| Tool | Description |
|------|-------------|
| `motion_list_workspaces` | List all workspaces |
| `motion_get_workspace` | Get workspace details |
| `motion_list_users` | List workspace users |
| `motion_get_current_user` | Get current user |
| `motion_list_comments` | List task comments |
| `motion_create_comment` | Add task comment |
| `motion_list_recurring_tasks` | List recurring tasks |
| `motion_create_recurring_task` | Create recurring task |
| `motion_delete_recurring_task` | Delete recurring task |
| `motion_list_schedules` | List schedules |
</details>

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MOTION_API_KEY` | ✅ | - | Your Motion API key |
| `MOTION_BASE_URL` | ❌ | `https://api.usemotion.com/v1` | API endpoint |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `180000` | Rate limit window (3 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `12` | Max requests per window |
| `DATABASE_PATH` | ❌ | `./motion-rate-limit.db` | SQLite database path |
| `DEBUG` | ❌ | `false` | Enable debug logging |

## Development

```bash
# Clone
git clone https://github.com/h3ro-dev/motion-mcp-server.git
cd motion-mcp-server

# Install
npm install

# Build
npm run build

# Test
npm test

# Run locally
MOTION_API_KEY=your-key npm start
```

## Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

**"Invalid API Key"**
- Check API key is correct
- Ensure no extra spaces
- Regenerate key if needed

**"Rate limit exceeded"**
- Server automatically handles this
- Wait time shown in error
- Check `DATABASE_PATH` is writable

**"Task not found"**
- Verify task ID exists
- Check workspace access
- Task may be archived
</details>

## License

MIT © h3ro-dev

## Links

- [GitHub](https://github.com/h3ro-dev/motion-mcp-server)
- [Motion API Docs](https://docs.usemotion.com/api)
- [MCP Protocol](https://modelcontextprotocol.io)