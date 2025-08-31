
export const speakText = (text: string) => {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;

  // Ensure any previous speech is stopped before starting new.
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const cancelSpeech = () => {
  if (!window.speechSynthesis) {
    return;
  }
  window.speechSynthesis.cancel();
};
