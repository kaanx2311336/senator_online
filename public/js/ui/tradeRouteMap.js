class TradeRouteMap {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.isOpen = false;
        
        this.ports = [];
        this.routes = [];
        this.ships = [];
        
        this.selectedShip = null;
        
        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'trade-route-map-container';
        this.container.className = 'roman-ui hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
        
        // Create map panel
        const mapPanel = document.createElement('div');
        mapPanel.className = 'relative bg-stone-800 border-4 border-yellow-600 rounded-lg shadow-2xl p-6 w-[800px] h-[600px] max-w-[95vw] max-h-[95vh] flex flex-col';
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';
        
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold text-yellow-500';
        title.innerText = 'Ticaret Rotaları';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-400 hover:text-white transition-colors text-2xl font-bold leading-none px-2';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.hide();
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Canvas container
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'flex-1 relative bg-blue-900/30 border-2 border-stone-600 rounded overflow-hidden';
        
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'w-full h-full cursor-pointer absolute top-0 left-0';
        this.ctx = this.canvas.getContext('2d');
        
        canvasContainer.appendChild(this.canvas);
        
        // Ship Details Tooltip
        this.shipTooltip = document.createElement('div');
        this.shipTooltip.id = 'trade-ship-tooltip';
        this.shipTooltip.className = 'hidden absolute bg-stone-800/95 border-2 border-yellow-500 text-white p-3 rounded shadow-lg text-sm z-10 pointer-events-none roman-ui';
        canvasContainer.appendChild(this.shipTooltip);
        
        // Legend
        const legend = document.createElement('div');
        legend.className = 'mt-4 flex gap-4 text-sm text-gray-300 justify-center';
        legend.innerHTML = `
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-500"></span> Aktif</div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-yellow-500"></span> Beklemede</div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500"></span> Tehlikede</div>
        `;
        
        mapPanel.appendChild(header);
        mapPanel.appendChild(canvasContainer);
        mapPanel.appendChild(legend);
        
        this.container.appendChild(mapPanel);
        document.body.appendChild(this.container);
        
        // Event Listeners
        window.addEventListener('resize', () => {
            if (this.isOpen) this.resizeCanvas();
        });
        
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    }

    show() {
        this.isOpen = true;
        this.container.classList.remove('hidden');
        this.resizeCanvas();
        this.render();
    }

    hide() {
        this.isOpen = false;
        this.container.classList.add('hidden');
        this.hideTooltip();
    }

    toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }

    // Mock data update method
    updateData(ports, routes, ships) {
        this.ports = ports || [];
        this.routes = routes || [];
        this.ships = ships || [];
        if (this.isOpen) this.render();
    }

    render() {
        if (!this.ctx || !this.isOpen) return;
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.clearRect(0, 0, w, h);
        
        // Draw grid
        this.drawGrid(w, h);
        
        // Draw routes
        this.routes.forEach(route => this.drawRoute(route, w, h));
        
        // Draw ports
        this.ports.forEach(port => this.drawPort(port, w, h));
        
        // Draw ships
        this.ships.forEach(ship => this.drawShip(ship, w, h));
    }

    drawGrid(w, h) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        this.ctx.beginPath();
        for (let x = 0; x <= w; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
        }
        this.ctx.stroke();
    }

    // Maps relative 0-1 coordinates to canvas pixels
    getPixelCoords(x, y, w, h) {
        return {
            px: x * w,
            py: y * h
        };
    }

    drawRoute(route, w, h) {
        const start = this.ports.find(p => p.id === route.startId);
        const end = this.ports.find(p => p.id === route.endId);
        
        if (!start || !end) return;
        
        const p1 = this.getPixelCoords(start.x, start.y, w, h);
        const p2 = this.getPixelCoords(end.x, end.y, w, h);
        
        this.ctx.beginPath();
        this.ctx.moveTo(p1.px, p1.py);
        this.ctx.lineTo(p2.px, p2.py);
        
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 2;
        
        if (route.status === 'active') {
            this.ctx.strokeStyle = '#22c55e'; // green-500
        } else if (route.status === 'pending') {
            this.ctx.strokeStyle = '#eab308'; // yellow-500
        } else if (route.status === 'danger') {
            this.ctx.strokeStyle = '#ef4444'; // red-500
        } else {
            this.ctx.strokeStyle = '#6b7280'; // gray-500
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawPort(port, w, h) {
        const { px, py } = this.getPixelCoords(port.x, port.y, w, h);
        
        // Outer glow
        this.ctx.beginPath();
        this.ctx.arc(px, py, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = port.isHome ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
        
        // Inner circle
        this.ctx.beginPath();
        this.ctx.arc(px, py, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = port.isHome ? '#eab308' : '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Cinzel, serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(port.name, px, py - 16);
    }

    drawShip(ship, w, h) {
        const { px, py } = this.getPixelCoords(ship.x, ship.y, w, h);
        
        // Rotate ship based on route direction (simplistic)
        let angle = 0;
        const route = this.routes.find(r => r.id === ship.routeId);
        if (route) {
            const start = this.ports.find(p => p.id === route.startId);
            const end = this.ports.find(p => p.id === route.endId);
            if (start && end) {
                // If moving towards end
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                angle = Math.atan2(dy, dx);
                // Adjust if moving backwards
                if (ship.progress < 0) angle += Math.PI; 
            }
        }
        
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(angle);
        
        // Draw boat shape
        this.ctx.beginPath();
        this.ctx.moveTo(8, 0);
        this.ctx.lineTo(-6, -5);
        this.ctx.lineTo(-6, 5);
        this.ctx.closePath();
        
        if (ship.status === 'danger') {
            this.ctx.fillStyle = '#ef4444'; // Red for danger
        } else {
            this.ctx.fillStyle = '#60a5fa'; // Blue for active
        }
        
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw mast/sail
        this.ctx.beginPath();
        this.ctx.moveTo(-2, 0);
        this.ctx.lineTo(-2, -8);
        this.ctx.lineTo(4, 0);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        
        this.ctx.restore();
    }

    getShipAtCursor(x, y) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const hitRadius = 15; // Hitbox radius
        
        for (let i = this.ships.length - 1; i >= 0; i--) {
            const ship = this.ships[i];
            const { px, py } = this.getPixelCoords(ship.x, ship.y, w, h);
            
            const dx = x - px;
            const dy = y - py;
            if (Math.sqrt(dx*dx + dy*dy) <= hitRadius) {
                return ship;
            }
        }
        return null;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const hoveredShip = this.getShipAtCursor(x, y);
        
        if (hoveredShip) {
            this.canvas.style.cursor = 'pointer';
            if (this.selectedShip !== hoveredShip) {
               // Only show tooltip on hover if we want, or keep it for click. Let's do click as per instructions.
               // Actually, instructions say "Gemi tıklanınca detay", let's wait for click.
            }
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedShip = this.getShipAtCursor(x, y);
        
        if (clickedShip) {
            this.showShipDetails(clickedShip, x, y);
        } else {
            this.hideTooltip();
        }
    }

    showShipDetails(ship, x, y) {
        const statusColors = {
            'active': 'text-green-400',
            'pending': 'text-yellow-400',
            'danger': 'text-red-400'
        };
        const statusText = {
            'active': 'Seyirde',
            'pending': 'Bekliyor',
            'danger': 'Saldırı Altında'
        };

        this.shipTooltip.innerHTML = `
            <div class="font-bold text-yellow-500 border-b border-yellow-700/50 pb-1 mb-2">${ship.name}</div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                <div class="text-gray-400">Durum:</div>
                <div class="${statusColors[ship.status] || 'text-white'} font-semibold">${statusText[ship.status] || ship.status}</div>
                
                <div class="text-gray-400">Kargo:</div>
                <div class="text-white">${ship.cargo}</div>
                
                <div class="text-gray-400">Varış:</div>
                <div class="text-white">${ship.eta}s</div>
                
                <div class="text-gray-400">Kar Tahmini:</div>
                <div class="text-green-400 font-bold">+${ship.profit} <span class="text-yellow-500">Altın</span></div>
            </div>
        `;
        
        this.shipTooltip.classList.remove('hidden');
        
        // Position tooltip
        const w = this.canvas.width;
        const tooltipRect = this.shipTooltip.getBoundingClientRect();
        
        let tx = x + 15;
        let ty = y + 15;
        
        // Prevent going off-screen
        if (tx + tooltipRect.width > w) tx = x - tooltipRect.width - 15;
        
        this.shipTooltip.style.left = `${tx}px`;
        this.shipTooltip.style.top = `${ty}px`;
    }

    hideTooltip() {
        this.shipTooltip.classList.add('hidden');
    }
}

// Global attach
window.RomanUI = window.RomanUI || {};
window.RomanUI.TradeRouteMap = new TradeRouteMap();

// For testing/mocking initial view if needed
/*
window.RomanUI.TradeRouteMap.updateData(
    [
        { id: 1, name: 'Roma', x: 0.2, y: 0.5, isHome: true },
        { id: 2, name: 'İskenderiye', x: 0.8, y: 0.8, isHome: false },
        { id: 3, name: 'Kartaca', x: 0.4, y: 0.9, isHome: false }
    ],
    [
        { id: 10, startId: 1, endId: 2, status: 'active' },
        { id: 11, startId: 1, endId: 3, status: 'danger' }
    ],
    [
        { id: 100, routeId: 10, name: 'Gemi 1', x: 0.5, y: 0.65, cargo: 'Şarap (50)', eta: 45, profit: 200, status: 'active' },
        { id: 101, routeId: 11, name: 'Gemi 2', x: 0.3, y: 0.7, cargo: 'Zeytinyağı (30)', eta: 120, profit: 150, status: 'danger' }
    ]
);
*/
