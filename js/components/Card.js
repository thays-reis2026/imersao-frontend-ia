import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

export function createCard(item, isPersonalList = false, rank = null) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    if (isPersonalList) {
        card.classList.add('personal-list-item');
    }
    if (item.progress) {
        card.classList.add('has-progress');
    }

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.alt;

    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";

    const videoId = getYouTubeId(item.youtube);

    card.appendChild(iframe);
    card.appendChild(img);

    const ageBadge = getRandomAgeBadge();

    const details = document.createElement('div');
    details.className = 'card-details';
    const itemData = JSON.stringify({img: item.img, alt: item.alt, youtube: item.youtube});
    
    // Check if item is already liked
    const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
    const isLiked = likedItems.some(liked => liked.img === item.img);
    
    details.innerHTML = `
        <div class="details-buttons">
            <div class="left-buttons">
                <button class="btn-icon btn-play-icon"><i class="fas fa-play" style="margin-left:2px;"></i></button>
                ${item.progress ? '<button class="btn-icon"><i class="fas fa-check"></i></button>' : `<button class="btn-icon btn-add-list" data-item='${itemData}'><i class="fas fa-plus"></i></button>`}
                <button class="btn-icon btn-like" style="color: ${isLiked ? '#22c55e' : 'inherit'};"><i class="fas fa-thumbs-up"></i></button>
            </div>
            <div class="right-buttons">
                ${isPersonalList ? `<button class="btn-icon btn-delete-list" data-item='${itemData}'><i class="fas fa-trash"></i></button>` : '<button class="btn-icon"><i class="fas fa-chevron-down"></i></button>'}
            </div>
        </div>
        <div class="star-text">⭐ Watch now with a 30-day free trial</div>
        <div class="details-info">
            <span class="match-score">${getRandomMatchScore()}% relevante</span>
            <span class="age-badge ${ageBadge.class}">${ageBadge.text}</span>
            <span class="duration">${getRandomDuration(item.progress)}</span>
            <span class="resolution">HD</span>
        </div>
        <div class="details-tags">
            <span>Empolgante</span>
            <span>Animação</span>
            <span>Ficção</span>
        </div>
    `;
    card.appendChild(details);


    if (item.progress) {
        const pbContainer = document.createElement('div');
        pbContainer.className = 'progress-bar-container';
        const pbValue = document.createElement('div');
        pbValue.className = 'progress-value';
        pbValue.style.width = `${item.progress}%`;
        pbContainer.appendChild(pbValue);
        card.appendChild(pbContainer);
    }

    let playTimeout;
    card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        if (rect.left < 100) {
            card.classList.add('origin-left');
        } else if (rect.right > windowWidth - 100) {
            card.classList.add('origin-right');
        }

        playTimeout = setTimeout(() => {
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
            iframe.classList.add('playing');
            img.classList.add('playing-video');
        }, 600);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(playTimeout);
        iframe.classList.remove('playing');
        img.classList.remove('playing-video');
        iframe.src = "";
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');
    });

    // Like button interaction
    const likeBtn = card.querySelector('.btn-like');
    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
            const itemIndex = likedItems.findIndex(liked => liked.img === item.img);
            
            if (itemIndex === -1) {
                // Add to liked
                likedItems.push({img: item.img, alt: item.alt, youtube: item.youtube});
                likeBtn.style.color = '#22c55e';
            } else {
                // Remove from liked
                likedItems.splice(itemIndex, 1);
                likeBtn.style.color = 'inherit';
            }
            
            localStorage.setItem('likedItems', JSON.stringify(likedItems));
        });
    }

    return card;
}
