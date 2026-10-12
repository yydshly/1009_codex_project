// Optional local browser speech. No server/API, recording or external voice service.
export class PumpNarration {
  constructor({ synthesis = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance, onAvailability = () => {}, onError = () => {} } = {}) {
    this.synthesis = synthesis; this.Utterance = Utterance; this.onAvailability = onAvailability; this.onError = onError;
    this.enabled = false; this.serial = 0; this.voice = null; this.current = null;
    this.refresh = () => {
      this.voice = this.synthesis?.getVoices().find(voice => /^zh/i.test(voice.lang) && voice.localService) ?? null;
      if (!this.voice) this.setEnabled(false);
      this.onAvailability(Boolean(this.voice && this.Utterance));
    };
    this.synthesis?.addEventListener('voiceschanged', this.refresh); this.refresh();
  }
  setEnabled(enabled) { this.enabled = Boolean(enabled && this.voice && this.Utterance); if (!this.enabled) this.cancel(); }
  cancel() { this.serial++; if (this.current) this.synthesis.cancel(); this.current = null; }
  speak(text) {
    this.cancel(); if (!this.enabled) return;
    const serial = this.serial, utterance = new this.Utterance(text);
    utterance.voice = this.voice; utterance.lang = this.voice.lang; utterance.rate = 1.15;
    this.current = utterance;
    utterance.onend = () => { if (serial === this.serial) this.current = null; };
    utterance.onerror = event => { if (serial === this.serial && !['interrupted', 'canceled'].includes(event.error)) this.onError(event.error); };
    try { this.synthesis.speak(utterance); }
    catch { if (serial === this.serial) { this.current = null; this.onError('unavailable'); } }
  }
  dispose() { this.cancel(); this.synthesis?.removeEventListener('voiceschanged', this.refresh); }
}
