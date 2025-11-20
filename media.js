// Load and display media/highlights
async function loadMedia() {
  try {
    const response = await fetch('content/media/media.json');
    const mediaItems = await response.json();
    
    const container = document.getElementById('media-list');
    if (!container) return;
    
    container.innerHTML = mediaItems.map(item => {
      const videoUrl = item.timestamp 
        ? `https://www.youtube.com/embed/${item.videoId}?start=${item.timestamp}`
        : `https://www.youtube.com/embed/${item.videoId}`;
      
      // Support italic formatting with *text*
      const formattedTitle = item.title.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      const formattedDescription = item.description.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      
      return `
        <div class="media-item">
          <div class="media-thumbnail">
            <iframe 
              src="${videoUrl}" 
              title="${item.title}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="media-info">
            <h3>${formattedTitle}</h3>
            <p>${formattedDescription}</p>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading media:', error);
  }
}

// Auto-load when DOM is ready
document.addEventListener('DOMContentLoaded', loadMedia);
