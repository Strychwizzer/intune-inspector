// Anmeldung (MSAL) und Microsoft-Graph-Zugriff. Ausschließlich lesende Aufrufe (GET bzw. $batch mit GET).
/* global msal */

const GRAPH = 'https://graph.microsoft.com';
// .default = genau die Rechte, denen in der App-Registrierung per Admin Consent zugestimmt wurde.
const SCOPES = ['https://graph.microsoft.com/.default'];

let pca = null;
let account = null;

export async function initAuth(clientId, tenant) {
  const authority = 'https://login.microsoftonline.com/' + (tenant && tenant.trim() ? tenant.trim() : 'organizations');
  pca = new msal.PublicClientApplication({
    auth: { clientId, authority, redirectUri: location.origin + '/redirect.html', navigateToLoginRequestUrl: false },
    cache: { cacheLocation: 'sessionStorage' },
    system: { allowNativeBroker: false }
  });
  await pca.initialize();
  const accounts = pca.getAllAccounts();
  account = accounts.length ? accounts[0] : null;
  return account;
}

export async function login() {
  const res = await pca.loginPopup({ scopes: SCOPES, prompt: 'select_account' });
  account = res.account;
  pca.setActiveAccount(account);
  return account;
}

export async function logout() {
  if (!pca) return;
  const acc = account;
  account = null;
  try { await pca.clearCache({ account: acc }); } catch (e) { /* ignore */ }
  sessionStorage.clear();
}

export function currentAccount() { return account; }

async function token() {
  if (!account) throw new Error('Nicht angemeldet');
  try {
    const r = await pca.acquireTokenSilent({ scopes: SCOPES, account });
    return r.accessToken;
  } catch (e) {
    const r = await pca.acquireTokenPopup({ scopes: SCOPES, account });
    return r.accessToken;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class GraphError extends Error {
  constructor(status, code, message, url) { super(message); this.status = status; this.code = code; this.url = url; }
}

async function request(method, url, body) {
  if (!url.startsWith('http')) url = GRAPH + url;
  for (let attempt = 0; attempt < 6; attempt++) {
    const t = await token();
    const res = await fetch(url, {
      method,
      headers: Object.assign({ Authorization: 'Bearer ' + t, Accept: 'application/json', ConsistencyLevel: 'eventual' }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 429 || res.status === 503 || res.status === 504) {
      const ra = parseInt(res.headers.get('Retry-After') || '0', 10);
      await sleep((ra > 0 ? ra * 1000 : 1500 * (attempt + 1)));
      continue;
    }
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok) {
      const err = (json && json.error) || {};
      throw new GraphError(res.status, err.code || '', err.message || ('HTTP ' + res.status), url);
    }
    return json;
  }
  throw new GraphError(429, 'TooManyRequests', 'Graph drosselt die Anfragen (zu viele Wiederholungen).', url);
}

export const get = (url) => request('GET', url);

// Alle Seiten einer Collection holen.
export async function getAll(url, firstPage) {
  let page = firstPage || await get(url);
  const out = (page && page.value) ? page.value.slice() : [];
  while (page && page['@odata.nextLink']) {
    page = await get(page['@odata.nextLink']);
    if (page && page.value) out.push(...page.value);
  }
  return out;
}

// Viele GETs über JSON-$batch (max. 20 pro Anfrage), mit Wiederholung gedrosselter Teilanfragen.
// paths: relative Pfade wie "/deviceManagement/…" (beta). Ergebnis: Map pfad → {status, body}
export async function batchGet(paths, onTick) {
  const results = new Map();
  let pending = paths.slice();
  for (let round = 0; round < 6 && pending.length; round++) {
    const chunks = [];
    for (let i = 0; i < pending.length; i += 20) chunks.push(pending.slice(i, i + 20));
    const retry = [];
    let maxWait = 0;
    const runChunk = async (chunk) => {
      const body = { requests: chunk.map((p, i) => ({ id: String(i), method: 'GET', url: p })) };
      const res = await request('POST', '/beta/$batch', body);
      for (const r of (res.responses || [])) {
        const p = chunk[parseInt(r.id, 10)];
        if (r.status === 429 || r.status === 503 || r.status === 504) {
          retry.push(p);
          const ra = parseInt((r.headers && (r.headers['Retry-After'] || r.headers['retry-after'])) || '0', 10);
          maxWait = Math.max(maxWait, ra > 0 ? ra * 1000 : 2000);
        } else {
          results.set(p, { status: r.status, body: r.body });
          if (onTick) onTick();
        }
      }
    };
    // 4 Batches parallel
    for (let i = 0; i < chunks.length; i += 4) {
      await Promise.all(chunks.slice(i, i + 4).map(runChunk));
    }
    pending = retry;
    if (pending.length) await sleep(maxWait * (round + 1));
  }
  for (const p of pending) results.set(p, { status: 429, body: { error: { message: 'gedrosselt' } } });
  // Folgeseiten nachladen
  for (const [p, r] of results) {
    if (r.status === 200 && r.body && r.body['@odata.nextLink']) {
      try { r.body.value = await getAll(null, r.body); delete r.body['@odata.nextLink']; } catch (e) { /* Teilergebnis behalten */ }
    }
  }
  return results;
}
