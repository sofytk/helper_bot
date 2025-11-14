const getApiBaseUrl = () => {
    if (window.AppConfig && window.AppConfig.BACKEND_URL) {
        return window.AppConfig.BACKEND_URL;
    }
    return 'http://0.0.0.0:8000/';
};

const API_BASE_URL = getApiBaseUrl();

class GrowGoodApp {
    constructor() {
        this.currentView = "map";
        this.userLocation = null;
        this.userData = null;
        this.events = [];
        this.currentScreen = 'home';
        this.init();
    }

    async init() {
        await maxBridge.init();
        await this.loadUserLocation();
        await this.loadUserData();
        await this.loadEvents();
        this.setupViewSwitcher();
        this.setupNavigation();
        this.setupSearch();
        this.setupFilters();
        this.updateUI();
    }

    async loadUserLocation() {
        try {
            this.userLocation = await maxBridge.getLocation();
            console.log('User location:', this.userLocation);
            if (this.userLocation && this.userLocation.latitude && this.userLocation.longitude) {
                mapManager.setUserLocation(this.userLocation.latitude, this.userLocation.longitude);
            }
        } catch (error) {
            console.error('Error loading user location:', error);
            this.userLocation = { latitude: 55.7558, longitude: 37.6173 };
            mapManager.setUserLocation(this.userLocation.latitude, this.userLocation.longitude);
        }
    }

