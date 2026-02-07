/**
 * Quality Screen Criteria Types
 *
 * ประเภทข้อมูลสำหรับเก็บเกณฑ์การคัดเลือกหุ้น (Quality Screen)
 * อ้างอิงจากเอกสาร Thai Stock Screening Criteria
 */

/**
 * เกณฑ์ที่ต้องผ่าน (Must Pass)
 */
export interface MustPassCriterion {
  /** ชื่อเกณฑ์ */
  name: string
  /** ชื่อเกณฑ์ภาษาไทย */
  nameTh: string
  /** ค่าอ้างอิง (เช่น ">10%", "<3.5") */
  benchmark: string
}

/**
 * คะแนนโบนัส (Bonus Points)
 */
export interface BonusPoint {
  /** ชื่อโบนัส */
  name: string
  /** ชื่อโบนัสภาษาไทย */
  nameTh: string
  /** รายละเอียดเพิ่มเติม */
  description?: string
  /** รายละเอียดภาษาไทย */
  descriptionTh?: string
}

/**
 * สัญญาณเตือน (Red Flags)
 */
export interface RedFlag {
  /** ชื่อสัญญาณเตือน */
  name: string
  /** ชื่อสัญญาณเตือนภาษาไทย */
  nameTh: string
  /** รายละเอียด */
  description?: string
  /** รายละเอียดภาษาไทย */
  descriptionTh?: string
}

/**
 * เกณฑ์การคัดเลือกสำหรับ Sub-sector หนึ่งๆ
 */
export interface QualityScreenCriteria {
  /** ชื่อ Sub-sector (ภาษาอังกฤษ) */
  subSector: string
  /** ชื่อ Sub-sector (ภาษาไทย) */
  subSectorTh: string
  /** ชื่อ Sector (ภาษาอังกฤษ) */
  sector: string
  /** ชื่อ Sector (ภาษาไทย) */
  sectorTh: string
  /** เกณฑ์ที่ต้องผ่านทั้งหมด */
  mustPass: MustPassCriterion[]
  /** คะแนนโบนัสทั้งหมด */
  bonusPoints: BonusPoint[]
  /** สัญญาณเตือนทั้งหมด */
  redFlags: RedFlag[]
  /** ช่วง P/E ปกติ */
  peRange?: string
  /** ช่วง ROE ปกติ */
  roeRange?: string
  /** Key Metrics เพิ่มเติม */
  keyMetrics?: string[]
  /** ตัวอย่างหุ้นในกลุ่ม */
  examples?: string[]
}

/**
 * ฐานข้อมูล Quality Screen Criteria ทั้งหมด
 */
export interface QualityScreenDatabase {
  version: string
  lastUpdated: string
  totalSubSectors: number
  /** Index ด้วย sub-sector name (ภาษาอังกฤษ) */
  bySubSector: Record<string, QualityScreenCriteria>
  /** Index ด้วย sector name (ภาษาอังกฤษ) -> array of sub-sectors */
  bySector: Record<string, QualityScreenCriteria[]>
  /** รายการ sub-sectors ทั้งหมด */
  all: QualityScreenCriteria[]
}

/**
 * ข้อมูล Sector Benchmark
 */
export interface SectorBenchmark {
  /** ชื่อ Sector */
  sector: string
  /** ชื่อ Sector ภาษาไทย */
  sectorTh: string
  /** จำนวนบริษัท */
  companies: number
  /** ช่วง P/E */
  peRange: string
  /** ช่วง ROE */
  roeRange: string
  /** Key Metrics */
  keyMetrics: string
}

/**
 * ข้อมูลสรุป Sector ทั้งหมด
 */
export interface SectorsSummary {
  sectors: SectorBenchmark[]
}
