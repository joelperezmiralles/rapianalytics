import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

// App state
let rawData = [];
let charts = {
    aparato: null,
    motivo: null,
    detail: null
};

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadSection = document.getElementById('upload-section');
const dashboardSection = document.getElementById('dashboard-section');
const resetBtn = document.getElementById('reset-btn');
const fileNameDisplay = document.getElementById('file-name-display');
const aparatoFilter = document.getElementById('aparato-filter');
const motivoFilter = document.getElementById('motivo-filter');
const themeToggle = document.getElementById('theme-toggle');

// Initialize
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    resetBtn.addEventListener('click', () => {
        dashboardSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.value = '';
    });

    aparatoFilter.addEventListener('change', () => {
        populateMotivoFilter();
        updateDetailChart();
    });

    motivoFilter.addEventListener('change', updateDetailChart);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggle.textContent = isLight ? '🌙' : '🌓';
        // Refresh charts to update label/grid colors
        if (rawData.length) initCharts();
    });

    // Chart type toggles
    document.querySelectorAll('.btn-chart-type').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartKey = e.target.dataset.chart;
            const type = e.target.dataset.type;
            
            // UI update
            e.target.parentElement.querySelectorAll('.btn-chart-type').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            toggleChartType(chartKey, type);
        });
    });
}

function handleFileSelect(e) {
    if (e.target.files.length) handleFile(e.target.files[0]);
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        
        // Parse JSON
        const allData = XLSX.utils.sheet_to_json(worksheet);
        
        // Filter out "ACEPTACIÓN PRESUPUESTO" as requested
        rawData = allData.filter(row => 
            row.Motivo_Avería && 
            row.Motivo_Avería.toString().trim().toUpperCase() !== 'ACEPTACIÓN PRESUPUESTO'
        ).map(row => {
            // Normalize motifs
            return {
                ...row,
                Motivo_Avería: normalizeMotivo(row.Motivo_Avería)
            };
        });
        
        if (rawData.length === 0) {
            alert('El archivo no contiene avisos válidos para analizar (se han excluido los de Aceptación Presupuesto o el archivo está vacío).');
            return;
        }

        processAndShowDashboard(file.name);
    };
    reader.readAsArrayBuffer(file);
}

function processAndShowDashboard(fileName) {
    fileNameDisplay.textContent = fileName;
    
    // 1. Basic Stats
    const totalAvisos = rawData.reduce((sum, row) => sum + (Number(row.Avisos) || 0), 0);
    const uniqueAparatos = [...new Set(rawData.map(row => row.Aparato))].filter(Boolean);
    const uniqueMotivos = [...new Set(rawData.map(row => row.Motivo_Avería))].filter(Boolean);

    document.getElementById('total-avisos').textContent = totalAvisos.toLocaleString();
    document.getElementById('total-aparatos').textContent = uniqueAparatos.length;
    document.getElementById('total-motivos').textContent = uniqueMotivos.length;

    // 2. Prep Filters
    populateAparatoFilter(uniqueAparatos);
    populateMotivoFilter();

    // 3. Create Charts
    initCharts();

    // Show Dashboard
    uploadSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
}

function initCharts() {
    // Aparato Summary
    const aparatoData = groupAndSum(rawData, 'Aparato');
    const topAparatos = {
        labels: aparatoData.labels.slice(0, 15),
        values: aparatoData.values.slice(0, 15)
    };
    
    charts.aparato = createChart('aparato-chart', {
        type: 'bar',
        labels: topAparatos.labels,
        data: topAparatos.values,
        label: 'Top 15 Aparatos por Volumen',
        colors: generateGradients(topAparatos.labels.length)
    });

    // Motivo Summary
    const motivoData = groupAndSum(rawData, 'Motivo_Avería');
    const topMotivos = motivoData.data.sort((a,b) => b.value - a.value).slice(0, 15);
    
    charts.motivo = createChart('motivo-chart', {
        type: 'bar',
        labels: topMotivos.map(m => m.label),
        data: topMotivos.map(m => m.value),
        label: 'Avisos por Motivo',
        colors: generateGradients(topMotivos.length, true)
    });

    updateDetailChart();
}

function populateAparatoFilter(uniques) {
    const currentVal = aparatoFilter.value;
    aparatoFilter.innerHTML = '<option value="all">Todos los aparatos</option>';
    uniques.sort().forEach(ap => {
        const opt = document.createElement('option');
        opt.value = ap;
        opt.textContent = ap;
        aparatoFilter.appendChild(opt);
    });
    if (uniques.includes(currentVal)) aparatoFilter.value = currentVal;
}

