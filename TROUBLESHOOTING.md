# Troubleshooting Guide

## Issue: "EACCES: permission denied" when starting server

This is a common Windows issue. Here are the solutions:

### Solution 1: Run PowerShell as Administrator (RECOMMENDED)

1. **Right-click** on PowerShell
2. Select **"Run as Administrator"**
3. Navigate to project:
   ```powershell
   cd "C:\Users\Utopia\OneDrive\Documents\AI Stuffzzxc\Portfolio - Azure Open AI\chat-interface"
   ```
4. Run:
   ```powershell
   npm run dev
   ```

### Solution 2: Use the Batch File

1. **Right-click** on `START_SERVER.bat`
2. Select **"Run as Administrator"**
3. If Windows Firewall prompts, click **"Allow Access"**

### Solution 3: Configure Windows Firewall

1. Open **Windows Defender Firewall**
2. Click **"Allow an app or feature through Windows Defender Firewall"**
3. Click **"Change settings"** (requires admin)
4. Click **"Allow another app"**
5. Browse to: `C:\Program Files\nodejs\node.exe`
6. Click **"Add"**
7. Make sure both **Private** and **Public** are checked
8. Click **OK**

Then try running `npm run dev` again.

### Solution 4: Disable Windows Defender Firewall Temporarily

**WARNING: Only for testing purposes**

1. Open **Windows Security**
2. Go to **Firewall & network protection**
3. Click on your active network (Private/Public)
4. Turn **Windows Defender Firewall** to **Off**
5. Try running the server
6. **Remember to turn it back ON after testing**

### Solution 5: Use Different Port

Try using a different port that might not be blocked:

```bash
npx next dev -p 8080
```

Then access at: `http://localhost:8080`

### Solution 6: Check Antivirus Software

Your antivirus might be blocking Node.js:

1. Open your antivirus software
2. Add Node.js to the whitelist/exceptions
3. Location: `C:\Program Files\nodejs\node.exe`

### Solution 7: Reserve Port (Advanced)

Run in Administrator Command Prompt:
```cmd
netsh http add urlacl url=http://+:3000/ user=Everyone
```

Then try running the server.

### Still Not Working?

Try creating a new Next.js app in a different location to test if it's a project-specific issue:

```bash
cd C:\temp
npx create-next-app@latest test-app
cd test-app
npm run dev
```

If this works, the issue is with your OneDrive folder permissions.

## OneDrive Sync Issues

If your project is in OneDrive (which it is), this can cause permission issues:

### Option A: Move Project Out of OneDrive

1. Copy the `chat-interface` folder to `C:\Projects\` or `C:\Dev\`
2. Update environment variables if needed
3. Run the server from the new location

### Option B: Exclude from OneDrive Sync

1. Right-click the `chat-interface` folder
2. Select **"Free up space"**
3. Or exclude the `node_modules` and `.next` folders from sync

## Checking What's Using Port 3000

Run in Command Prompt:
```cmd
netstat -ano | findstr :3000
```

If you see a process, note the PID (last column) and kill it:
```cmd
taskkill /PID <PID> /F
```

## Success Indicators

When the server starts successfully, you should see:
```
✓ Ready in 2.3s
○ Local:    http://localhost:3000
```

## Getting Help

If none of these solutions work:
1. Check the error message carefully
2. Google the specific error code
3. Check Next.js GitHub issues
4. Ensure you're using Node.js 20+ (`node --version`)
