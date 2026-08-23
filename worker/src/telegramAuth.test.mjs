import { verifyInitData } from './telegramAuth.ts'

async function hmacHex(key, message) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function buildInitData(botToken, fields) {
  const params = new URLSearchParams(fields)
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  const secretKeyHex = await hmacHex(new TextEncoder().encode('WebAppData'), botToken)
  const secretKeyBytes = Uint8Array.from(secretKeyHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
  const hash = await hmacHex(secretKeyBytes, dataCheckString)
  params.set('hash', hash)
  return params.toString()
}

const BOT_TOKEN = 'test-token-123'
const fresh = String(Math.floor(Date.now() / 1000))
const stale = String(Math.floor(Date.now() / 1000) - 25 * 60 * 60)

let failures = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}`)
  if (!cond) failures++
}

// valid signature -> accepted, correct user id extracted
{
  const initData = await buildInitData(BOT_TOKEN, {
    auth_date: fresh,
    user: JSON.stringify({ id: 424242, first_name: 'Test' }),
  })
  const userId = await verifyInitData(initData, BOT_TOKEN)
  check('valid initData is accepted', userId === 424242)
}

// tampered field -> rejected
{
  const initData = await buildInitData(BOT_TOKEN, {
    auth_date: fresh,
    user: JSON.stringify({ id: 1, first_name: 'A' }),
  })
  const tampered = initData.replace('first_name%22%3A%22A%22', 'first_name%22%3A%22B%22')
  const userId = await verifyInitData(tampered, BOT_TOKEN)
  check('tampered initData is rejected', userId === null)
}

// wrong bot token -> rejected
{
  const initData = await buildInitData(BOT_TOKEN, {
    auth_date: fresh,
    user: JSON.stringify({ id: 1, first_name: 'A' }),
  })
  const userId = await verifyInitData(initData, 'wrong-token')
  check('wrong bot token is rejected', userId === null)
}

// stale auth_date -> rejected
{
  const initData = await buildInitData(BOT_TOKEN, {
    auth_date: stale,
    user: JSON.stringify({ id: 1, first_name: 'A' }),
  })
  const userId = await verifyInitData(initData, BOT_TOKEN)
  check('stale (>24h) initData is rejected', userId === null)
}

// missing hash -> rejected
{
  const userId = await verifyInitData('auth_date=' + fresh + '&user=%7B%22id%22%3A1%7D', BOT_TOKEN)
  check('missing hash is rejected', userId === null)
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('\nAll checks passed')
