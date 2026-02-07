/**
 * Stock Metadata Service
 *
 * บริการจัดการข้อมูลเมตาดาต้าของหุ้นไทย
 * ใช้สำหรับค้นหาและจัดกลุ่มหุ้นตาม sector, sub-sector, ฯลฯ
 */

import {
  type StockMetadata,
  type StockMetadataDatabase,
  type StockSearchQuery,
  type StockSearchResult,
  type SectorSummary,
} from '@/types/stock-metadata'
import stocksData from '@/data/stocks.json'

// Cache ข้อมูลเพื่อป้องกันการอ่านไฟล์ซ้ำ
let database: StockMetadataDatabase | null = null

/**
 * โหลดข้อมูล Stock Metadata (Singleton pattern)
 */
function loadDatabase(): StockMetadataDatabase {
  if (!database) {
    database = stocksData as unknown as StockMetadataDatabase
  }
  return database
}

/**
 * ค้นหาหุ้นด้วย Symbol (Exact match)
 * @param symbol - ชื่อย่อหุ้น เช่น ADVANC, KBANK
 * @returns ข้อมูลหุ้น หรือ null หากไม่พบ
 */
export function findBySymbol(symbol: string): StockMetadata | null {
  const db = loadDatabase()
  const normalizedSymbol = symbol.toUpperCase().trim()
  return db.bySymbol[normalizedSymbol] || null
}

/**
 * ค้นหาหุ้นด้วย Sub-sector
 * @param subSector - ชื่อ sub-sector (ภาษาอังกฤษ) เช่น "Technology", "Banking"
 * @returns รายการหุ้นใน sub-sector นั้น
 */
export function findBySubSector(subSector: string): StockMetadata[] {
  const db = loadDatabase()
  const normalizedSector = subSector.trim()
  const symbols = db.bySubSector[normalizedSector] || []
  return symbols.map(symbol => db.bySymbol[symbol]).filter(Boolean)
}

/**
 * ค้นหาหุ้นด้วย Sector
 * @param sector - ชื่อ sector เช่น "เทคโนโลยี", "ธนาคาร"
 * @returns รายการหุ้นใน sector นั้น
 */
export function findBySector(sector: string): StockMetadata[] {
  const db = loadDatabase()
  const normalizedSector = sector.trim()
  const symbols = db.bySector[normalizedSector] || []
  return symbols.map(symbol => db.bySymbol[symbol]).filter(Boolean)
}

/**
 * ค้นหาหุ้นด้วย Market
 * @param market - ตลาดหลักทรัพย์ "SET" หรือ "mai"
 * @returns รายการหุ้นในตลาดนั้น
 */
export function findByMarket(market: 'SET' | 'mai'): StockMetadata[] {
  const db = loadDatabase()
  return db.stocks.filter(stock => stock.market === market)
}

/**
 * ค้นหาหุ้นแบบ Advanced Search
 * @param query - Query parameters
 * @returns ผลลัพธ์การค้นหา
 */
export function searchStocks(query: StockSearchQuery): StockSearchResult {
  const db = loadDatabase()
  let results = [...db.stocks]

  // Filter by symbol (exact match)
  if (query.symbol) {
    const normalizedSymbol = query.symbol.toUpperCase().trim()
    results = results.filter(stock => stock.symbol === normalizedSymbol)
  }

  // Filter by name (partial match, case-insensitive)
  if (query.name) {
    const searchName = query.name.toLowerCase()
    results = results.filter(stock =>
      stock.name.toLowerCase().includes(searchName)
    )
  }

  // Filter by market
  if (query.market) {
    results = results.filter(stock => stock.market === query.market)
  }

  // Filter by sector
  if (query.sector) {
    const searchSector = query.sector.toLowerCase()
    results = results.filter(stock =>
      stock.sector.toLowerCase().includes(searchSector)
    )
  }

  // Filter by sub-sector (ภาษาอังกฤษ)
  if (query.subSector) {
    const searchSubSector = query.subSector.toLowerCase()
    results = results.filter(stock =>
      stock.subSectorEn.toLowerCase().includes(searchSubSector)
    )
  }

  // Filter by industry
  if (query.industry) {
    const searchIndustry = query.industry.toLowerCase()
    results = results.filter(stock =>
      stock.industry.toLowerCase().includes(searchIndustry)
    )
  }

  // Apply offset (pagination)
  const offset = query.offset || 0
  if (offset > 0) {
    results = results.slice(offset)
  }

  // Apply limit
  const limit = query.limit || results.length
  const limitedResults = results.slice(0, limit)

  return {
    stocks: limitedResults,
    total: results.length,
  }
}

/**
 * ดึงรายการ Sub-sectors ทั้งหมด
 * @returns รายการ sub-sectors พร้อมจำนวนหุ้น
 */
export function getAllSubSectors(): SectorSummary[] {
  const db = loadDatabase()
  return Object.entries(db.bySubSector).map(([name, symbols]) => ({
    name: name,
    nameEn: name,
    count: symbols.length,
    symbols: symbols.sort(),
  })).sort((a, b) => b.count - a.count)
}

/**
 * ดึงรายการ Sectors ทั้งหมด
 * @returns รายการ sectors พร้อมจำนวนหุ้น
 */
export function getAllSectors(): SectorSummary[] {
  const db = loadDatabase()
  return Object.entries(db.bySector).map(([name, symbols]) => ({
    name: name,
    nameEn: name,
    count: symbols.length,
    symbols: symbols.sort(),
  })).sort((a, b) => b.count - a.count)
}

/**
 * ตรวจสอบว่ามี Symbol นี้ในฐานข้อมูลหรือไม่
 * @param symbol - ชื่อย่อหุ้น
 * @returns true หากมี, false หากไม่มี
 */
export function isValidSymbol(symbol: string): boolean {
  return findBySymbol(symbol) !== null
}

/**
 * ดึงข้อมูลสรุปของฐานข้อมูล
 * @returns ข้อมูลสรุป เช่น จำนวนหุ้นทั้งหมด, จำนวน sectors, ฯลฯ
 */
export function getDatabaseSummary() {
  const db = loadDatabase()
  return {
    version: db.version,
    lastUpdated: db.lastUpdated,
    totalStocks: db.totalStocks,
    totalSectors: Object.keys(db.bySector).length,
    totalSubSectors: Object.keys(db.bySubSector).length,
    setCount: db.stocks.filter(s => s.market === 'SET').length,
    maiCount: db.stocks.filter(s => s.market === 'mai').length,
  }
}

/**
 * ค้นหาหลาย Symbols พร้อมกัน
 * @param symbols - รายการชื่อย่อหุ้น
 * @returns Map ของ symbol และข้อมูล (สำหรับ symbol ที่ไม่พบจะไม่มีใน Map)
 */
export function findManyBySymbols(symbols: string[]): Map<string, StockMetadata> {
  const result = new Map<string, StockMetadata>()
  const db = loadDatabase()

  for (const symbol of symbols) {
    const normalizedSymbol = symbol.toUpperCase().trim()
    const stock = db.bySymbol[normalizedSymbol]
    if (stock) {
      result.set(normalizedSymbol, stock)
    }
  }

  return result
}
