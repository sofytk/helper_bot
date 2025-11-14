const getApiBaseUrl = () => {
    if (window.AppConfig && window.AppConfig.API_BASE_URL) {
        return window.AppConfig.API_BASE_URL;
    }
    return 'http://0.0.0.0:8000/';
};

const API_BASE_URL = getApiBaseUrl();

const randomNames = [
    'Крутой зайчик',
    'Красивая сова',
    'Быстрый олень',
    'Мудрый филин',
    'Смелый лев',
    'Добрая панда',
    'Сильный медведь',
    'Ловкая лиса',
    'Грациозный лебедь',
    'Храбрый тигр',
    'Умный дельфин',
    'Веселый попугай',
    'Спокойный кит',
    'Активный кенгуру',
    'Нежный единорог'
];

class RatingManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadRating();
    }

    async loadUserData() {
        const stored = localStorage.getItem('appUser');
        if (stored) {
            this.userData = JSON.parse(stored);
        }
    }

    async loadRating() {
        const list = document.getElementById('ratingList');
        list.innerHTML = '<div class="loading">Загрузка рейтинга...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/rating/users?limit=10`);
            
            if (response.ok) {
                const users = await response.json();
                this.renderRating(users, list);
            } else {
                this.renderMockRating(list);
            }
        } catch (error) {
            console.error('Error loading rating:', error);
            this.renderMockRating(list);
        }
    }

    renderMockRating(container) {
        const mockUsers = [];
        const usedNames = new Set();
        
        for (let i = 1; i <= 10; i++) {
            let name;
            do {
                name = randomNames[Math.floor(Math.random() * randomNames.length)];
            } while (usedNames.has(name) && usedNames.size < randomNames.length);
            usedNames.add(name);
            
            let points;
            if (i <= 3) {
                points = 200 - (i - 1) * 50; 
            } else if (i <= 5) {
                points = 50 - (i - 4) * 15; 
            } else {
                points = 20 - (i - 6) * 2;
            }
            
            mockUsers.push({
                position: i,
                name: name,
                points: points
            });
        }
        
        this.renderRating(mockUsers, container);
    }

    renderRating(users, container) {
        if (users.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных для отображения</div>';
            return;
        }

        const currentUserId = this.userData?.id;
        
        const topUsers = users.slice(0, 10);
        const currentUser = users.find(u => u.id === currentUserId);
        
        let html = '';
        
        topUsers.forEach((user, index) => {
            const position = user.position || (index + 1);
            const name = user.full_name || user.username || user.name || 'Пользователь';
            const points = user.points || 0;
            
            let rankColor = '#666'; 
            if (position === 1 || position === 2 || position === 3) {
                rankColor = '#FFD700'; 
            } else if (position === 4 || position === 5) {
                rankColor = '#FF8C00'; 
            } else {
                rankColor = '#2b7fff';
            }
            
            html += `
                <div class="rating-item">
                    <div class="rank" style="color: ${rankColor}">${position}</div>
                    <div class="user-avatar">
                        <div class="avatar-placeholder"></div>
                    </div>
                    <div class="user-info">
                        <span class="name">${name}</span>
                    </div>
                    ${points > 0 ? `<div class="points">+${points}</div>` : ''}
                </div>
            `;
        });
        
        if (currentUser && !topUsers.find(u => u.id === currentUserId)) {
            html += '<div class="rating-separator"></div>';
            
            const position = currentUser.position || users.length;
            const name = 'Вы';
            html += `
                <div class="rating-item me">
                    <div class="rank" style="color: #2b7fff">${position}</div>
                    <div class="user-avatar">
                        <div class="avatar-placeholder"></div>
                    </div>
                    <div class="user-info">
                        <span class="name">${name}</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RatingManager();
});
