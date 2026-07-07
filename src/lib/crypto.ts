export async function sha256(str: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return '0x' + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i) | 0;
    }
    return '0x' + (h >>> 0).toString(16).padStart(8, '0') + '…';
  }
}

export function shortHash(hash: string, size = 10): string {
  if (!hash) return '-';
  if (hash.length <= size * 2) return hash;
  return `${hash.slice(0, size)}...${hash.slice(-6)}`;
}

export function makeId(prefix = 'id'): string {
  const randomPart = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}
