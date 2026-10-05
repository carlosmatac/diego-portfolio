// Renders both formats with Remotion into out/, then encodes web versions into the site's public/video/
// (smaller size, yuv420p, faststart) plus a poster of the last frame. Uses the system Chrome when available.
// Needs ffmpeg. `--encode-only` skips rendering and re-encodes the masters already in out/.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { DURATION } from './src/data.ts';

const site = '../public/video';
mkdirSync(site, { recursive: true });
mkdirSync('out', { recursive: true });
const chrome = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
const browser = chrome ? [`--browser-executable=${chrome}`] : [];
const remotion = (...args) => execFileSync('npx', ['remotion', ...args, ...browser], { stdio: 'inherit' });
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const encodeOnly = process.argv.includes('--encode-only');

const formats = [
  { id: 'RouteWide', name: 'route-wide', width: 1600 },
  { id: 'RouteTall', name: 'route-tall', width: 900 },
];

if (!encodeOnly) remotion('bundle', 'src/index.ts', '--out-dir', 'build');
for (const f of formats) {
  if (!encodeOnly) {
    remotion('render', 'build', f.id, `out/${f.name}.mp4`, '--codec=h264', '--crf=16', '--muted');
    remotion('still', 'build', f.id, `out/${f.name}.png`, `--frame=${DURATION - 1}`);
  }
  const scale = `scale=${f.width}:-2:flags=lanczos`;
  ffmpeg('-i', `out/${f.name}.mp4`, '-vf', `${scale},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '32',
    '-tune', 'animation', '-movflags', '+faststart', '-an', `${site}/${f.name}.mp4`);
  ffmpeg('-i', `out/${f.name}.png`, '-vf', scale, '-q:v', '4', `${site}/${f.name}.jpg`);
}
