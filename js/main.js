/**
 * SAGE - Main
 * State and initialization
 */

window.currentLanguage = 'en';
window.isLargeText = false;

document.addEventListener('DOMContentLoaded', () => {
    initVoiceAssistant();
    initScamChecker();
    initLearningCards();
    initAccessibility();
});
