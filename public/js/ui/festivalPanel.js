// public/js/ui/festivalPanel.js

class FestivalPanel {
    constructor() {
        this.container = null;
        this.isOpen = false;
        
        // Define festivals
        this.festivals = [
            {
                id: 'saturnalia',
                name: 'Saturnalia',
                cost: { gold: 100, wood: 50, wheat: 50 },
                duration: 5000, // 5 seconds in real-time
                happinessBonus: 20,
                description: 'Tüm kuralların kalktığı, efendi ve kölenin yer değiştirdiği kış festivali.',
                icon: '🍷'
            },
            {
                id: 'lupercalia',
                name: 'Lupercalia',
                cost: { gold: 50, wood: 20, wheat: 100 },
                duration: 4000,
                happinessBonus: 15,
                description: 'Arınma ve bereket festivali.',
                icon: '🐺'
            },
            {
                id: 'gladiator',
                name: 'Gladyatör Oyunları',
                cost: { gold: 300, wood: 100, wheat: 200 },
                duration: 8000,
                happinessBonus: 40,
                description: 'Halkı coşturacak kanlı arena dövüşleri.',
                icon: '⚔️'
            }
        ];

        this.init();
    }

    init() {
        if (document.getElementById('roman-festival-panel')) return;

        // Overlay/Container
        this.container = document.createElement('div');
        this.container.id = 'roman-festival-panel';
        this.container.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 opacity-0 pointer-events-none transition-opacity duration-300 roman-ui';
        
        // Modal Body
        const modal = document.createElement('div');
        modal.className = 'bg-stone-100 border-4 border-yellow-600 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 text-stone-900 relative';

        // Close Button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-3 right-3 text-2xl font-bold text-red-800 hover:text-red-600 transition-colors';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.close();

        // Title
        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold text-center text-red-800 mb-6 uppercase tracking-wider border-b-2 border-yellow-600 pb-2';
        title.textContent = 'Festivaller';

        // Festival List Container
        const listContainer = document.createElement('div');
        listContainer.className = 'space-y-4';

        // Populate Festivals
        this.festivals.forEach(fest => {
            const item = document.createElement('div');
            item.className = 'bg-white p-4 rounded border-2 border-stone-300 flex justify-between items-center shadow-sm hover:border-yellow-500 transition-colors';

            // Left side (Info)
            const info = document.createElement('div');
            info.className = 'flex-1 pr-4';

            const festTitle = document.createElement('h3');
            festTitle.className = 'text-xl font-bold text-red-800 mb-1 flex items-center';
            festTitle.innerHTML = `<span class="mr-2 text-2xl">${fest.icon}</span> ${fest.name}`;

            const festDesc = document.createElement('p');
            festDesc.className = 'text-sm text-stone-600 mb-2 italic';
            festDesc.textContent = fest.description;

            const festDetails = document.createElement('div');
            festDetails.className = 'text-sm font-semibold flex flex-wrap gap-3 text-stone-800';
            
            // Costs String
            const costStr = Object.entries(fest.cost).map(([res, val]) => {
                const icon = res === 'gold' ? '🪙' : res === 'wood' ? '🌲' : '🌾';
                return `<span class="bg-stone-200 px-2 py-1 rounded text-xs">${icon} ${val}</span>`;
            }).join('');

            festDetails.innerHTML = `
                <div class="flex items-center space-x-1" title="Maliyet">
                    <span class="text-xs text-stone-500 uppercase">Maliyet:</span>
                    ${costStr}
                </div>
                <div class="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300" title="Memnuniyet Bonusu">
                    <span class="text-xl">😊</span> 
                    <span>+${fest.happinessBonus}</span>
                </div>
                <div class="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-300" title="Süre">
                    <span class="text-xl">⏳</span>
                    <span>${fest.duration / 1000}s</span>
                </div>
            `;

            info.appendChild(festTitle);
            info.appendChild(festDesc);
            info.appendChild(festDetails);

            // Right side (Action)
            const actionDiv = document.createElement('div');
            actionDiv.className = 'flex flex-col items-end justify-center min-w-[120px]';

            const startBtn = document.createElement('button');
            startBtn.id = `btn-fest-${fest.id}`;
            startBtn.className = 'bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded border-2 border-yellow-500 shadow-md transition-transform transform hover:scale-105 uppercase text-sm w-full';
            startBtn.textContent = 'Başlat';
            
            const progressBarContainer = document.createElement('div');
            progressBarContainer.id = `prog-bg-${fest.id}`;
            progressBarContainer.className = 'w-full h-2 bg-stone-300 rounded mt-2 overflow-hidden hidden';
            
            const progressBar = document.createElement('div');
            progressBar.id = `prog-${fest.id}`;
            progressBar.className = 'h-full bg-yellow-500 w-0 transition-all ease-linear';
            
            progressBarContainer.appendChild(progressBar);

            startBtn.onclick = () => this.startFestival(fest.id, startBtn, progressBarContainer, progressBar);

            actionDiv.appendChild(startBtn);
            actionDiv.appendChild(progressBarContainer);

            item.appendChild(info);
            item.appendChild(actionDiv);
            listContainer.appendChild(item);
        });

        modal.appendChild(closeBtn);
        modal.appendChild(title);
        modal.appendChild(listContainer);
        this.container.appendChild(modal);

        document.body.appendChild(this.container);

        // Expose to window.RomanUI
        window.RomanUI = window.RomanUI || {};
        window.RomanUI.FestivalPanel = this;
    }

