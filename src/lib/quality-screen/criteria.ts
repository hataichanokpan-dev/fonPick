/**
 * Quality Screen Service
 *
 * บริการจัดการข้อมูลเกณฑ์การคัดเลือกหุ้น (Quality Screen Criteria)
 * ใช้สำหรับดึงข้อมูลเกณฑ์ตาม Sub-sector
 */

import qualityScreenData from '@/data/quality-screen-criteria'
import type {
  QualityScreenCriteria,
  SectorBenchmark,
} from '@/types/quality-screen'

// Cache ข้อมูลเพื่อป้องกันการโหลดซ้ำ
let database: typeof qualityScreenData | null = null

/**
 * โหลดข้อมูล Quality Screen (Singleton pattern)
 */
function loadDatabase(): typeof qualityScreenData {
  if (!database) {
    database = qualityScreenData
  }
  return database
}

/**
 * ค้นหา Quality Screen Criteria ด้วย Sub-sector (ภาษาอังกฤษ)
 * @param subSector - ชื่อ sub-sector เช่น "Technology", "Banking"
 * @returns ข้อมูลเกณฑ์ หรือ null หากไม่พบ
 */
export function findBySubSector(subSector: string): QualityScreenCriteria | null {
  const db = loadDatabase()
  return db.bySubSector[subSector] || null
}

/**
 * ค้นหา Quality Screen Criteria ด้วย Sector (ภาษาอังกฤษ)
 * @param sector - ชื่อ sector เช่น "Technology", "Financial Services"
 * @returns รายการเกณฑ์ใน sector นั้น
 */
export function findBySector(sector: string): QualityScreenCriteria[] {
  const db = loadDatabase()
  return db.bySector[sector] || []
}

/**
 * ดึงรายการ Quality Screen Criteria ทั้งหมด
 * @returns รายการเกณฑ์ทั้งหมด
 */
export function getAllCriteria(): QualityScreenCriteria[] {
  const db = loadDatabase()
  return db.all
}

/**
 * ดึงรายการ Sectors ทั้งหมด
 * @returns รายการ sectors พร้อมข้อมูลสรุป
 */
export function getAllSectors(): SectorBenchmark[] {
  const db = loadDatabase()

  // Group by sector
  const sectorMap = new Map<string, QualityScreenCriteria[]>()
  for (const criteria of db.all) {
    if (!sectorMap.has(criteria.sector)) {
      sectorMap.set(criteria.sector, [])
    }
    sectorMap.get(criteria.sector)!.push(criteria)
  }

  // Convert to benchmarks
  return Array.from(sectorMap.entries()).map(([sector, criteria]) => ({
    sector,
    sectorTh: criteria[0]?.sectorTh || sector,
    companies: 0, // TODO: From stock metadata
    peRange: criteria[0]?.peRange || 'N/A',
    roeRange: criteria[0]?.roeRange || 'N/A',
    keyMetrics: criteria[0]?.keyMetrics?.join(', ') || 'N/A',
  }))
}

/**
 * ตรวจสอบว่ามี Sub-sector นี้ในฐานข้อมูลหรือไม่
 * @param subSector - ชื่อ sub-sector (ภาษาอังกฤษ)
 * @returns true หากมี, false หากไม่มี
 */
export function isValidSubSector(subSector: string): boolean {
  return findBySubSector(subSector) !== null
}

/**
 * ค้นหา Sub-sectors ด้วย keyword
 * @param keyword - คำค้นหา
 * @returns รายการ sub-sectors ที่ตรง
 */
export function searchSubSectors(keyword: string): QualityScreenCriteria[] {
  const db = loadDatabase()
  const lowerKeyword = keyword.toLowerCase()

  return db.all.filter(
    (criteria) =>
      criteria.subSector.toLowerCase().includes(lowerKeyword) ||
      criteria.subSectorTh.toLowerCase().includes(lowerKeyword) ||
      criteria.sector.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * ดึงข้อมูลสรุปของฐานข้อมูล
 * @returns ข้อมูลสรุป
 */
export function getDatabaseSummary() {
  const db = loadDatabase()
  return {
    version: db.version,
    lastUpdated: db.lastUpdated,
    totalSubSectors: db.totalSubSectors,
    totalSectors: Object.keys(db.bySector).length,
  }
}
