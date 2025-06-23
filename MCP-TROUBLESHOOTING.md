# MCP Troubleshooting - Hostinger & Supabase Setup

## Problem Summary
Setting up Hostinger API MCP and Supabase MCP servers for Claude Desktop. Hostinger works, Supabase fails consistently.

## Current Status
- ✅ **Hostinger MCP**: Working correctly (fixed by using npx instead of direct command) 
- ✅ **Supabase MCP**: Working correctly (fixed by adding MCP_API_KEY)

## Error Analysis from Logs

### Error Pattern 1: JSON Parse Error
```
Unexpected token 'O', "OCI runtim"... is not valid JSON
```
**Cause**: Docker daemon error message being passed to JSON parser instead of MCP response

### Error Pattern 2: Missing Environment Variable
```
Configuration error: Missing required environment variables: MCP_API_KEY
```
**Cause**: Wrong package being used - logs show we're still hitting the old `supabase-mcp` instead of `@supabase/mcp-server-supabase`

### Error Pattern 3: Container Restart Loop
```
Error response from daemon: Container c445c5ff7564... is restarting
```
**Cause**: Old Docker containers from previous attempts still running and interfering

## Configuration Evolution

### Attempt 1: Docker-based approach
```yaml
# docker-compose.yml
services:
  supabase-mcp:
    image: node:18-alpine
    command: npm install -g supabase-mcp && supabase-mcp
```
**Result**: Failed - package issues, wrong MCP server

### Attempt 2: NPX with wrong package
```json
{
  "command": "npx",
  "args": ["supabase-mcp"]
}
```
**Result**: Failed - used community package instead of official

### Attempt 3: Global installation wrong package
```bash
npm install -g supabase-mcp
```
**Result**: Failed - still wrong package

### Current Attempt: Official Supabase MCP
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--read-only",
    "--project-ref=umvrurelsxpxmyzcvrcd"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393"
  }
}
```
**Result**: Still failing - logs show old package being used

## Root Cause Analysis

### Why Hostinger Works vs Supabase Doesn't

**Hostinger Success Factors:**
1. Simple direct command: `hostinger-api-mcp`
2. Global npm installation worked: `npm install -g hostinger-api-mcp`
3. Simple environment variables: `APITOKEN` only
4. No complex arguments needed

**Supabase Failure Factors:**
1. Multiple packages exist: `supabase-mcp` vs `@supabase/mcp-server-supabase`
2. Complex argument structure needed
3. Mix of old Docker containers and new configs
4. Environment variable confusion

## Current System State Issues

### 1. Docker Container Pollution
Old containers are still running and Claude Desktop might be hitting them:
```bash
docker ps
# Shows old supabase-mcp containers restarting
```

### 2. Package Cache Issues
NPX might be caching the wrong package or Claude Desktop is using cached paths.

### 3. Environment Variable Inheritance
Claude Desktop might be inheriting environment variables from shell that override our config.

## Next Steps for Resolution

### 1. Clean Slate Approach
- Stop all Docker containers
- Clear npm/npx cache
- Remove all old MCP configurations
- Start with minimal working config

### 2. Verify Package Availability
Test the official Supabase MCP package directly:
```bash
npx -y @supabase/mcp-server-supabase@latest --help
```

### 3. Debug Claude Desktop MCP Loading
- Check Claude Desktop logs for MCP initialization
- Verify which commands are actually being executed
- Test with minimal configuration first

### 4. Alternative Approach: Local Installation
Instead of npx, try global installation of official package:
```bash
npm install -g @supabase/mcp-server-supabase@latest
```

## Configuration Files Status

### Current claude-desktop-config.json
```json
{
  "mcpServers": {
    "hostinger-api": {
      "command": "hostinger-api-mcp",
      "args": [],
      "env": {
        "DEBUG": "false",
        "APITOKEN": "SA1fE8frvZ5hv7pb1GveWvc9Fy7o3uQHHmxEK0KF0d8588fc"
      }
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=umvrurelsxpxmyzcvrcd"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393"
      }
    }
  }
}
```

## Key Insights
1. **Docker approach was overcomplication** - direct npm packages work better
2. **Package naming is critical** - community vs official packages behave differently  
3. **Environment pollution** - old attempts leave behind running processes
4. **Claude Desktop caching** - may need to clear MCP server cache/restart

## ✅ WORKING SOLUTIONS (2025-06-23)

### Hostinger MCP Fix
**Problem**: `spawn hostinger-api-mcp ENOENT` - Claude Desktop couldn't find globally installed package
**Root Cause**: Global npm packages not in Claude Desktop's PATH
**Solution**: Use npx instead of direct command
```bash
npm install -g hostinger-api-mcp  # Still needed for package availability
```
**Working Configuration**:
```json
"hostinger-api": {
  "command": "npx",
  "args": ["-y", "hostinger-api-mcp"],
  "env": {
    "DEBUG": "false",
    "APITOKEN": "SA1fE8frvZ5hv7pb1GveWvc9Fy7o3uQHHmxEK0KF0d8588fc"
  }
}
```
**Key Learning**: Even with global installation, Claude Desktop may not find packages in PATH. Using `npx -y` ensures the package is found and executed correctly.

### Supabase MCP Fix
**Problem**: `Configuration error: Missing required environment variables: MCP_API_KEY`
**Solution**: Add the missing MCP_API_KEY environment variable
```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--read-only",
    "--project-ref=umvrurelsxpxmyzcvrcd"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393",
    "MCP_API_KEY": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393"
  }
}
```

### Key Success Factors
1. **Hostinger**: Use npx instead of direct command to avoid PATH issues
2. **Supabase**: Official package works but needs both SUPABASE_ACCESS_TOKEN and MCP_API_KEY (same value)
3. **No Docker needed**: Direct npm/npx approach is simpler and more reliable
4. **PATH Issues**: Claude Desktop has limited PATH access - npx solves this universally

## Final Working Configuration (2025-06-23)
```json
{
  "mcpServers": {
    "hostinger-api": {
      "command": "npx",
      "args": ["-y", "hostinger-api-mcp"],
      "env": {
        "DEBUG": "false",
        "APITOKEN": "SA1fE8frvZ5hv7pb1GveWvc9Fy7o3uQHHmxEK0KF0d8588fc"
      }
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=umvrurelsxpxmyzcvrcd"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393",
        "MCP_API_KEY": "sbp_c7756a58f0dbfea6ad38c056e436e16030ae0393"
      }
    }
  }
}
```

## Lessons Learned
1. **Always use npx for MCP servers** - Avoids PATH issues with Claude Desktop
2. **Check official documentation** - Community packages may have different requirements
3. **Environment variables matter** - Some packages need duplicate env vars with different names
4. **Restart Claude Desktop** - Changes require full application restart
5. **Check logs systematically** - Error patterns reveal root causes

## Immediate Action Plan
1. ✅ Clean all Docker containers
2. ✅ Test official Supabase package directly
3. ✅ Use minimal configuration
4. ✅ Verify Claude Desktop is using correct commands
5. ✅ Fix PATH issues with npx approach
6. ✅ Document working solutions