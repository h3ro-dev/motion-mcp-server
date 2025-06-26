# Motion MCP Server

A comprehensive Model Context Protocol (MCP) server for [Motion](https://www.usemotion.com/) API integration, enabling AI assistants to manage tasks, projects, and workflows through Motion.

## Features

### ✅ Complete Motion API Coverage
- **Task Management**: Create, update, delete, move, assign/unassign tasks
- **Project Management**: Create, update, archive projects with custom statuses
- **Workspace & User Management**: List workspaces, users, and current user info
- **Comments & Collaboration**: Add and view task comments with Markdown support
- **Recurring Tasks**: Create recurring tasks with flexible scheduling patterns
- **Schedule Management**: View workspace schedules and availability

### 🚀 Production-Ready
- **Built-in Rate Limiting**: Respects Motion's 12 requests/3 minutes limit
- **Persistent Tracking**: SQLite database for rate limit state persistence
- **Comprehensive Error Handling**: Clear error messages for common issues
- **TypeScript**: Strict type checking for reliability
- **Structured Logging**: Debug mode for troubleshooting

### 🔧 Easy Integration
- Works with Claude Desktop, Cursor, and any MCP-compatible AI assistant
- Simple environment variable configuration
- Comprehensive tool descriptions for AI understanding

## Quick Start

### 1. Install the package

```bash
npm install -g @h3ro-dev/motion-mcp-server
```

### 2. Get your Motion API Key

1. Log in to [Motion](https://app.usemotion.com)
2. Go to Settings → API & Integrations
3. Click "Create New API Key"
4. Give it a name and click "Create"
5. Copy the API key (you won't be able to see it again!)

### 3. Configure your AI assistant

#### For Claude Desktop

Add to your Claude Desktop config:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "motion": {
      "command": "motion-mcp-server",
      "env": {
        "MOTION_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### For Cursor

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "motion": {
      "command": "motion-mcp-server",
      "env": {
        "MOTION_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. Restart your AI assistant

The Motion tools will now be available!

## Example Usage

Once configured, you can use natural language to interact with Motion:

### Task Management
```
"List all my tasks for today"
"Create a task 'Review Q4 budget' due next Friday with high priority"
"Move the 'Website redesign' task to the Marketing workspace"
"Mark task ID abc123 as completed"
"Assign the 'Code review' task to john@company.com"
```

### Project Management
```
"Create a new project called 'Product Launch Q1' in the Marketing workspace"
"List all projects in my workspace"
"Archive the 'Old Campaign' project"
```

### Recurring Tasks
```
"Create a daily standup task at 9 AM starting tomorrow"
"Set up a weekly report every Friday at 3 PM"
"Create a monthly team meeting on the first Monday of each month"
"Delete the recurring task for daily emails"
```

### Collaboration
```
"Add a comment to task abc123 saying 'Waiting on design approval'"
"Show me all comments on the 'Website redesign' task"
```

## Available Tools

| Tool | Description |
|------|-------------|
| `motion_list_tasks` | List tasks with filtering by workspace, project, assignee, status, or label |
| `motion_get_task` | Get detailed information about a specific task |
| `motion_create_task` | Create a new task with full configuration options |
| `motion_update_task` | Update task properties including name, status, priority, etc. |
| `motion_delete_task` | Delete a task permanently |
| `motion_move_task` | Move a task to a different workspace |
| `motion_unassign_task` | Remove assignee from a task |
| `motion_list_projects` | List all projects in a workspace |
| `motion_get_project` | Get detailed project information |
| `motion_create_project` | Create a new project |
| `motion_update_project` | Update project details |
| `motion_archive_project` | Archive a project |
| `motion_list_workspaces` | List all accessible workspaces |
| `motion_get_workspace` | Get workspace details |
| `motion_list_users` | List users in a workspace |
| `motion_get_current_user` | Get current authenticated user info |
| `motion_list_comments` | List comments on a task |
| `motion_create_comment` | Add a comment to a task |
| `motion_list_recurring_tasks` | List recurring task templates |
| `motion_create_recurring_task` | Create a recurring task |
| `motion_delete_recurring_task` | Delete a recurring task template |
| `motion_list_schedules` | List workspace schedules |

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOTION_API_KEY` | Your Motion API key (required) | - |
| `MOTION_BASE_URL` | Motion API base URL | `https://api.usemotion.com/v1` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `180000` (3 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `12` |
| `DATABASE_PATH` | SQLite database path | `./motion-rate-limit.db` |
| `DEBUG` | Enable debug logging | `false` |

## Development

### Building from source

```bash
# Clone the repository
git clone https://github.com/h3ro-dev/motion-mcp-server.git
cd motion-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Running locally

```bash
# Set your API key
export MOTION_API_KEY=your-api-key

# Run the server
npm start
```

### Project Structure

```
motion-mcp-server/
├── src/
│   ├── config/         # Configuration management
│   ├── lib/            # Core libraries (client, logger)
│   ├── rate-limit/     # Rate limiting implementation
│   ├── tools/          # MCP tool implementations
│   │   ├── tasks/      # Task management tools
│   │   ├── projects/   # Project management tools
│   │   ├── workspaces/ # Workspace tools
│   │   ├── users/      # User management tools
│   │   ├── comments/   # Comment tools
│   │   ├── recurring-tasks/ # Recurring task tools
│   │   └── schedules/  # Schedule tools
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Main server entry point
├── tests/              # Test files
└── README.md           # This file
```

## Error Handling

The server provides clear error messages for common scenarios:

- **Invalid API Key**: Check your Motion API key is correct
- **Rate Limit Exceeded**: Wait for the suggested retry time
- **Resource Not Found**: Verify the resource ID exists
- **Invalid Parameters**: Check the parameter format and requirements
- **Network Errors**: Verify your internet connection

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/h3ro-dev/motion-mcp-server/issues)
- **Motion API Docs**: [Motion API Documentation](https://docs.usemotion.com/api)
- **MCP Docs**: [Model Context Protocol](https://modelcontextprotocol.io)

## Acknowledgments

Built with the [Model Context Protocol SDK](https://github.com/anthropics/model-context-protocol) by Anthropic.