import { spawn } from 'child_process';
import * as path from 'path';

console.log("🚀 Starting Local Fetch...");

// Use the new npm script we defined
const child = spawn('npm', ['run', 'fetch'], {
    shell: true,
    stdio: 'inherit', // Pipe output to parent
    cwd: process.cwd()
});

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});

child.on('error', (err) => {
    console.error("Failed to start subprocess.", err);
});
