class WaterGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.pot = document.getElementById('flowerPot');
        this.plant = document.getElementById('plant');
        this.dropletsContainer = document.getElementById('dropletsContainer');
        this.availableDrops = 0; 
        this.plantHP = 0; 
        this.plantLevel = 1; 
        this.totalDropsCaught = 0; 
        this.isDragging = false;
        this.droplets = [];
        this.gameRunning = false;
        this.dropInterval = null;
        this.fallIntervals = []; 
        
       
        this.plantStages = [
            { name: 'seedling', hpMax: 20, size: 0.5 }, 
            { name: 'small', hpMax: 20, size: 0.7 },   
            { name: 'medium', hpMax: 20, size: 1.0 }, 
            { name: 'large', hpMax: 20, size: 1.3 },   
            { name: 'mature', hpMax: 20, size: 1.5 }   
        ];
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
        this.updatePlantAppearance();
        this.startGame();
        
        if (window.IconManager) {
            window.IconManager.replaceIcons();
        }
    }

    loadFromStorage() {
        const saved = localStorage.getItem('waterDrops');
        this.availableDrops = saved ? parseInt(saved, 10) : 20;
        
        const savedHP = localStorage.getItem('plantHP');
        this.plantHP = savedHP ? parseInt(savedHP, 10) : 0;
        
        const savedLevel = localStorage.getItem('plantLevel');
        this.plantLevel = savedLevel ? parseInt(savedLevel, 10) : 1;
        
        const savedTotal = localStorage.getItem('totalDropsCaught');
        this.totalDropsCaught = savedTotal ? parseInt(savedTotal, 10) : 0;
    }

    saveToStorage() {
        localStorage.setItem('waterDrops', this.availableDrops.toString());
        localStorage.setItem('plantHP', this.plantHP.toString());
        localStorage.setItem('plantLevel', this.plantLevel.toString());
        localStorage.setItem('totalDropsCaught', this.totalDropsCaught.toString());
    }

    setupEventListeners() {
        this.pot.addEventListener('mousedown', (e) => this.startDrag(e));
        this.pot.addEventListener('touchstart', (e) => this.startDrag(e));
        
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('touchmove', (e) => this.onDrag(e));
        
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());

        this.gameArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('water-droplet')) {
                this.catchDroplet(e.target);
            }
        });

        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigate(screen);
            });
        });
    }

    startDrag(e) {
        this.isDragging = true;
        e.preventDefault();
    }

    onDrag(e) {
        if (!this.isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const potWidth = this.pot.offsetWidth;
        
        let newX = clientX - gameAreaRect.left - potWidth / 2;
        newX = Math.max(0, Math.min(newX, gameAreaRect.width - potWidth));
        
        this.pot.style.left = newX + 'px';
        this.pot.style.transform = 'none';
        
        this.checkCollisions();
    }

    endDrag() {
        this.isDragging = false;
    }

    startGame() {
        if (this.availableDrops <= 0) {
            this.showStaticDroplet();
            return;
        }
        
        this.gameRunning = true;
        this.clearAllDroplets();
        
        this.dropInterval = setInterval(() => {
            if (this.availableDrops > 0) {
                this.createDroplet();
            } else {
                this.stopGame();
            }
        }, 1500);
    }

    stopGame() {
        this.gameRunning = false;
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
            this.dropInterval = null;
        }
        if (this.availableDrops <= 0) {
            this.showStaticDroplet();
        }
    }

    clearAllDroplets() {
        this.fallIntervals.forEach(interval => clearInterval(interval));
        this.fallIntervals = [];
        this.droplets.forEach(droplet => {
            if (droplet && droplet.parentNode) {
                droplet.parentNode.removeChild(droplet);
            }
        });
        this.droplets = [];
    }

    showStaticDroplet() {
        this.clearAllDroplets();
        
        const droplet = document.createElement('div');
        droplet.className = 'water-droplet static-droplet';
        const gameAreaWidth = this.gameArea.offsetWidth;
        droplet.style.left = (gameAreaWidth / 2 - 16) + 'px';
        droplet.style.top = '25%';
        droplet.style.animation = 'float 2s ease-in-out infinite';
        
        this.dropletsContainer.appendChild(droplet);
        
        this.pot.style.left = '50%';
        this.pot.style.transform = 'translateX(-50%)';
    }

    createDroplet() {
        if (!this.gameRunning || this.availableDrops <= 0) return;
        
        const droplet = document.createElement('div');
        droplet.className = 'water-droplet';
        
        const gameAreaWidth = this.gameArea.offsetWidth;
        const startX = Math.random() * (gameAreaWidth - 32);
        droplet.style.left = startX + 'px';
        droplet.style.top = '-40px';
        droplet.style.width = '32px';
        droplet.style.height = '32px';
        
        this.dropletsContainer.appendChild(droplet);
        this.droplets.push(droplet);
        
        const fallSpeed = 2 + Math.random() * 1.5; 
        let position = -40;
        
        const fallInterval = setInterval(() => {
            position += fallSpeed;
            droplet.style.top = position + 'px';
            
            const gameAreaHeight = this.gameArea.offsetHeight;
            if (position > gameAreaHeight + 40) {
                clearInterval(fallInterval);
                this.fallIntervals = this.fallIntervals.filter(i => i !== fallInterval);
                this.removeDroplet(droplet);
            }
            
            if (this.checkDropletCollision(droplet)) {
                clearInterval(fallInterval);
                this.fallIntervals = this.fallIntervals.filter(i => i !== fallInterval);
                this.catchDroplet(droplet);
            }
        }, 16); 
        
        this.fallIntervals.push(fallInterval);
    }

    checkDropletCollision(droplet) {
        const potRect = this.pot.getBoundingClientRect();
        const dropletRect = droplet.getBoundingClientRect();
        
        return (
            dropletRect.left < potRect.right &&
            dropletRect.right > potRect.left &&
            dropletRect.top < potRect.bottom &&
            dropletRect.bottom > potRect.top
        );
    }

    checkCollisions() {
        this.droplets.forEach(droplet => {
            if (this.checkDropletCollision(droplet)) {
                this.catchDroplet(droplet);
            }
        });
    }

    catchDroplet(droplet) {
        if (!droplet || !droplet.parentNode) return;
        
        if (!droplet.contactCount) {
            droplet.contactCount = 0;
        }
        
        droplet.contactCount++;
        
        const contactsNeeded = 4;
        const currentSize = 32;
        const sizeReduction = currentSize / contactsNeeded;
        const newSize = Math.max(0, currentSize - (droplet.contactCount * sizeReduction));
        
        droplet.style.width = newSize + 'px';
        droplet.style.height = newSize + 'px';
        droplet.style.opacity = 0.5 + (newSize / currentSize) * 0.5;
        
        if (droplet.contactCount >= contactsNeeded || newSize <= 0) {
            droplet.style.transform = 'scale(0)';
            droplet.style.opacity = '0';
            
            setTimeout(() => {
                this.removeDroplet(droplet);
            }, 200);
            
            this.plantHP += 1;
            this.totalDropsCaught += 1;
            
            const newLevel = Math.floor(this.plantHP / 20) + 1;
            if (newLevel > this.plantLevel) {
                this.plantLevel = newLevel;
                this.plantHP = this.plantHP % 20;
                this.updatePlantAppearance();
                this.showLevelUpAnimation();
            }
            
            this.availableDrops--;
            
            this.saveToStorage();
            this.updateUI();
            
            if (this.availableDrops <= 0) {
                this.stopGame();
            }
        }
    }
    
    showLevelUpAnimation() {
        this.plant.style.transition = 'transform 0.5s ease-out';
        this.plant.style.transform = `scale(${this.plantStages[Math.min(this.plantLevel - 1, this.plantStages.length - 1)].size * 1.2})`;
        
        setTimeout(() => {
            this.updatePlantAppearance();
        }, 500);
    }

    removeDroplet(droplet) {
        if (droplet && droplet.parentNode) {
            droplet.parentNode.removeChild(droplet);
        }
        this.droplets = this.droplets.filter(d => d !== droplet);
    }

    updatePlantAppearance() {
        const stageIndex = Math.min(this.plantLevel - 1, this.plantStages.length - 1);
        const stage = this.plantStages[stageIndex];
        
        this.plant.style.transform = `translateX(-50%) scale(${stage.size})`;
        this.plant.style.transition = 'transform 0.3s ease';
        
        const leaves = this.plant.querySelectorAll('.leaf');
        const baseSize = 20;
        const sizeMultiplier = 1 + (this.plantLevel - 1) * 0.3;
        
        leaves.forEach(leaf => {
            leaf.style.width = (baseSize * sizeMultiplier) + 'px';
            leaf.style.height = (baseSize * sizeMultiplier) + 'px';
        });
        
        const stem = this.plant.querySelector('.plant-stem');
        if (stem) {
            stem.style.height = (20 + this.plantLevel * 5) + 'px';
        }
        
        const existingLeaves = this.plant.querySelectorAll('.leaf');
        if (this.plantLevel >= 3 && existingLeaves.length < 3) {
            const newLeaf = document.createElement('div');
            newLeaf.className = 'leaf leaf-top';
            newLeaf.style.width = (baseSize * sizeMultiplier) + 'px';
            newLeaf.style.height = (baseSize * sizeMultiplier) + 'px';
            this.plant.appendChild(newLeaf);
        }
        
        if (this.plantLevel >= 5 && existingLeaves.length < 4) {
            const newLeaf2 = document.createElement('div');
            newLeaf2.className = 'leaf leaf-left-top';
            newLeaf2.style.width = (baseSize * sizeMultiplier * 0.8) + 'px';
            newLeaf2.style.height = (baseSize * sizeMultiplier * 0.8) + 'px';
            newLeaf2.style.left = '10px';
            newLeaf2.style.top = '5px';
            newLeaf2.style.transform = 'rotate(-45deg)';
            this.plant.appendChild(newLeaf2);
        }
    }

    updateUI() {
        const levelTextEl = document.getElementById('levelText');
        const dropsCountEl = document.getElementById('dropsCount');
        const currentHPEl = document.getElementById('currentHP');
        const maxHPEl = document.getElementById('maxHP');
        const hpBarFillEl = document.getElementById('hpBarFill');
        
        if (levelTextEl) {
            levelTextEl.textContent = `${this.plantLevel} уровень`;
        }
        if (dropsCountEl) {
            dropsCountEl.textContent = this.availableDrops;
        }
        if (currentHPEl) {
            currentHPEl.textContent = this.plantHP;
        }
        if (maxHPEl) {
            maxHPEl.textContent = '20';
        }
        if (hpBarFillEl) {
            const hpPercent = (this.plantHP / 20) * 100;
            hpBarFillEl.style.width = hpPercent + '%';
        }
    }

    navigate(screen) {
        if (screen === 'game') return;
        if (screen === 'map' || screen === 'home') {
            window.location.href = 'index.html';
        } else if (screen === 'profile') {
            window.location.href = 'profile.html';
        } else if (screen === 'rating') {
            window.location.href = 'rating.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.waterGame = new WaterGame();
});
