# RapitecnicAnalytics Dashboard 📊

Una herramienta de análisis interactivo diseñada para la visualización y el desglose de datos de averías de electrodomésticos. Este proyecto permite cargar archivos Excel, procesar la información y generar dashboards dinámicos para una mejor toma de decisiones.

## 🌟 Características

- **Carga de Archivos Excel:** Importación directa de archivos `.xlsx` y `.xls`.
- **Dashboards Interactivos:** Gráficos dinámicos utilizando Chart.js (Barras, Rosquilla, Circular).
- **Filtrado Avanzado:** Capacidad de filtrar datos por tipo de aparato y motivo de avería.
- **Normalización de Datos:** Consolida motivos de avería similares para un análisis más limpio.
- **Tematización Dinámica:** Soporte completo para Modo Oscuro y Modo Claro.
- **Diseño Premium:** Interfaz moderna con animaciones fluidas y estética "glassmorphism".

## 🛠️ Tecnologías Utilizadas

- **Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Gráficos:** [Chart.js](https://www.chartjs.org/) con el plugin `chartjs-plugin-datalabels`.
- **Procesamiento de Datos:** [SheetJS (XLSX)](https://sheetjs.com/).
- **Entorno de Desarrollo:** [Vite](https://vitejs.dev/).

## 🚀 Instalación y Uso

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu sistema.

### Pasos para ejecutar localmente

1. **Clona el repositorio o descarga los archivos.**
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. **Abre tu navegador en:** `http://localhost:5173` (o el puerto que indique la terminal).

## 📊 Formato de Datos Esperado

Para que el dashboard funcione correctamente, el archivo Excel debe contener las siguientes columnas (las cabeceras pueden variar pero el sistema busca patrones):

| Avisos | Aparato | Motivo_Avería |
|--------|---------|---------------|
| 12345  | Lavadora| No centrifuga |
| 67890  | Horno    | No calienta   |

## 📂 Estructura del Proyecto

- `index.html`: Estructura principal de la aplicación.
- `main.js`: Lógica de procesamiento de datos, gestión de archivos y generación de gráficos.
- `style.css`: Sistema de diseño, temas y animaciones.
- `package.json`: Configuración de dependencias y scripts de npm.

---

Diseñado con ❤️ por **Rapitecnic Analytics**.
