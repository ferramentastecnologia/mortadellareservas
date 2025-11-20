// Configuração das Mesas - Mortadella Ristorante

export type TableArea = 'interna';

export interface TableConfig {
  number: number;
  capacity: number;
  area: TableArea;
  description?: string;
}

// 15 Mesas de 4 lugares cada
const areaInterna: TableConfig[] = Array.from({ length: 15 }, (_, i) => ({
  number: i + 1,
  capacity: 4,
  area: 'interna' as TableArea,
}));

// Todas as mesas
export const ALL_TABLES: TableConfig[] = [...areaInterna];

// Constantes
export const TOTAL_TABLES = ALL_TABLES.length; // 15 mesas
export const TOTAL_CAPACITY = ALL_TABLES.reduce((sum, table) => sum + table.capacity, 0); // 60 pessoas

// Helper functions
export function getTablesByArea(area: TableArea): TableConfig[] {
  return ALL_TABLES.filter(table => table.area === area);
}

export function getTableByNumber(number: number): TableConfig | undefined {
  return ALL_TABLES.find(table => table.number === number);
}

export function getTableCapacity(number: number): number {
  const table = getTableByNumber(number);
  return table?.capacity || 4;
}

export function calculateTablesNeeded(people: number): number {
  // Todas as mesas são de 4 lugares
  return Math.ceil(people / 4);
}

// Nomes das áreas para exibição
export const AREA_NAMES: Record<TableArea, string> = {
  'interna': 'Área Interna',
};