    async loadUserData() {
        try {
            const stored = localStorage.getItem('appUser');
            if (stored) {
                this.userData = JSON.parse(stored);
                return;
            }
            const maxUserData = localStorage.getItem('maxUserData');
            if (maxUserData) {
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
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadEvents() {
        if (!this.userLocation) {
            await this.loadUserLocation();
        }

        try {
            const url = new URL(`${API_BASE_URL}/events/nearby`);
            url.searchParams.append('latitude', this.userLocation.latitude);
            url.searchParams.append('longitude', this.userLocation.longitude);
            url.searchParams.append('radius_km', '50');

            const response = await fetch(url);
            
            if (response.ok) {
                this.events = await response.json();
                if (this.events.length === 0) {
                    this.events = this.getTestEvents();
                }
            } else {
                console.warn('Failed to load events from backend, using test data');
                this.events = this.getTestEvents();
            }
        } catch (error) {
            console.warn('Error loading events, using test data:', error);
            this.events = this.getTestEvents();
        }
        if (this.currentView === 'list') {
            this.renderEvents(2);
        } else {
            this.renderEvents(); 
            this.updateMap();
        }
    }
    
    getTestEvents() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(now);
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        return [
            {
                id: 'test-1',
                title: 'Помощь в организации сбора корма',
                description: 'Помощь в организации сбора корма для бездомных животных.',
                category: 'animals',
                address: 'г. Москва, СВАО, ул. Пушистая, д. 40, стр 1',
                city: 'Москва',
                region: 'СВАО',
                latitude: 55.7558,
                longitude: 37.6173,
                points_reward: 50,
                status: 'urgent',
                start_date: tomorrow.toISOString(),
                end_date: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'test-2',
                title: 'Осуществляем сбор макулатуры',
                description: 'Сбор макулатуры для переработки. Принимаем бумагу, картон, газеты.',
                category: 'charity',
                address: 'г. Москва, ЗАО, ул. Хлопковая, д. 45, стр 3',
                city: 'Москва',
                region: 'ЗАО',
                latitude: 55.7500,
                longitude: 37.6000,
                points_reward: 30,
                status: 'active',
                start_date: dayAfter.toISOString(),
                end_date: new Date(dayAfter.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'test-3',
                title: 'Помощь в организации сбора гуманитарной помощи',
                description: 'Сбор гуманитарной помощи для нуждающихся семей.',
                category: 'animals',
                address: 'г. Москва, СВАО, ул. Пушистая, д. 40, стр 1',
                city: 'Москва',
                region: 'СВАО',
                latitude: 55.7600,
                longitude: 37.6200,
                points_reward: 50,
                status: 'urgent',
                start_date: dayAfter.toISOString(),
                end_date: new Date(dayAfter.getTime() + 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'test-4',
                title: 'Уборка парка',
                description: 'Волонтерская уборка городского парка от мусора.',
                category: 'charity',
                address: 'г. Москва, ЦАО, ул. Тверская, д. 10',
                city: 'Москва',
                region: 'ЦАО',
                latitude: 55.7558,
                longitude: 37.6173,
                points_reward: 40,
                status: 'active',
                start_date: new Date(dayAfter.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(dayAfter.getTime() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'test-5',
                title: 'Помощь пожилым людям',
                description: 'Доставка продуктов и лекарств пожилым людям.',
                category: 'charity',
                address: 'г. Москва, ЮАО, ул. Добрая, д. 15',
                city: 'Москва',
                region: 'ЮАО',
                latitude: 55.6500,
                longitude: 37.6000,
                points_reward: 60,
                status: 'active',
                start_date: new Date(dayAfter.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(dayAfter.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    renderEvents(limit = null) {
        const eventsList = document.getElementById('regularEvents');
        if (!eventsList) return;
        const eventsToShow = limit ? this.events.slice(0, limit) : this.events;
        const hasMore = limit && this.events.length > limit;
        
        eventsList.innerHTML = eventsToShow.map(event => {
            const isUrgent = event.status === 'urgent' || event.category === 'urgent';
            return this.createEventCard(event, isUrgent);
        }).join('');

        if (hasMore) {
            const moreButton = document.createElement('div');
            moreButton.className = 'more-toggle';
            moreButton.innerHTML = `
                <span>Больше</span>
                <span data-icon="chevronDown" style="display: inline-block; margin-left: 4px;"></span>
            `;
            moreButton.addEventListener('click', () => {
                this.renderEvents();
            });
            eventsList.appendChild(moreButton);
        }
        this.attachEventHandlers();
        
        if (window.IconManager) {
            window.IconManager.replaceIcons();
        }
    }

    createEventCard(event, isUrgent) {
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

    attachEventHandlers() {
        document.querySelectorAll('.btn-join, .btn-join-popup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = e.target.dataset.eventId;
                if (eventId) {
                    this.joinEvent(eventId);
                }
            });
        });
        
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-join')) return;
                
                const eventId = card.dataset.eventId;
                if (eventId) {
                    console.log('Open event details:', eventId);
                }
            });
        });
    }

    updateMap() {
        if (this.events.length > 0) {
            mapManager.addEvents(this.events);
            
            const urgentCount = this.events.filter(e => e.status === 'urgent' || e.category === 'urgent').length;
            mapManager.updateStats(this.events.length, urgentCount);
        }
    }

    setupViewSwitcher() {
        const toggleView = document.getElementById('toggleView');
        if (toggleView) {
            toggleView.checked = this.currentView === 'list';
            toggleView.addEventListener('change', (e) => {
                const isList = e.target.checked;
                console.log('Switching view to:', isList ? 'list' : 'map');
                this.switchView(isList ? 'list' : 'map');
            });
        }
    }
    
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.searchEvents(query);
            } else {
                this.loadEvents();
            }
        };
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
    }
    
    setupFilters() {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                alert('Фильтры будут реализованы в будущем');
            });
        }
    }
    
    async searchEvents(query) {
        try {
            const url = new URL(`${API_BASE_URL}/events/search`);
            url.searchParams.append('q', query);
            url.searchParams.append('search_type', 'location');
            if (this.userLocation) {
                url.searchParams.append('latitude', this.userLocation.latitude);
                url.searchParams.append('longitude', this.userLocation.longitude);
            }
            const response = await fetch(url);
            if (response.ok) {
                this.events = await response.json();
                this.renderEvents();
                this.updateMap();
            } else {
                console.warn('Backend search not available, filtering locally');
                this.filterEventsByLocation(query);
            }
        } catch (error) {
            console.error('Error searching events:', error);
            this.filterEventsByLocation(query);
        }
    }
    
    filterEventsByLocation(query) {
        const lowerQuery = query.toLowerCase();
        this.events = this.events.filter(event => {
            const city = (event.city || '').toLowerCase();
            const region = (event.region || '').toLowerCase();
            const address = (event.address || '').toLowerCase();
            return city.includes(lowerQuery) || 
                   region.includes(lowerQuery) || 
                   address.includes(lowerQuery);
        });
        this.renderEvents();
        this.updateMap();
    }

    switchView(view) {
        this.currentView = view;

        const toggleView = document.getElementById('toggleView');
        if (toggleView) {
            toggleView.checked = view === 'list';
        }
        
        document.querySelectorAll(".content-view").forEach(v => {
            v.classList.remove("active");
        });
        

        const targetView = document.getElementById(view + "View");
        if (targetView) {
            targetView.classList.add("active");
        }

        if (view === "map") {
          
            setTimeout(() => {
                if (mapManager.isReady()) {
                    mapManager.resize();
        
                    if (this.events.length > 0) {
                        this.updateMap();
                    }
                } else if (mapManager.pendingEvents && mapManager.pendingEvents.length > 0) {
                  
                    console.log('Waiting for map initialization...');
                }
            }, 200);
        } else if (view === "list") {
            if (this.events.length > 0) {
                this.renderEvents(2); 
            } else {
                const eventsList = document.getElementById('regularEvents');
                if (eventsList) {
                    eventsList.innerHTML = '<div class="empty" style="padding: 40px 20px; text-align: center; color: var(--muted);">Нет доступных миссий</div>';
                }
            }
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.getAttribute('onclick')?.match(/'(\w+)'/)?.[1] || 'home';
                this.showScreen(screen);
            });
        });
    }

    showScreen(screenName) {
        this.currentScreen = screenName;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
       
        if (screenName === 'home') {
            document.querySelector('.app-container').style.display = 'block';
            window.location.hash = '';
        } else if (screenName === 'rating') {
            window.location.href = 'rating.html';
        } else if (screenName === 'profile') {
            window.location.href = 'profile.html';
        } else if (screenName === 'rating') {
            window.location.href = 'rating.html';
        }
    }

    updateUI() {
        if (this.userData) {
            const pointsElement = document.querySelector(".points");
            const levelElement = document.querySelector(".level");
            
            if (pointsElement) {
                pointsElement.textContent = this.userData.points?.toLocaleString('ru-RU') + " баллов" || "0 баллов";
            }
            if (levelElement) {
                levelElement.textContent = "Уровень " + (this.userData.level || 1);
            }
        }

        if (this.userLocation) {
            const locationText = document.querySelector('.location-text');
            if (locationText && this.userData) {
                const city = this.userData.city || 'Москва';
                locationText.textContent = city;
            }
        }
    }

    async joinEvent(eventId) {
        if (!this.userData || !this.userData.id) {
            await maxBridge.sendNotification("Пожалуйста, войдите в систему");
            return;
        }

        try {
            const url = new URL(`${API_BASE_URL}/events/${eventId}/join`);
            url.searchParams.append('user_id', this.userData.id);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                await maxBridge.sendNotification("Вы успешно присоединились к событию!");
                await this.loadUserData();
                this.updateUI();
            } else {
                const error = await response.json();
                await maxBridge.sendNotification(error.detail || "Ошибка присоединения к событию");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            await maxBridge.sendNotification("Ошибка присоединения к событию");
        }
    }
}

let growGood;
document.addEventListener('DOMContentLoaded', () => {
    growGood = new GrowGoodApp();
    window.growGood = growGood;
});


function showScreen(screenName) {
    if (growGood) {
       growGood.showScreen(screenName);
    }
}