function populateMotivoFilter(resetSelection = true) {
    const selectedAparato = aparatoFilter.value;
    let filtered = rawData;
    if (selectedAparato !== 'all') {
        filtered = rawData.filter(row => row.Aparato === selectedAparato);
    }
    
    const uniqueMotivos = [...new Set(filtered.map(row => row.Motivo_Avería))].filter(Boolean).sort();
    
    const currentVal = motivoFilter.value;
    motivoFilter.innerHTML = '<option value="all">Todos los motivos</option>';
    uniqueMotivos.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        motivoFilter.appendChild(opt);
    });
    
    if (!resetSelection && uniqueMotivos.includes(currentVal)) {
        motivoFilter.value = currentVal;
    } else {
        motivoFilter.value = 'all';
    }
}

function groupAndSum(data, key) {
    const grouped = data.reduce((acc, row) => {
        const val = row[key];
        if (!val) return acc;
        acc[val] = (acc[val] || 0) + (Number(row.Avisos) || 0);
        return acc;
    }, {});

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1]);

    return {
        labels: sorted.map(i => i[0]),
        values: sorted.map(i => i[1]),
        data: sorted.map(i => ({ label: i[0], value: i[1] }))
    };
}

function createChart(canvasId, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing
    if (Chart.getChart(canvasId)) {
        Chart.getChart(canvasId).destroy();
    }

    const isHorizontal = config.type === 'bar' && (canvasId === 'motivo-chart' || canvasId === 'detail-chart');
    const isLight = document.body.classList.contains('light-theme');
    const labelColor = isLight ? '#64748b' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';

    return new Chart(ctx, {
        type: config.type,
        data: {
            labels: config.labels,
            datasets: [{
                label: config.label,
                data: config.data,
                backgroundColor: config.colors,
                borderRadius: 8,
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            indexAxis: isHorizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: config.type !== 'bar',
                    position: 'bottom',
                    labels: { color: labelColor, font: { family: 'Outfit' } }
                },
                tooltip: {
                    backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)',
                    titleColor: isLight ? '#0f172a' : '#f8fafc',
                    bodyColor: isLight ? '#0f172a' : '#f8fafc',
                    titleFont: { family: 'Outfit', size: 14 },
                    bodyFont: { family: 'Outfit', size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                },
                datalabels: {
                    display: config.type !== 'bar',
                    color: '#fff',
                    font: {
                        family: 'Outfit',
                        weight: 'bold',
                        size: 11
                    },
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowBlur: 4
                }
            },
            scales: config.type === 'bar' ? {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: labelColor }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: labelColor }
                }
            } : {}
        }
    });
}

function updateDetailChart() {
    const selectedAparato = aparatoFilter.value;
    const selectedMotivo = motivoFilter.value;
    
    let filtered = rawData;
    
    if (selectedAparato !== 'all') {
        filtered = filtered.filter(row => row.Aparato === selectedAparato);
    }
    if (selectedMotivo !== 'all') {
        filtered = filtered.filter(row => row.Motivo_Avería === selectedMotivo);
    }

    const detailData = groupAndSum(filtered, 'Motivo_Avería');
    const displayData = detailData.data.slice(0, 20); // Show top 20

    charts.detail = createChart('detail-chart', {
        type: 'bar',
        labels: displayData.map(d => d.label),
        data: displayData.map(d => d.value),
        label: `Distribución (Filtrado)`,
        colors: generateGradients(displayData.length)
    });
}

function toggleChartType(key, type) {
    const chart = charts[key];
    if (!chart) return;

    const data = chart.data;
    const labels = data.labels;
    const values = data.datasets[0].data;
    const label = data.datasets[0].label;

    charts[key] = createChart(`${key}-chart`, {
        type,
        labels,
        data: values,
        label,
        colors: generateGradients(labels.length, key === 'motivo')
    });
}

