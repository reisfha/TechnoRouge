const { spawn } = require('node:child_process');
const fs = require('node:fs');
const _http = require('node:http');

const proc = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8000'], {
  env: { ...process.env, CI: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
  cwd: __dirname
});

let buf = '';
let foundUrl = false;

function handle(data) {
  const raw = data.toString();
  const clean = raw.replace(/\x1b\[[0-9;]*[a-zA-Z?]/g, '');
  process.stdout.write(clean);

  buf += clean;

  if (!foundUrl) {
    const m = buf.match(/exp:\/\/[^\s\r\n]+/);
    if (m) {
      foundUrl = true;
      console.log('\n\n╔══════════════════════════════════════════════════╗');
      console.log(`║  EXPO GO URL: ${m[0]}`);
      console.log('╚══════════════════════════════════════════════════╝\n');

      fs.writeFileSync('/tmp/expo-url.txt', m[0]);
    }
  }
}

proc.stdout.on('data', handle);
proc.stderr.on('data', handle);
proc.on('exit', (code) => {
  console.log('Expo exited with code', code);
  process.exit(code || 0);
});
