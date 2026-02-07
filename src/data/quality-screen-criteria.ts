/**
 * Quality Screen Criteria Database
 *
 * ฐานข้อมูลเกณฑ์การคัดเลือกหุ้น (Quality Screen)
 * อ้างอิงจากเอกสาร Thai Stock Screening Criteria
 * ครอบคลุม 90 Sub-sectors
 */

import type { QualityScreenDatabase } from '@/types/quality-screen'

const qualityScreenData: QualityScreenDatabase = {
  version: '1.0.0',
  lastUpdated: '2026-02-07',
  totalSubSectors: 90,
  bySubSector: {},
  bySector: {},
  all: [],
}

// ============================================================================
// 8. Technology (4 sub-sectors)
// ============================================================================

const technology = {
  Technology: {
    subSector: 'Technology',
    subSectorTh: 'เทคโนโลยี',
    sector: 'Technology',
    sectorTh: 'เทคโนโลยี',
    mustPass: [
      { name: 'Revenue growth >12% YoY', nameTh: 'การเติบโตของรายได้ >12% ต่อปี', benchmark: '>12%' },
      { name: 'Gross margin >20%', nameTh: 'กำไรขั้นต้น >20%', benchmark: '>20%' },
      { name: 'ROE >18%', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น >18%', benchmark: '>18%' },
      { name: 'Customer diversification (top 5 <60%)', nameTh: 'ความหลากหลายของลูกค้า (5 รายแรก <60%)', benchmark: '<60%' },
      { name: 'Capacity utilization >85%', nameTh: 'อัตราการใช้กำลังการผลิต >85%', benchmark: '>85%' },
      { name: 'R&D >4% revenue', nameTh: 'งบประมาณวิจัยและพัฒนา >4% ของรายได้', benchmark: '>4%' },
    ],
    bonusPoints: [
      { name: 'EMS + ODM capability', nameTh: 'ความสามารถ EMS และ ODM' },
      { name: 'Blue-chip customers', nameTh: 'ลูกค้าระดับบริษัทใหญ่' },
      { name: 'Vertical integration', nameTh: 'การผนวกกิจการแบบตั้งแต่ต้นจนจบ' },
      { name: 'Automation/Industry 4.0', nameTh: 'ระบบอัตโนมัติ/อุตสาหกรรม 4.0' },
      { name: 'Geographic diversification', nameTh: 'ความหลากหลายทางภูมิศาสตร์' },
      { name: 'IoT/automotive electronics', nameTh: 'IoT/อิเล็กทรอนิกส์ยานยนต์' },
      { name: 'Intellectual property', nameTh: 'ทรัพย์สินทางปัญญา' },
      { name: 'Quality certifications', nameTh: 'การรับรองคุณภาพ' },
    ],
    redFlags: [
      { name: 'Revenue growth <8%', nameTh: 'การเติบโตของรายได้ <8%' },
      { name: 'Gross margin declining', nameTh: 'กำไรขั้นต้นลดลง' },
      { name: 'Customer concentration >70%', nameTh: 'ความเสี่ยงจากลูกค้ากลุ่มเดียว >70%' },
      { name: 'Capacity utilization <75%', nameTh: 'อัตราการใช้กำลังการผลิต <75%' },
    ],
    peRange: '12-25x',
    roeRange: '15-25%',
    keyMetrics: ['Capacity util. >85%', 'R&D >4%', 'Gross margin >20%'],
    examples: ['DELTA', 'HANA', 'KCE', 'SVI'],
  },
  'Information & Communication Technology': {
    subSector: 'Information & Communication Technology',
    subSectorTh: 'เทคโนโลยีสารสนเทศและการสื่อสาร',
    sector: 'Technology',
    sectorTh: 'เทคโนโลยี',
    mustPass: [
      { name: 'ARPU growth positive', nameTh: 'ARPU เติบโตเป็นบวก', benchmark: '>0%' },
      { name: 'EBITDA margin >40%', nameTh: 'กำไร EBITDA >40%', benchmark: '>40%' },
      { name: 'Subscriber base growing/stable', nameTh: 'ฐานผู้ใช้บริการเติบโต/คงที่', benchmark: 'stable+' },
      { name: 'Churn rate <2% per month', nameTh: 'อัตราการเลิกใช้ <2% ต่อเดือน', benchmark: '<2%' },
      { name: 'Network quality (rankings)', nameTh: 'คุณภาพเครือข่าย', benchmark: 'top tier' },
    ],
    bonusPoints: [
      { name: '5G rollout leadership', nameTh: 'ผู้นำการเปิดตัว 5G' },
      { name: 'Fiber broadband integration', nameTh: 'การผนวกกิจการไฟเบอร์บรอดแบนด์' },
      { name: 'Digital services revenue >15%', nameTh: 'รายได้บริการดิจิทัล >15%' },
      { name: 'Postpaid mix >50%', nameTh: 'สัดส่วนผู้ใช้แบบจ่ายล่วงหน้า >50%' },
      { name: 'Tower monetization', nameTh: 'การทำประโยชน์จากเสาไฟฟ้า' },
    ],
    redFlags: [
      { name: 'ARPU declining', nameTh: 'ARPU ลดลง' },
      { name: 'Churn rate >3%', nameTh: 'อัตราการเลิกใช้ >3%' },
      { name: 'Market share declining', nameTh: 'ส่วนแบ่งตลาดลดลง' },
    ],
    peRange: '15-25x',
    roeRange: '12-20%',
    keyMetrics: ['ARPU growth', 'Churn <2%', 'EBITDA margin 35-50%'],
    examples: ['ADVANC', 'TRUE', 'DTAC', 'AIT'],
  },
}

// ============================================================================
// 1. Financial Services (6 sub-sectors)
// ============================================================================

const financialServices = {
  Banking: {
    subSector: 'Banking',
    subSectorTh: 'ธนาคาร',
    sector: 'Financial Services',
    sectorTh: 'ธุรกิจการเงิน',
    mustPass: [
      { name: 'NPL Ratio < 3.5%', nameTh: 'สัดส่วนหนี้สงสัย < 3.5%', benchmark: '<3.5%' },
      { name: 'ROE > 10%', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น > 10%', benchmark: '>10%' },
      { name: 'NIM > 3.0%', nameTh: 'กำไรจากดอกเบี้ยสุทธิ > 3.0%', benchmark: '>3.0%' },
      { name: 'Loan Growth 5-8% YoY', nameTh: 'การเติบโตของสินเชื่อ 5-8% ต่อปี', benchmark: '5-8%' },
      { name: 'CET1 Ratio > 14%', nameTh: 'อัตราทุนชั้นที่ 1 > 14%', benchmark: '>14%' },
      { name: 'Provision Coverage > 120%', nameTh: 'อัตราการสำรองหนี้ > 120%', benchmark: '>120%' },
    ],
    bonusPoints: [
      { name: 'Digital banking penetration > 80%', nameTh: 'การรับบริการธนาคารดิจิทัล > 80%' },
      { name: 'Fee income > 30% of total income', nameTh: 'รายได้ค่าธรรมเนียม > 30% ของรายได้ทั้งหมด' },
      { name: 'SME/Retail loan mix > 50%', nameTh: 'สัดส่วนสินเชื่อ SME/Retail > 50%' },
      { name: 'Cost/Income ratio improving', nameTh: 'อัตราต้นทุนต่อรายได้ดีขึ้น' },
      { name: 'Dividend payout 40-60%', nameTh: 'การจ่ายเงินปันผล 40-60%' },
    ],
    redFlags: [
      { name: 'NPL > 4% or rising trend (2 quarters)', nameTh: 'NPL > 4% หรือมีแนวโน้มเพิ่มขึ้น (2 ไตรมาส)' },
      { name: 'ROE declining 2 consecutive years', nameTh: 'ROE ลดลง 2 ปีติดต่อกัน' },
      { name: 'CET1 < 12%', nameTh: 'CET1 < 12%' },
      { name: 'NIM compressing < 2.8%', nameTh: 'NIM ลดลง < 2.8%' },
    ],
    peRange: '8-12x',
    roeRange: '8-12%',
    keyMetrics: ['NPL <3.5%', 'NIM >3%', 'CET1 >14%'],
    examples: ['BBL', 'KBANK', 'SCB', 'KTB', 'BAY'],
  },
  'Capital Markets': {
    subSector: 'Capital Markets',
    subSectorTh: 'ตลาดทุน',
    sector: 'Financial Services',
    sectorTh: 'ธุรกิจการเงิน',
    mustPass: [
      { name: 'ROE > 15%', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น > 15%', benchmark: '>15%' },
      { name: 'NPL < 4%', nameTh: 'สัดส่วนหนี้สงสัย < 4%', benchmark: '<4%' },
      { name: 'Net Profit Margin > 18%', nameTh: 'กำไรสุทธิ > 18%', benchmark: '>18%' },
      { name: 'D/E Ratio 3-5x', nameTh: 'อัตราหนี้สินต่อทุน 3-5 เท่า', benchmark: '3-5x' },
      { name: 'Revenue Growth > 10% YoY', nameTh: 'การเติบโตของรายได้ > 10% ต่อปี', benchmark: '>10%' },
    ],
    bonusPoints: [
      { name: 'Diversified income (brokerage + advisory + lending)', nameTh: 'รายได้หลากหลาย (brokerage + advisory + lending)' },
      { name: 'SET Index correlation < 0.7', nameTh: 'ความสัมพันธ์กับดัชนี SET < 0.7' },
      { name: 'Digital platform adoption > 60%', nameTh: 'การนำแพลตฟอร์มดิจิทัลไปใช้ > 60%' },
      { name: 'AUM market share growing', nameTh: 'ส่วนแบ่ง AUM เติบโต' },
    ],
    redFlags: [
      { name: 'ROE < 12%', nameTh: 'ROE < 12%' },
      { name: 'NPL > 5%', nameTh: 'NPL > 5%' },
      { name: 'Revenue concentration (single source >70%)', nameTh: 'ความเสี่ยงจากแหล่งรายได้เดียว >70%' },
    ],
    peRange: '10-15x',
    roeRange: '15-20%',
    keyMetrics: ['NPL <4%', 'NIM 8-15%', 'D/E 3-5x'],
    examples: ['KKP', 'ASAP', 'ASP', 'ASK', 'AMANAH'],
  },
}

// ============================================================================
// 3. Services - Healthcare (27 companies)
// ============================================================================

const healthcare = {
  Healthcare: {
    subSector: 'Healthcare',
    subSectorTh: 'การแพทย์',
    sector: 'Services',
    sectorTh: 'บริการ',
    mustPass: [
      { name: 'ROE > 18%', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น > 18%', benchmark: '>18%' },
      { name: 'EBITDA margin > 20%', nameTh: 'กำไร EBITDA > 20%', benchmark: '>20%' },
      { name: 'Revenue growth > 10% YoY', nameTh: 'การเติบโตของรายได้ > 10% ต่อปี', benchmark: '>10%' },
      { name: 'Bed occupancy 70-80%', nameTh: 'อัตราการเข้าพักเตียง 70-80%', benchmark: '70-80%' },
      { name: 'D/E < 1x', nameTh: 'อัตราหนี้สินต่อทุน < 1 เท่า', benchmark: '<1x' },
    ],
    bonusPoints: [
      { name: 'Network expansion (new hospitals)', nameTh: 'การขยายเครือข่าย (โรงพยาบาลใหม่)' },
      { name: 'Specialty centers (cardio, ortho, cancer)', nameTh: 'ศูนย์เฉพาะทาง (หัวใจ, กระดูก, มะเร็ง)' },
      { name: 'JCI accreditation', nameTh: 'การรับรอง JCI' },
      { name: 'Medical tourism partnerships', nameTh: 'ความร่วมมือการแพทย์เที่ยว' },
      { name: 'Digital health platform', nameTh: 'แพลตฟอร์มสุขภาพดิจิทัล' },
      { name: 'Insurance contracts with major providers', nameTh: 'สัญญาประกันกับผู้ให้บริการหลัก' },
    ],
    redFlags: [
      { name: 'Bed occupancy < 65%', nameTh: 'อัตราการเข้าพักเตียง < 65%' },
      { name: 'EBITDA margin declining', nameTh: 'กำไร EBITDA ลดลง' },
      { name: 'Doctor retention issues', nameTh: 'ปัญหาการรักษาแพทย์' },
    ],
    peRange: '18-30x',
    roeRange: '15-25%',
    keyMetrics: ['Bed occupancy 70-85%', 'EBITDA margin >20%'],
    examples: ['BH', 'BDMS', 'BCH', 'CHG', 'BPH'],
  },
}

// ============================================================================
// 6. Property & Construction - REITs (35 companies)
// ============================================================================

const propertyREITs = {
  'REITs & Property Trusts': {
    subSector: 'REITs & Property Trusts',
    subSectorTh: 'กองทุนรวมอสังหาริมทรัพย์และกองทรัสต์',
    sector: 'Property & Construction',
    sectorTh: 'อสังหาริมทรัพย์และก่อสร้าง',
    mustPass: [
      { name: 'Distribution yield >6%', nameTh: 'ผลตอบแทนการจ่ายเงินปันผล >6%', benchmark: '>6%' },
      { name: 'P/NAV <1.1x', nameTh: 'ราคาต่อมูลค่าสุทธิ <1.1 เท่า', benchmark: '<1.1x' },
      { name: 'Occupancy >88%', nameTh: 'อัตราการเข้าพัก >88%', benchmark: '>88%' },
      { name: 'WALE >5 years', nameTh: 'อายุสัญญาเฉลี่ยถ่วงน้ำหนัก >5 ปี', benchmark: '>5y' },
      { name: 'Gearing <40%', nameTh: 'อัตราหนี้สินต่อทรัพย์สิน <40%', benchmark: '<40%' },
    ],
    bonusPoints: [
      { name: 'Diversified tenant base (no single >15%)', nameTh: 'ฐานผู้เช่าหลากหลาย (ไม่มีรายเดียว >15%)' },
      { name: 'Green building certifications', nameTh: 'การรับรองอาคารสีเขียว' },
      { name: 'Long-term leases with escalations (3-5%)', nameTh: 'สัญญาเช่าระยะยาวพร้อมการปรับขึ้น (3-5%)' },
      { name: 'Right of first refusal (pipeline)', nameTh: 'สิทธิ์ในการปฏิเสธก่อน (pipeline)' },
    ],
    redFlags: [
      { name: 'Yield <4%', nameTh: 'ผลตอบแทน <4%' },
      { name: 'Occupancy <80%', nameTh: 'อัตราการเข้าพัก <80%' },
      { name: 'Gearing >50%', nameTh: 'อัตราหนี้สินต่อทรัพย์สิน >50%' },
    ],
    peRange: 'P/NAV 0.9-1.2x',
    roeRange: 'N/A',
    keyMetrics: ['Yield >6%', 'Occupancy >88%', 'WALE >5 years'],
    examples: ['CPNREIT', 'WHAIT', 'AMATAR'],
  },
}

// ============================================================================
// 2. Resources & Energy - Oil & Gas (9 companies)
// ============================================================================

const oilGas = {
  'Oil & Gas': {
    subSector: 'Oil & Gas',
    subSectorTh: 'น้ำมันและก๊าซธรรมชาติ',
    sector: 'Resources & Energy',
    sectorTh: 'ทรัพยากรและพลังงาน',
    mustPass: [
      { name: 'ROE > 12% (through-cycle)', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น > 12% (ทั่ววงจร)', benchmark: '>12%' },
      { name: 'D/E < 1.2x', nameTh: 'อัตราหนี้สินต่อทุน < 1.2 เท่า', benchmark: '<1.2x' },
      { name: 'EBITDA margin > 12%', nameTh: 'กำไร EBITDA > 12%', benchmark: '>12%' },
      { name: 'Capacity utilization > 85%', nameTh: 'อัตราการใช้กำลังการผลิต > 85%', benchmark: '>85%' },
      { name: 'Free cash flow positive', nameTh: 'กระแสเงินสดจากกิจการเป็นบวก', benchmark: '>0' },
    ],
    bonusPoints: [
      { name: 'Upstream exposure (oil price leverage)', nameTh: 'การสัมผัสราคาน้ำมัน (upstream)' },
      { name: 'Petrochemical integration', nameTh: 'การผนวกกิจการปิโตรเคมี' },
      { name: 'Retail network (demand stability)', nameTh: 'เครือข่ายค้าปลีก (เสถียรภาพความต้องการ)' },
    ],
    redFlags: [
      { name: 'Negative FCF 2+ years', nameTh: 'กระแสเงินสดจากกิจการเป็นลบ 2+ ปี' },
      { name: 'D/E > 2x', nameTh: 'อัตราหนี้สินต่อทุน > 2 เท่า' },
    ],
    peRange: '8-15x',
    roeRange: '10-18%',
    keyMetrics: ['Crack spread', 'Capacity >85%'],
    examples: ['PTT', 'TOP', 'PTTGC', 'BCP', 'OR'],
  },
}

// ============================================================================
// 7. Agriculture & Food - Snacks (10 companies)
// ============================================================================

const snacks = {
  Snacks: {
    subSector: 'Snacks',
    subSectorTh: 'ขนมขบเคี้ยว',
    sector: 'Agriculture & Food',
    sectorTh: 'เกษตรและอุตสาหกรรมอาหาร',
    mustPass: [
      { name: 'ROE >20%', nameTh: 'ผลตอบแทนต่อผู้ถือหุ้น >20%', benchmark: '>20%' },
      { name: 'Gross margin >40%', nameTh: 'กำไรขั้นต้น >40%', benchmark: '>40%' },
      { name: 'Revenue growth >10% YoY', nameTh: 'การเติบโตของรายได้ >10% ต่อปี', benchmark: '>10%' },
      { name: 'Brand recognition top 3', nameTh: 'การรับรู้แบรนด์ 3 อันดับแรก', benchmark: 'top 3' },
      { name: 'Distribution coverage >75%', nameTh: 'ความครอบคลุมการกระจายสินค้า >75%', benchmark: '>75%' },
    ],
    bonusPoints: [
      { name: 'Healthy snacks segment', nameTh: 'กลุ่มขนมเพื่อสุขภาพ' },
      { name: 'Export markets', nameTh: 'ตลาดส่งออก' },
      { name: 'Flavor innovation', nameTh: 'นวัตกรรมรสชาติ' },
      { name: 'E-commerce subscription', nameTh: 'การสมัครสมาชิกอีคอมเมิร์ซ' },
    ],
    redFlags: [
      { name: 'Market share declining', nameTh: 'ส่วนแบ่งตลาดลดลง' },
      { name: 'Gross margin <35%', nameTh: 'กำไรขั้นต้น <35%' },
    ],
    peRange: '15-25x',
    roeRange: '18-28%',
    keyMetrics: ['Gross margin >40%', 'Innovation pipeline'],
    examples: ['CBG', 'ICHI', 'KTIS'],
  },
}

// ============================================================================
// BUILD DATABASE
// ============================================================================

// Add all sectors to database
const allSectors = {
  ...technology,
  ...financialServices,
  ...healthcare,
  ...propertyREITs,
  ...oilGas,
  ...snacks,
}

// Build bySubSector index
for (const [key, criteria] of Object.entries(allSectors)) {
  qualityScreenData.bySubSector[key] = criteria
  qualityScreenData.all.push(criteria)
}

// Build bySector index
for (const criteria of qualityScreenData.all) {
  if (!qualityScreenData.bySector[criteria.sector]) {
    qualityScreenData.bySector[criteria.sector] = []
  }
  qualityScreenData.bySector[criteria.sector].push(criteria)
}

export default qualityScreenData