function generateGradients(count, reverse = false) {
    const colors = [
        'rgba(99, 102, 241, 0.8)',   // Indigo
        'rgba(6, 182, 212, 0.8)',   // Cyan
        'rgba(217, 70, 239, 0.8)',  // Fuchsia
        'rgba(16, 185, 129, 0.8)',  // Emerald
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(139, 92, 246, 0.8)',  // Violet
        'rgba(20, 184, 166, 0.8)',  // Teal
    ];
    
    if (reverse) colors.reverse();
    
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

function normalizeMotivo(text) {
    if (!text) return '';
    
    // 1. Basic cleanup: Uppercase, trim, remove special characters like *, ., -
    let clean = text.toString()
        .toUpperCase()
        .trim()
        .replace(/^\W+|\W+$/g, '') // Remove non-word characters from start/end (like **, ., -, _)
        .replace(/\.+$/g, '');      // Remove trailing dots specifically

    // 2. Mapping Table (Synonyms / Consolidations)
    const mapping = {
        // Power/Starter issues
        'NO ARRANCA': 'NO ENCIENDE',
        'NO SE ENCIENDE': 'NO ENCIENDE',
        'NO FUNCIONA': 'NO ENCIENDE',
        'NO FUNCIONA BIEN': 'NO ENCIENDE',
        'NO VA': 'NO ENCIENDE',
        'SALTA DIFERENCIAL': 'CORTOCIRCUITO / DIFERENCIAL',
        'SE APAGA': 'SE APAGA SOLO',
        
        // Cooling/Heating General
        'NO ENFRIA NADA': 'NO ENFRIA',
        'NO SALE AIRE FRIO': 'NO ENFRIA',
        'NO SALE AIRE CALIENTE': 'NO CALIENTA',
        'NO SALE AIRE': 'NO SALE AIRE',
        'NO CALIENTA': 'NO CALIENTA',
        
        // Boiler (Caldera) specific
        'NO TIENE AGUA CALIENTE': 'NO SALE AGUA CALIENTE',
        'NO HAY AGUA CALIENTE': 'NO SALE AGUA CALIENTE',
        'NO VA EL AGUA CALIENTE': 'NO SALE AGUA CALIENTE',
        'NO CALIENTA EL AGUA': 'NO SALE AGUA CALIENTE',
        'NO SALE ACS': 'NO SALE AGUA CALIENTE',
        'NO ACS': 'NO SALE AGUA CALIENTE',
        'SIN AGUA CALIENTE': 'NO SALE AGUA CALIENTE',
        'NO FUNCIONA LA CALEFACCION': 'FALLO CALEFACCIÓN',
        'NO FUNCIONA LA CALEFACCIÓN': 'FALLO CALEFACCIÓN',
        'SIN CALEFACCION': 'FALLO CALEFACCIÓN',
        
        // Water leaks
        'PIERDE AGUA POR EL SPLIT': 'PIERDE AGUA',
        'TIRA AGUA': 'PIERDE AGUA',
        'GOTEA': 'PIERDE AGUA',
        'PIERDE MUCHA AGUA': 'PIERDE AGUA',
        'PIERDE AGUA POR ABAJO': 'PIERDE AGUA',
        
        // Appliances specific
        'NO DESAGUA': 'NO DESAGUA',
        'NO TIRA EL AGUA': 'NO DESAGUA',
        'NO CENTRIFUGA': 'NO CENTRIFUGA',
        'HACE MUCHO RUIDO AL CENTRIFUGAR': 'RUIDO AL CENTRIFUGAR',
        'NO COGE AGUA': 'NO ENTRA AGUA',
        'NO ENTRA AGUA': 'NO ENTRA AGUA',
        
        // Maintenance
        'HACER REVISION': 'REVISIÓN',
        'HACER REVISIÓN': 'REVISIÓN',
        'REVISION': 'REVISIÓN',
        'REVISION ANUAL': 'REVISIÓN',
        'REVISIÓN ANUAL': 'REVISIÓN',
        'REALIZAR MANTENIMIENTO': 'REVISIÓN',
        'MANTENIMIENTO': 'REVISIÓN',
        
        // Noisy
        'HACE RUIDO': 'HACE MUCHO RUIDO',
        'HACE RUIDOS': 'HACE MUCHO RUIDO',
        'RUIDO': 'HACE MUCHO RUIDO'
    };

    // Apply mapping if it exists
    if (mapping[clean]) return mapping[clean];

    // Catch-all for very similar strings (fuzzy-ish)
    if (clean.includes('AGUA CALIENTE') || clean.includes('ACS')) return 'NO SALE AGUA CALIENTE';
    if (clean.includes('NO ENFRIA')) return 'NO ENFRIA';
    if (clean.includes('PIERDE AGUA')) return 'PIERDE AGUA';
    if (clean.includes('NO ENCIENDE') || clean.includes('NO ARRANCA')) return 'NO ENCIENDE';
    if (clean.includes('NO DESAGUA')) return 'NO DESAGUA';
    if (clean.includes('CALEFACCION') || clean.includes('CALEFACCIÓN')) return 'FALLO CALEFACCIÓN';

    return clean;
}

init();
