// Build the sentences to speak, from the route and the chosen language
export function buildDirections(route, lang) {
  const steps = route.steps;
  const name = (s) => (lang === "ta" ? s.name_ta : s.name_en);
  const lines = [];

  if (lang === "ta") {
    lines.push(`தொடக்கம்: ${name(steps[0])}.`);
    for (let i = 1; i < steps.length - 1; i++) {
      lines.push(`${name(steps[i])} நோக்கிச் செல்லுங்கள்.`);
    }
    lines.push(`இலக்கை அடைந்துவிட்டீர்கள்: ${name(steps[steps.length - 1])}.`);
    lines.push(`மொத்த தூரம் ${route.distance_m} மீட்டர்.`);
  } else {
    lines.push(`Start at ${name(steps[0])}.`);
    for (let i = 1; i < steps.length - 1; i++) {
      lines.push(`Go towards ${name(steps[i])}.`);
    }
    lines.push(`You have reached ${name(steps[steps.length - 1])}.`);
    lines.push(`Total distance is ${route.distance_m} metres.`);
  }
  return lines;
}

// Is a voice available for this language on this device?
export function hasVoice(lang) {
  if (!("speechSynthesis" in window)) return false;
  const code = lang === "ta" ? "ta" : "en";
  return window.speechSynthesis.getVoices().some((v) => v.lang.startsWith(code));
}

export function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // stop anything already speaking
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ta" ? "ta-IN" : "en-IN";
  const voices = window.speechSynthesis.getVoices();
  const match =
    voices.find((v) => v.lang === u.lang) ||
    voices.find((v) => v.lang.startsWith(lang === "ta" ? "ta" : "en"));
  if (match) u.voice = match;
  u.rate = 0.9; // slightly slower, easier to follow
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}