#!/usr/bin/env node
/**
 * Inicia simultáneamente el Backend (NestJS en puerto 4000) y el Frontend (Next.js en puerto 3000)
 */
import { spawn } from 'child_process';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Iniciando Backend (NestJS -> http://localhost:4000/api/v1) y Frontend (Next.js -> http://localhost:3000)...\n');

const backend = spawn(npmCmd, ['run', 'dev:backend'], {
  stdio: 'inherit',
  shell: isWin,
});

const frontend = spawn(npmCmd, ['run', 'dev:frontend'], {
  stdio: 'inherit',
  shell: isWin,
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});
