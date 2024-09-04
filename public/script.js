document.getElementById('learn-more-btn').addEventListener('click', function() {
    const featuresSection = document.getElementById('features');
    if (featuresSection.classList.contains('hidden')) {
        featuresSection.classList.remove('hidden');
        this.textContent = 'Hide Features';
    } else {
        featuresSection.classList.add('hidden');
        this.textContent = 'Learn More';
    }
});
