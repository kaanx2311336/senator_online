// js/ui/topBar.js

const resources = {
    wood: { label: 'Odun', value: 500, icon: '🌲' },
    wheat: { label: 'Buğday', value: 300, icon: '🌾' },
    population: { label: 'Nüfus', value: 50, icon: '🧑' },
    gold: { label: 'Altın', value: 1000, icon: '🪙' }
};

function initTopBar() {
    const topBar = document.createElement('div');
    topBar.id = 'roman-top-bar';
    topBar.className = 'fixed top-0 left-0 w-full bg-red-800 border-b-2 border-yellow-500 gold-border p-2 flex justify-around items-center z-50 roman-ui shadow-lg text-white';
    
    for (const [key, data] of Object.entries(resources)) {
        const item = document.createElement('div');
        item.className = 'flex items-center';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'resource-icon text-2xl';
        iconSpan.textContent = data.icon;
        
        const valueSpan = document.createElement('span');
        valueSpan.id = `resource-${key}`;
        valueSpan.className = 'resource-value ml-2';
        valueSpan.textContent = `${data.label}: ${data.value}`;
        
        item.appendChild(iconSpan);
        item.appendChild(valueSpan);
        
        topBar.appendChild(item);
    }
    
    document.body.appendChild(topBar);
}

export function updateResource(type, value) {
    if (resources[type] !== undefined) {
        resources[type].value = value;
        const valueSpan = document.getElementById(`resource-${type}`);
        if (valueSpan) {
            valueSpan.textContent = `${resources[type].label}: ${value}`;
        }
    } else {
        console.warn(`Resource type "${type}" not found.`);
    }
}

// Automatically initialize when the module is loaded (if DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopBar);
} else {
    initTopBar();
}
