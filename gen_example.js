const XLSX = require('xlsx');

const data = [
    { Avisos: 263, Aparato: 'LAVAVAJILLAS', Motivo_Avería: 'NO DESAGUA' },
    { Avisos: 238, Aparato: 'FRIGORIFICO', Motivo_Avería: 'NO ENFRIA' },
    { Avisos: 179, Aparato: 'FRIGORIFICO', Motivo_Avería: 'NO ENFRIA NADA' },
    { Avisos: 171, Aparato: 'AIRE ACONDICIONADO', Motivo_Avería: 'NO ENFRIA' },
    { Avisos: 164, Aparato: 'LAVADORA', Motivo_Avería: 'PIERDE AGUA' },
    { Avisos: 152, Aparato: 'LAVADORA', Motivo_Avería: 'NO DESAGUA' },
    { Avisos: 150, Aparato: 'LAVADORA', Motivo_Avería: 'NO CENTRIFUGA' },
    { Avisos: 135, Aparato: 'AIRE ACONDICIONADO', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 123, Aparato: 'CALDERA', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 96, Aparato: 'LAVAVAJILLAS', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 94, Aparato: 'LAVADORA', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 93, Aparato: 'FRIGORIFICO', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 73, Aparato: 'SECADORA', Motivo_Avería: 'NO SECA' },
    { Avisos: 69, Aparato: 'LAVADORA', Motivo_Avería: 'RUIDO AL CENTRIFUGAR' },
    { Avisos: 65, Aparato: 'TERMO ELECTRICO', Motivo_Avería: 'ACEPTACIÓN PRESUPUESTO' },
    { Avisos: 64, Aparato: 'TERMO ELECTRICO', Motivo_Avería: 'PIERDE AGUA' },
    { Avisos: 63, Aparato: 'CALDERA', Motivo_Avería: 'PIERDE AGUA' },
    { Avisos: 63, Aparato: 'LAVAVAJILLAS', Motivo_Avería: 'PIERDE AGUA' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Avisos");
XLSX.writeFile(wb, "ejemplo_averias.xlsx");
console.log("Ejemplo de Excel generado: ejemplo_averias.xlsx");
