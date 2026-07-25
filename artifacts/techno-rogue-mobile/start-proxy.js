const { spawn } = require('child_process');
const http = require('http');

const proc = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8000'], {
  env: { ...process.env, CI: '1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelReady = false;

function handle(data) {
  const raw = data.toString();
  process.stdout.write(raw);

  if (!tunnelReady && raw.includes('Tunnel ready')) {
    tunnelReady = true;
    setTimeout(fetchTunnelUrl, 1000);
  }
}

function fetchTunnelUrl() {
  http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        const tunnel = data.tunnels && data.tunnels[0];
        if (tunnel && tunnel.public_url) {
          const ngrokUrl = tunnel.public_url;
          const expUrl = ngrokUrl.replace('https://', 'exp://').replace('http://', 'exp://');
          console.log('\n\n╔══════════════════════════════════════════════════╗');
          console.log('║  EXPO GO URL: ' + expUrl);
          console.log('╚══════════════════════════════════════════════════╝\n');
        }
      } catch (e) {
        console.error('Could not parse ngrok API:', e.message);
      }
    });
  }).on('error', (e) => {
    console.error('Could not reach ngrok API:', e.message);
    // Retry
    setTimeout(fetchTunnelUrl, 2000);
  });
}

proc.stdout.on('data', handle);
proc.stderr.on('data', handle);
proc.on('exit', (code) => process.exit(code || 0));
