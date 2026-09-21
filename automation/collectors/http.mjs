const LIMIT = 5_000_000;
export async function fetchText(url, fetcher = fetch, headers = {}) {
  const response = await fetcher(url, {
    signal: AbortSignal.timeout(25000), redirect: 'error',
    headers: {'User-Agent':'AIChronicle/0.1 (+https://github.com/maxzyma/aichronicle)', ...headers},
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > LIMIT) throw new Error('Response exceeds size limit');
  if (!response.body) throw new Error('Empty response body');
  const reader = response.body.getReader();
  let chunks = [];
  let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LIMIT) throw new Error('Response exceeds size limit');
      chunks = [...chunks,value];
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks).toString('utf8');
}
