/* lazy-load third-party browser SDKs (Razorpay Checkout, Facebook JS SDK) once */
const cache = new Map<string, Promise<void>>();
export function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  if (!cache.has(src)) cache.set(src, new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true; for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.onload = () => res(); s.onerror = () => { cache.delete(src); rej(new Error('Could not load ' + new URL(src).host + ' — check your connection or ad-blocker')); };
    document.head.appendChild(s);
  }));
  return cache.get(src)!;
}
