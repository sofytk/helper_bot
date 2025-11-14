class MaxBridge {
    constructor() {
        this.isMax = false;
        this.userData = null;
        this.sdk = null;
        this.init();
    }

    async init() {
        if (window.MaxWebAppSDK) {
            this.isMax = true;
            this.sdk = window.MaxWebAppSDK;
            try {
                await this.initSDK();
                await this.loadUserData();
                this.setupMaxIntegration();
            } catch (error) {
                console.error("Ошибка инициализации MAX SDK:", error);
            }
        } else {
            console.warn("MAX SDK не найден. Приложение работает в режиме разработки.");
            await this.loadUserData();
        }
    }

    setupMaxIntegration() {
        if (!this.isMax || !this.sdk) return;

        try {
            if (this.sdk.setTheme) {
                this.sdk.setTheme('light');
            }

            if (this.sdk.setBackButton) {
                this.sdk.setBackButton({
                    visible: true,
                    onClick: () => {
                        if (window.history.length > 1) {
                            window.history.back();
                        }
                    }
                });
            }

            if (this.sdk.setMainButton) {
                this.sdk.setMainButton({
                    text: 'Обновить карту',
                    onClick: () => {
                        if (window.dobroBot) {
                            window.dobroBot.loadEvents();
                        }
                    }
                });
            }

            if (this.sdk.on) {
                this.sdk.on('viewportChanged', (data) => {
                    if (window.mapManager) {
                        window.mapManager.resize();
                    }
                });

                this.sdk.on('themeChanged', (theme) => {
                    document.body.setAttribute('data-theme', theme);
                });
            }
        } catch (error) {
            console.error("Ошибка настройки интеграции MAX:", error);
        }
    }

    async initSDK() {
        if (this.sdk && this.sdk.init) {
            try {
                await this.sdk.init();
                console.log("MAX SDK успешно инициализирован");
                
                if (this.sdk.platform) {
                    console.log("Платформа MAX:", this.sdk.platform);
                }
                
                if (this.sdk.version) {
                    console.log("Версия MAX SDK:", this.sdk.version);
                }
            } catch (error) {
                console.error("Ошибка инициализации MAX SDK:", error);
                throw error;
            }
        } else {
            console.warn("MAX SDK не доступен, работаем в режиме разработки");
        }
    }

    async loadUserData() {
        try {
            if (this.isMax && this.sdk && this.sdk.getUserData) {
                this.userData = await this.sdk.getUserData();
                console.log("Данные пользователя MAX:", this.userData);
                
                localStorage.setItem("maxUserData", JSON.stringify(this.userData));
                
                await this.syncUserWithBackend();
            } else {
                this.userData = {
                    id: "test_user_123",
                    userId: "test_user_123",
                    username: "test_user",
                    fullName: "Тестовый Пользователь",
                    name: "Тестовый Пользователь",
                    avatarUrl: null,
                    photo: null
                };
                localStorage.setItem("maxUserData", JSON.stringify(this.userData));
                console.log("Используются тестовые данные пользователя");
            }
        } catch (error) {
            console.error("Ошибка загрузки данных пользователя:", error);
            this.userData = {
                id: "test_user_123",
                userId: "test_user_123",
                username: "test_user",
                fullName: "Тестовый Пользователь"
            };
            localStorage.setItem("maxUserData", JSON.stringify(this.userData));
        }
    }

    async syncUserWithBackend() {
        try {
            const API_BASE_URL = this.getApiBaseUrl();
            
            const response = await fetch(`${API_BASE_URL}/users/auth/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(this.userData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const user = await response.json();
            localStorage.setItem("appUser", JSON.stringify(user));
            console.log("Пользователь синхронизирован с backend:", user);
            
        } catch (error) {
            console.error("Ошибка синхронизации пользователя с backend:", error);
            const localUser = {
                id: this.userData.id || this.userData.userId,
                max_user_id: this.userData.id || this.userData.userId,
                username: this.userData.username,
                full_name: this.userData.fullName || this.userData.name,
                points: 0,
                level: 1,
                completed_events: 0
            };
            localStorage.setItem("appUser", JSON.stringify(localUser));
        }
    }

    getApiBaseUrl() {
        if (window.AppConfig && window.AppConfig.API_BASE_URL) {
            return window.AppConfig.API_BASE_URL;
        }
        
        if (this.isMax) {
            return 'http://0.0.0.0:8000/api';
        }
        
        return 'http://0.0.0.0:8000/api';
    }

    async sendNotification(message) {
        if (this.isMax && window.MaxWebAppSDK) {
            try {
                await window.MaxWebAppSDK.showNotification(message);
            } catch (error) {
                console.error("sendNotification() error", error);
            }
        }
    }

    async getLocation() {
        if (this.isMax && window.MaxWebAppSDK && window.MaxWebAppSDK.getGeolocation) {
            try {
                const location = await window.MaxWebAppSDK.getGeolocation();
                return location;
            } catch (error) {
                console.error("getLocation() error", error);
                return this.getFallbackLocation();
            }
        } else {
            return this.getFallbackLocation();
        }
    }

    getFallbackLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    () => {
                        resolve({ latitude: 55.7558, longitude: 37.6173 });
                    }
                );
            } else {
                resolve({ latitude: 55.7558, longitude: 37.6173 });
            }
        });
    }
}

const maxBridge = new MaxBridge();