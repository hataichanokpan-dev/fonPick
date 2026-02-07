/**
 * Stock Metadata Types
 *
 * ข้อมูลเมตาดาต้าของหุ้นไทย ใช้สำหรับค้นหาและจัดกลุ่มหุ้น
 */

/**
 * ข้อมูลหุ้นแต่ละตัว
 */
export interface StockMetadata {
  /** ชื่อย่อหุ้น เช่น ADVANC, KBANK */
  symbol: string
  /** ชื่อบริษัทภาษาไทย */
  name: string
  /** ตลาดหลักทรัพย์ SET หรือ mai */
  market: 'SET' | 'mai'
  /** หมวดอุตสาหกรรม */
  industry: string
  /** กลุ่มอุตสาหกรรม */
  sector: string
  /** กลุ่มย่อยอุตสาหกรรม (ภาษาไทย) */
  subSector: string
  /** กลุ่มย่อยอุตสาหกรรม (ภาษาอังกฤษ) */
  subSectorEn: string
}

/**
 * โครงสร้างข้อมูลหลักของ Stock Metadata
 */
export interface StockMetadataDatabase {
  /** เวอร์ชันของข้อมูล */
  version: string
  /** เวลาที่อัปเดตล่าสุด */
  lastUpdated: string
  /** จำนวนหุ้นทั้งหมด */
  totalStocks: number
  /** รายการหุ้นทั้งหมด */
  stocks: StockMetadata[]
  /** Index สำหรับค้นหาด้วย symbol (key = symbol, value = StockMetadata) */
  bySymbol: Record<string, StockMetadata>
  /** Index สำหรับค้นหาด้วย sub-sector (key = subSectorEn, value = array of symbols) */
  bySubSector: Record<string, string[]>
  /** Index สำหรับค้นหาด้วย sector (key = sector, value = array of symbols) */
  bySector: Record<string, string[]>
}

/**
 * ผลลัพธ์การค้นหาหุ้น
 */
export interface StockSearchResult {
  /** รายการหุ้นที่พบ */
  stocks: StockMetadata[]
  /** จำนวนทั้งหมด */
  total: number
}

/**
 * Query parameters สำหรับค้นหาหุ้น
 */
export interface StockSearchQuery {
  /** ค้นหาด้วย symbol (exact match) */
  symbol?: string
  /** ค้นหาด้วยชื่อบริษัท (partial match) */
  name?: string
  /** ค้นหาด้วยตลาด */
  market?: 'SET' | 'mai'
  /** ค้นหาด้วย sector */
  sector?: string
  /** ค้นหาด้วย sub-sector (ภาษาอังกฤษ) */
  subSector?: string
  /** ค้นหาด้วย industry */
  industry?: string
  /** จำกัดจำนวนผลลัพธ์ */
  limit?: number
  /** ข้ามจำนวนผลลัพธ์ (สำหรับ pagination) */
  offset?: number
}

/**
 * ข้อมูลสรุปของ Sector/Sub-sector
 */
export interface SectorSummary {
  /** ชื่อ sector/sub-sector */
  name: string
  /** ชื่อภาษาอังกฤษ */
  nameEn: string
  /** จำนวนหุ้นในกลุ่ม */
  count: number
  /** รายชื่อหุ้น */
  symbols: string[]
}
