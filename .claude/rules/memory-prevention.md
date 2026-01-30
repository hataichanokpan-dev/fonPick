# Memory Leak Prevention

## Critical Rules (ระดับวิกฤติ)

### 1. Firebase Singleton Pattern (สำคัญที่สุด)

Firebase App ต้องเป็น Singleton อย่างแท้จริง ห้ามสร้างใหม่ทุกครั้ง:

```typescript
// ❌ WRONG: สร้าง app ใหม่ทุกครั้ง
export function getRTDB() {
  const app = initializeApp(firebaseConfig) // สร้างซ้ำ!
  return getDatabase(app)
}

// ✅ CORRECT: Singleton pattern
let app: App | null = null

export function getRTDB() {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return getDatabase(app)
}
```

**ตรวจสอบ:** หากใช้ Firebase หรือ SDK ที่มี lifecycle ยาวนาน ต้องมีการ singleton

---

### 2. Context Data Accumulation

Context ที่เก็บข้อมูลต้องมี cleanup mechanism:

```typescript
// ❌ WRONG: เก็บข้อมูลไม่มี limit
const [data, setData] = useState<Data[]>([])
useEffect(() => {
  const unsub = onValue(ref, (snapshot) => {
    setData(prev => [...prev, snapshot.val()]) // เพิ่มเรื่อยๆ ไม่ลบ
  })
  return unsub
}, [])

// ✅ CORRECT: มี cleanup timer
const [data, setData] = useState<Data[]>([])
useEffect(() => {
  const unsub = onValue(ref, (snapshot) => {
    setData(prev => [...prev, snapshot.val()])
  })

  // Cleanup เก่าๆ ทุก 30 นาที
  const cleanup = setInterval(() => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
    setData(prev => prev.filter(d => d.timestamp > thirtyMinutesAgo))
  }, 30 * 60 * 1000)

  return () => {
    unsub()
    clearInterval(cleanup)
  }
}, [])
```

**ตรวจสอบ:** ทุก Context ที่เก็บ array ของข้อมูลที่เพิ่มขึ้นเรื่อยๆ

---

### 3. Duplicate Function Calls

ห้ามเรียก function หนักๆ ซ้ำใน render cycle เดียว:

```typescript
// ❌ WRONG: เรียกซ้ำใน fallback
function processData(data: Data[]) {
  try {
    return detectCrossRankings(data)
  } catch {
    console.error('First attempt failed')
    return detectCrossRankings(data) // เรียกซ้ำ!
  }
}

// ✅ CORRECT: จัดการ error อย่างถูกต้อง
function processData(data: Data[]) {
  try {
    return detectCrossRankings(data)
  } catch (error) {
    console.error('Processing failed:', error)
    return [] // หรือค่า default ที่ปลอดภัย
  }
}
```

**ตรวจสอบ:** Function ที่มีการคำนวณหนักๆ อย่ามี try-catch ที่เรียกตัวเองซ้ำ

---

### 4. Framer Motion Overuse

Framer Motion ใช้ memory สูง ใช้เฉพาะที่จำเป็น:

```typescript
// ❌ WRONG: ใช้ Framer Motion ทุก card
<motion.div animate={{ opacity: 1 }}>
  {items.map(item => (
    <motion.div key={item.id} animate={{ y: 0 }}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// ✅ CORRECT: CSS animations สำหรับพื้นฐาน
<div className="fade-in">
  {items.map(item => (
    <div key={item.id} className="slide-up">
      {item.content}
    </div>
  ))}
</motion.div>

// CSS
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes slide-up { from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
```

**กฎ:** ใช้ Framer Motion เฉพาะ:
- Gesture interactions (drag, pinch)
- Complex layout animations
- Physics-based animations

**ใช้ CSS สำหรับ:**
- Fade in/out
- Slide up/down
- Scale
- Hover effects

---

## Memory Budget Guidelines

| Component Type | Max Memory | Notes |
|----------------|------------|-------|
| Single Context | < 50 MB | ต้องมี cleanup ถ้าเก็บ array |
| Dashboard Card | < 10 MB | รวม state + listeners |
| Page Total | < 200 MB | รวมทุก context + components |
| Dev Mode | < 500 MB | จะสูงกว่า production |

---

## Detection Checklist

ก่อน commit โค้ดใหม่ ตรวจสอบ:

- [ ] Firebase/SDK มี singleton pattern
- [ ] Context ที่เก็บ array มี cleanup timer
- [ ] ไม่มี function call ซ้ำใน try-catch
- [ ] Framer Motion ใช้เฉพาะที่จำเป็นจริงๆ
- [ ] ไม่มี `useEffect` ที่ subscribe แล้วไม่ unsubscribe
- [ ] ไม่มี closure ที่ capture large objects

---

## Testing Memory Usage

```bash
# Dev mode
npm run dev

# Production test
npm run build && npm start
```

Chrome DevTools → Memory:
1. ถ่าย Heap Snapshot
2. ทำงานปกติ 5-10 นาที
3. ถ่าย Snapshot อีกครั้ง
4. Compare: เพิ่มขึ้นไม่เกิน 50 MB

---

## Red Flags ⚠️

เหล่านี้เป็นสัญญาณ warning:

1. `initializeApp`, `createClient` อยู่ใน loop/component
2. `setData(prev => [...prev, newData])` โดยไม่มี cleanup
3. `<motion.*>` ใน map ที่วนหลายร้อยรายการ
4. `try { fn() } catch { fn() }` pattern
5. `useEffect` ไม่มี return cleanup สำหรับ subscriptions
6. **Hooks หลัง early return (if/return) → Rules of Hooks violation**

---

## Rules of Hooks Compliance

❌ WRONG: Hooks หลัง early return
```typescript
function Component() {
  const [state, setState] = useState()  // Hook 1
  const { data } = useHook()  // Hook 2

  if (loading) {
    return <Skeleton />  // ตอนนี้เรียก 2 hooks
  }

  const memoized = useMemo(...)  // Hook 3 → ไม่ถึง!
}
```

✅ CORRECT: Hooks ทั้งหมดก่อน conditionals
```typescript
function Component() {
  const [state, setState] = useState()  // Hook 1
  const { data } = useHook()  // Hook 2
  const memoized = useMemo(...)  // Hook 3 - เสมอ

  if (loading) {
    return <Skeleton />
  }
}
```