    open() {
        this.isOpen = true;
        this.container.classList.remove('opacity-0', 'pointer-events-none');
        this.container.classList.add('opacity-100', 'pointer-events-auto');
        
        // Pop animation
        const modal = this.container.querySelector('div');
        if (window.gsap) {
            gsap.fromTo(modal, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        }
    }

    close() {
        this.isOpen = false;
        
        const modal = this.container.querySelector('div');
        if (window.gsap) {
            gsap.to(modal, { scale: 0.8, opacity: 0, duration: 0.2, ease: 'power1.in', onComplete: () => {
                this.container.classList.remove('opacity-100', 'pointer-events-auto');
                this.container.classList.add('opacity-0', 'pointer-events-none');
            }});
        } else {
            this.container.classList.remove('opacity-100', 'pointer-events-auto');
            this.container.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    startFestival(id, btnElement, progBgElement, progElement) {
        const fest = this.festivals.find(f => f.id === id);
        if (!fest) return;

        // In a real scenario, here we would check window.RomanUI.ResourceManager to see if we have enough resources
        // For UI implementation, we assume we do or simulate it.
        
        // Disable button
        btnElement.disabled = true;
        btnElement.classList.remove('hover:bg-red-600', 'hover:scale-105');
        btnElement.classList.add('opacity-50', 'cursor-not-allowed');
        btnElement.textContent = 'Devam Ediyor...';
        
        // Show progress
        progBgElement.classList.remove('hidden');
        
        if (window.gsap) {
            gsap.to(progElement, {
                width: '100%',
                duration: fest.duration / 1000,
                ease: 'linear',
                onComplete: () => this.finishFestival(fest, btnElement, progBgElement, progElement)
            });
        } else {
            // Fallback to simple timeout if GSAP is not loaded
            progElement.style.width = '100%';
            progElement.style.transitionDuration = `${fest.duration}ms`;
            setTimeout(() => this.finishFestival(fest, btnElement, progBgElement, progElement), fest.duration);
        }
    }

    finishFestival(fest, btnElement, progBgElement, progElement) {
        // Reset UI
        btnElement.disabled = false;
        btnElement.classList.remove('opacity-50', 'cursor-not-allowed');
        btnElement.classList.add('hover:bg-red-600', 'hover:scale-105');
        btnElement.textContent = 'Başlat';
        
        progBgElement.classList.add('hidden');
        progElement.style.width = '0%';
        if (!window.gsap) {
            progElement.style.transitionDuration = '0ms'; // reset instant
        }

        // Apply reward
        if (window.RomanUI && window.RomanUI.HappinessBar) {
            const currentHappiness = window.RomanUI.HappinessBar.happiness;
            window.RomanUI.HappinessBar.setHappiness(currentHappiness + fest.happinessBonus);
        }
        
        if (window.RomanUI && window.RomanUI.Notifications) {
            window.RomanUI.Notifications.showSuccess(`${fest.name} başarıyla tamamlandı! Memnuniyet +${fest.happinessBonus}`);
        } else {
            console.log(`${fest.name} completed! Happiness +${fest.happinessBonus}`);
        }
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FestivalPanel());
} else {
    new FestivalPanel();
}

export default FestivalPanel;