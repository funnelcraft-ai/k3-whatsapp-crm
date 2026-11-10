/* hand-off of a pre-selected audience / template from other screens to the broadcast composer */
export const BroadcastDraft = {
  value: null as any,
  set(v: any) { this.value = v; },
  take() { const v = this.value; this.value = null; return v; },
};
