class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.ymaps = null;
        this.isInitialized = false;
        this.pendingEvents = [];
        this.init();
    }

    async init() {

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.waitForYmaps());
        } else {
            this.waitForYmaps();
        }
    }
    
    waitForYmaps() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.warn('Map container not found');
            return;
        }
        
        if (typeof ymaps !== 'undefined') {
            this.initYandexMap();
        } else {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkYmaps = setInterval(() => {
                attempts++;
                if (typeof ymaps !== 'undefined') {
                    clearInterval(checkYmaps);
                    this.initYandexMap();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkYmaps);
                    console.error('Yandex Maps failed to load after timeout');
                    this.showMapError('Не удалось загрузить Яндекс.Карты. Проверьте подключение к интернету.');
                }
            }, 100);
        }
    }
    
    showMapError(message) {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 8px; margin: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">${message}</p>
                    <button onclick="location.reload()" style="padding: 8px 16px; background: #2b7fff; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    }

    async initYandexMap() {
        try {
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('Map container not found');
                return;
            }
            
            const mapView = document.getElementById('mapView');
            if (mapView && !mapView.classList.contains('active')) {
                console.warn('Map view is not active, activating...');
                mapView.classList.add('active');
            }
            
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkSize = () => {
                const width = mapContainer.offsetWidth || mapContainer.clientWidth;
                const height = mapContainer.offsetHeight || mapContainer.clientHeight;
                
                if ((width === 0 || height === 0) && attempts < maxAttempts) {
                    attempts++;
                    console.log(`Waiting for map container size... (attempt ${attempts})`);
                    setTimeout(checkSize, 100);
                    return;
                }
                
                if (width === 0 || height === 0) {
                    console.warn('Map container still has zero size, initializing anyway...');
                }
                
                if (typeof ymaps === 'undefined') {
                    console.error('ymaps is not defined');
                    this.showMapError('Яндекс.Карты не загружены. Проверьте подключение к интернету.');
                    return;
                }
                
                this.initMap();
            };
            
            checkSize();
            
        } catch (error) {
            console.error('Ошибка инициализации Яндекс.Карт:', error);
            this.showMapError('Ошибка инициализации карты: ' + error.message);
        }
    }
    
    async initMap() {
        try {
            await ymaps.ready();
            this.ymaps = ymaps;
            
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('Map container not found during init');
                return;
            }
            
            mapContainer.innerHTML = '';
            
            this.map = new ymaps.Map('map', {
                center: [55.7558, 37.6173],
                zoom: 10,
                controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
            });

            this.isInitialized = true;
            console.log('Яндекс.Карта успешно инициализирована');
            
            setTimeout(() => {
                if (this.map) {
                    this.map.container.fitToViewport();
                }
            }, 100);
            
            const resizeHandler = () => {
                if (this.map) {
                    setTimeout(() => {
                        this.map.container.fitToViewport();
                    }, 100);
                }
            };
            
            window.addEventListener('resize', resizeHandler);
            
            if (this.pendingEvents && this.pendingEvents.length > 0) {
                this.addEvents(this.pendingEvents);
                this.pendingEvents = [];
            }
            
        } catch (error) {
            console.error('Ошибка создания карты:', error);
            this.showMapError('Ошибка создания карты: ' + error.message);
        }
    }

    setUserLocation(lat, lon) {
        if (!this.map || !this.ymaps) {
            console.warn('Карта еще не инициализирована');
            return;
        }

        if (this.userMarker) {
            this.map.geoObjects.remove(this.userMarker);
        }

        const userIcon = new this.ymaps.Placemark(
            [lat, lon],
            {
                balloonContent: 'Ваше местоположение',
                iconCaption: 'Вы здесь'
            },
            {
                preset: 'islands#blueCircleDotIcon',
                iconColor: '#1e88e5'
            }
        );

        this.userMarker = userIcon;
        this.map.geoObjects.add(userIcon);

        this.map.setCenter([lat, lon], 12, {
            duration: 300
        });

        userIcon.balloon.open();
    }

    addEventMarker(event) {
        if (!this.map || !this.ymaps) {
            console.warn('Карта еще не инициализирована');
            return null;
        }

        const MyIconContentLayout = this.ymaps.templateLayoutFactory.createClass(
            '<div class="custom-marker" style="' +
            'background: white; ' +
            'border: 1px solid #e0e0e0; ' +
            'border-radius: 8px; ' +
            'padding: 6px 12px; ' +
            'font-size: 13px; ' +
            'font-weight: 500; ' +
            'color: #1a1a1a; ' +
            'white-space: nowrap; ' +
            'box-shadow: 0 2px 4px rgba(0,0,0,0.1); ' +
            'max-width: 150px; ' +
            'overflow: hidden; ' +
            'text-overflow: ellipsis;' +
            '">$[properties.iconContent]</div>'
        );

        const marker = new this.ymaps.Placemark(
            [event.latitude, event.longitude],
            {
                balloonContent: this.createEventBalloon(event),
                hintContent: event.title,
                iconContent: event.title
            },
            {
                iconLayout: MyIconContentLayout,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [[0, 0], [0, 0]]
                }
            }
        );

      
        marker.eventId = event.id;
        marker.eventData = event;

        
        marker.events.add('click', () => {
            this.onMarkerClick(event);
        });

        this.map.geoObjects.add(marker);
        this.markers.push(marker);

        return marker;
    }

    createEventBalloon(event) {
        const distance = event.distance ? `${event.distance} км` : '';
        const timeInfo = event.start_date ? new Date(event.start_date).toLocaleString('ru-RU') : '';
        
        return `
            <div class="event-popup" style="min-width: 250px; padding: 10px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">${event.title}</h3>
                ${event.description ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #666; line-height: 1.4;">${event.description}</p>` : ''}
                <div style="font-size: 12px; color: #888; margin-bottom: 10px; line-height: 1.6;">
                    ${event.address ? `<div style="margin-bottom: 4px;">📍 ${event.address}</div>` : ''}
                    ${distance ? `<div style="margin-bottom: 4px;">📏 ${distance}</div>` : ''}
                    ${timeInfo ? `<div style="margin-bottom: 4px;">⏰ ${timeInfo}</div>` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                    <span style="font-weight: bold; color: #4CAF50; font-size: 14px;">+${event.points_reward} баллов</span>
                    <button class="btn-join-popup" data-event-id="${event.id}" 
                            style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; transition: background 0.3s;"
                            onmouseover="this.style.background='#45a049'"
                            onmouseout="this.style.background='#4CAF50'">
                        Участвовать
                    </button>
                </div>
            </div>
        `;
    }

    onMarkerClick(event) {
        console.log('Клик на событие:', event.title);
    }

    clearMarkers() {
        if (!this.map) return;
        
        this.markers.forEach(marker => {
            this.map.geoObjects.remove(marker);
        });
        this.markers = [];
    }

    addEvents(events) {
        if (!this.isInitialized || !this.map || !this.ymaps) {
            console.warn('Карта еще не инициализирована, события будут добавлены после инициализации');
            this.pendingEvents = events;
            return;
        }

        this.clearMarkers();
        const validEvents = events.filter(event => event.latitude && event.longitude);
        
        if (validEvents.length === 0) {
            console.warn('No valid events with coordinates to display');
            return;
        }
        
        validEvents.forEach(event => {
            try {
                this.addEventMarker(event);
            } catch (error) {
                console.error('Error adding event marker:', error, event);
            }
        });

        if (validEvents.length > 0) {
            try {
                const bounds = this.map.geoObjects.getBounds();
                if (bounds) {
                    this.map.setBounds(bounds, {
                        duration: 300,
                        checkZoomRange: true
                    });
                } else {
                  
                    const firstEvent = validEvents[0];
                    this.map.setCenter([firstEvent.latitude, firstEvent.longitude], 12);
                }
            } catch (error) {
                console.error('Error setting map bounds:', error);

                const firstEvent = validEvents[0];
                if (firstEvent) {
                    this.map.setCenter([firstEvent.latitude, firstEvent.longitude], 12);
                }
            }
        }

       
        setTimeout(() => {
            document.querySelectorAll('.btn-join-popup').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const eventId = newBtn.dataset.eventId;
                    if (eventId && window.dobroBot) {
                        window.dobroBot.joinEvent(eventId);
                    }
                });
            });
        }, 100);
    }

    updateStats(activeCount, urgentCount) {
        const statNumberElements = document.querySelectorAll('.stat-number');
        if (statNumberElements.length >= 2) {
            statNumberElements[0].textContent = activeCount;
            statNumberElements[1].textContent = urgentCount;
        }
    }

    resize() {
        if (this.map && this.isInitialized) {
            try {
                this.map.container.fitToViewport();
            } catch (error) {
                console.error('Error resizing map:', error);
            }
        }
    }
    
    isReady() {
        return this.isInitialized && this.map !== null && this.ymaps !== null;
    }
}


window.mapManager = new MapManager();
