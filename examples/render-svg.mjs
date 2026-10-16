import { renderAvatarSvg } from '../src/index.mjs';

const agentId = process.argv[2] ?? '33cf1aae-3a51-452d-b761-34a6ccb62201';
const state = process.argv[3] ?? 'idle';
const time = Number(process.argv[4] ?? 0);
process.stdout.write(`${renderAvatarSvg({ agentId, state, time, main: true, size: 240, id: 'once' })}\n`);
