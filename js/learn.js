/**
 * SAGE - Learning Section
 * Tutorial cards and modal
 */

function initLearningCards() {
    const modal = document.getElementById('learnModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');

    if (!modal || !modalTitle || !modalContent || !modalClose) return;

    const closeModal = () => {
        modal.hidden = true;
    };

    document.querySelectorAll('.learn-card').forEach(card => {
        card.addEventListener('click', () => {
            const cardKey = card.dataset.card;
            const content = LEARNING_CONTENT[cardKey];
            if (content) {
                const data = content[currentLanguage] || content.en;
                modalTitle.textContent = data.title;
                modalContent.innerHTML = data.content;
                modal.hidden = false;
            }
        });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}
