// Используем API URL из конфигурации
const getApiBaseUrl = () => {
    if (window.AppConfig && window.AppConfig.API_BASE_URL) {
        return window.AppConfig.API_BASE_URL;
    }
    return 'http://0.0.0.0:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ProfileManager {
    constructor() {
        this.userData = null;
        this.completedEvents = [];
        this.expiredEvents = [];
        this.upcomingEvents = [];
        this.achievements = [];
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadUserEvents();
        await this.loadAchievements();
        this.renderProfile();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        const completedChip = document.getElementById('completedChip');
        if (completedChip) {
            completedChip.addEventListener('click', (e) => {
                e.preventDefault();
                this.showEventsModal('completed', 'Завершенные миссии');
            });
        }
        
        const expiredChip = document.getElementById('expiredChip');
        if (expiredChip) {
            expiredChip.addEventListener('click', (e) => {
                e.preventDefault();
                this.showEventsModal('expired', 'Просроченные миссии');
            });
        }
        
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                if (screen === 'game' || screen === 'home') window.location.href = 'game.html';
                else if (screen === 'map') window.location.href = 'index.html';
                else if (screen === 'rating') window.location.href = 'rating.html';
                else if (screen === 'profile') return;
            });
        });
    }
    
    showEventsModal(type, title) {
        const events = type === 'completed' ? this.completedEvents : this.expiredEvents;
        
        if (events.length === 0) {
            alert(`У вас нет ${type === 'completed' ? 'завершенных' : 'просроченных'} миссий`);
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-card" style="max-height: 80vh; overflow-y: auto;">
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">${title}</h2>
                <div class="events-list">
                    ${events.map(event => this.createEventCard(event)).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        if (window.IconManager) window.IconManager.replaceIcons();
    }

    async loadUserData() {
        const stored = localStorage.getItem('appUser');
        if (stored) {
            this.userData = JSON.parse(stored);
        } else {
            const maxUserData = localStorage.getItem('maxUserData');
            if (maxUserData) {
                try {
                    const userData = JSON.parse(maxUserData);
                    const response = await fetch(`${API_BASE_URL}/users/auth/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData)
                    });

                    if (response.ok) {
                        this.userData = await response.json();
                        localStorage.setItem('appUser', JSON.stringify(this.userData));
                    }
                } catch (error) {
                    console.error('Error syncing user:', error);
                }
            }
        }
    }

    async loadUserEvents() {
        if (!this.userData || !this.userData.id) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userData.id}/events`);
            if (response.ok) {
                const data = await response.json();
                this.completedEvents = data.completed || [];
                this.expiredEvents = data.expired || [];
                this.upcomingEvents = data.upcoming || [];
            }
        } catch (error) {
            console.error('Error loading user events:', error);
        }
    }
    
    async loadAchievements() {
        if (!this.userData || !this.userData.id) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userData.id}/achievements`);
            if (response.ok) {
                this.achievements = await response.json();
            } else {
                this.generateAchievements();
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.generateAchievements();
        }
    }
    
    generateAchievements() {
        const completed = this.userData?.completed_events || 0;
        const points = this.userData?.points || 0;
        
        this.achievements = [
            {
                id: 1,
                title: 'ТОП-3',
                description: 'по г. Москва',
                period: 'октябрь 2025',
                unlocked: completed >= 10
            },
            {
                id: 2,
                title: 'ТОП-3',
                description: 'по г. Москва',
                period: 'октябрь 2025',
                unlocked: completed >= 5
            },
            {
                id: 3,
                title: 'ТОП-3',
                description: 'по г. Москва',
                period: 'октябрь 2025',
                unlocked: points >= 100
            }
        ];
    }

    renderProfile() {
        if (!this.userData) {
            const fullNameEl = document.getElementById('fullName');
            if (fullNameEl) fullNameEl.textContent = 'Пользователь';
            return;
        }

        const avatarEl = document.getElementById('avatar');
        if (avatarEl) {
            if (this.userData.avatar_url) {
                avatarEl.style.backgroundImage = `url(${this.userData.avatar_url})`;
                avatarEl.style.backgroundSize = 'cover';
                avatarEl.style.backgroundPosition = 'center';
            }
        }

        const fullNameEl = document.getElementById('fullName');
        if (fullNameEl) {
            fullNameEl.textContent = this.userData.full_name || this.userData.username || 'Пользователь';
        }

        const completedCountEl = document.getElementById('completedCount');
        if (completedCountEl) {
            completedCountEl.textContent = this.completedEvents.length || this.userData.completed_events || 0;
        }
        
        const expiredCountEl = document.getElementById('expiredCount');
        if (expiredCountEl) {
            expiredCountEl.textContent = this.expiredEvents.length || 0;
        }
        
        this.renderUpcomingEvents();
        
        this.renderAchievements();
        
        const coinsCountEl = document.getElementById('coinsCount');
        if (coinsCountEl) {
            coinsCountEl.textContent = (this.userData.points || 0).toLocaleString('ru-RU');
        }
    }
    
    renderUpcomingEvents() {
        const container = document.getElementById('nearbyEvents');
        if (!container) return;
        
        if (this.upcomingEvents.length === 0) {
            container.innerHTML = '<div class="empty" style="padding: 20px; text-align: center; color: var(--muted);">Нет предстоящих миссий</div>';
            return;
        }
        
        container.innerHTML = this.upcomingEvents.slice(0, 2).map(event => {
            return this.createEventCard(event);
        }).join('');
        
        if (this.upcomingEvents.length > 2) {
            const moreButton = document.createElement('div');
            moreButton.className = 'more-toggle';
            moreButton.innerHTML = `
                <span>Больше</span>
                <span data-icon="chevronDown" style="display: inline-block; margin-left: 4px;"></span>
            `;
            moreButton.addEventListener('click', () => {
                container.innerHTML = this.upcomingEvents.map(event => {
                    return this.createEventCard(event);
                }).join('');
                if (window.IconManager) window.IconManager.replaceIcons();
            });
            container.appendChild(moreButton);
        }
        
        if (window.IconManager) window.IconManager.replaceIcons();
    }
    
    createEventCard(event) {
        const isUrgent = event.status === 'urgent' || event.category === 'urgent';
        let timeInfo = '';
        
        if (event.start_date) {
            const startDate = new Date(event.start_date);
            const endDate = event.end_date ? new Date(event.end_date) : null;
            
            if (endDate && (endDate - startDate) > 24 * 60 * 60 * 1000) {
                const startStr = startDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const endStr = endDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                timeInfo = `с ${startStr} до ${endStr}`;
            } else {
                const dateStr = startDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const startTime = startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                const endTime = endDate ? endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
                timeInfo = `${dateStr} ${startTime}${endTime ? '-' + endTime : ''}`;
            }
        }
        
        const categoryName = event.category === 'animals' ? 'Здоровые коты' : 
                            event.category === 'charity' ? 'Рука помощи' : 
                            event.organizer?.name || 'Организация';
        
        return `
            <div class="event-card ${isUrgent ? 'urgent' : ''}" data-event-id="${event.id}">
                <div class="top-line">
                    <div class="category">
                        <span class="check-icon" data-icon="check"></span>
                        <span>${categoryName}</span>
                    </div>
                    ${isUrgent ? '<span class="urgent-tag-small">срочно</span>' : ''}
                </div>
                <div class="event-title">${event.title}</div>
                ${timeInfo ? `<div class="event-meta"><span class="event-time-pill">${timeInfo}</span></div>` : ''}
                ${event.address ? `<div class="event-location">${event.address}</div>` : ''}
                <div class="chev" data-icon="chevron"></div>
            </div>
        `;
    }
    
    renderAchievements() {
        const container = document.getElementById('achievementsRow');
        if (!container) return;
        
        if (this.achievements.length === 0) {
            this.generateAchievements();
        }
        
        container.innerHTML = this.achievements.map(achievement => {
            return `
                <div class="achievement-card ${achievement.unlocked ? 'unlocked' : ''}">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #ffe66d); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                        <span style="font-size: 24px;">🏆</span>
                    </div>
                    <div style="font-weight: 700; color: #FFD700; font-size: 14px;">${achievement.title}</div>
                    <div style="color: var(--muted); font-size: 12px;">${achievement.description || ''}</div>
                    <div style="color: var(--muted); font-size: 11px;">${achievement.period || ''}</div>
                </div>
            `;
        }).join('');
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});


