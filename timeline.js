// Load timeline from JSON - self-contained module
async function loadTimeline() {
    try {
        const response = await fetch('content/timeline/timeline.json');
        const timeline = await response.json();
        const listContainer = document.getElementById('timeline-list');
        
        if (!listContainer) return;
        
        // Sort by start date (most recent first)
        timeline.sort((a, b) => {
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            return dateB - dateA;
        });
        
        timeline.forEach(item => {
            const startDate = new Date(item.startDate);
            const startYear = startDate.getFullYear();
            
            let endYear = '';
            if (item.endDate) {
                if (item.endDate.toLowerCase() === 'present') {
                    endYear = 'Present';
                } else {
                    const endDate = new Date(item.endDate);
                    endYear = endDate.getFullYear();
                }
            }
            
            const yearRange = endYear ? `${startYear} - ${endYear}` : `${startYear} -`;
            
            // Support markdown links [text](url) and italics *text* and bold **text**
            let formattedDescription = item.description || '';
            formattedDescription = formattedDescription.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            formattedDescription = formattedDescription.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            formattedDescription = formattedDescription.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            // Support paragraph breaks with \n\n
            formattedDescription = formattedDescription.replace(/\n\n/g, '</p><p class="timeline-description">');
            
            // Make logo clickable if URL exists
            const logoHTML = item.url 
                ? `<a href="${item.url}" target="_blank" class="timeline-logo-link"><img src="${item.logo}" alt="${item.organization}" class="timeline-logo"></a>`
                : `<img src="${item.logo}" alt="${item.organization}" class="timeline-logo">`;
            
            const timelineHTML = `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-year">${yearRange}</div>
                ${logoHTML}
                <div class="timeline-content">
                    <p class="timeline-description">${formattedDescription}</p>
                </div>
            </div>
            `;
            listContainer.innerHTML += timelineHTML;
        });
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

// Auto-load timeline when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTimeline);
} else {
    loadTimeline();
}
