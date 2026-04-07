/**
 * MotorcycleAssembly — sticky right-rail component.
 *
 * Cruiser-style motorcycle matching the Jagdamba Automobiles store logo:
 * V-twin engine with cooling fins, 8-spoke chrome wheels, sweeping exhaust,
 * teardrop tank with racing stripe, and motion speed lines.
 *
 * Tracks the ENTIRE page scroll (useScroll without a target).
 * Parts assemble as progress goes 0→1 and disassemble in reverse.
 */
import { useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'

// ─── Part labels ─────────────────────────────────────────────────────────────
const LABELS = [
  { at: 0.00, text: 'Starting the build…' },
  { at: 0.06, text: 'Fitting rear wheel' },
  { at: 0.14, text: 'Fitting front wheel' },
  { at: 0.22, text: 'Building the frame' },
  { at: 0.30, text: 'Mounting the swingarm' },
  { at: 0.38, text: 'Installing V-twin engine' },
  { at: 0.46, text: 'Fitting exhaust pipes' },
  { at: 0.54, text: 'Mounting the fuel tank' },
  { at: 0.62, text: 'Adding the seat' },
  { at: 0.70, text: 'Front fork assembly' },
  { at: 0.78, text: 'Fitting handlebars' },
  { at: 0.86, text: 'Installing headlight' },
  { at: 0.90, text: 'Road Ready' },
]

function getLabel(v: number) {
  let out = LABELS[0]
  for (const l of LABELS) if (v >= l.at) out = l
  return out
}

// ─── Animated part wrapper ────────────────────────────────────────────────────
function Part({
  children, p, start, end, dy = '0px', dx = '0px', scale0 = 1,
}: {
  children: React.ReactNode
  p: MotionValue<number>
  start: number; end: number; dy?: string; dx?: string; scale0?: number
}) {
  const e = Math.max(end, start + 0.001)
  const opacity = useTransform(p, [start, e], [0, 1])
  const y      = useTransform(p, [start, e], [dy, '0px'])
  const x      = useTransform(p, [start, e], [dx, '0px'])
  const scale  = useTransform(p, [start, e], [scale0, 1])
  return <motion.g style={{ opacity, y, x, scale }}>{children}</motion.g>
}

// ─── Detailed 8-spoke cruiser wheel ──────────────────────────────────────────
function Wheel({ cx, cy, r = 55 }: { cx: number; cy: number; r?: number }) {
  const rimOuter = r * 0.81
  const rimInner = r * 0.72
  const hub      = r * 0.16

  const spokes = Array.from({ length: 8 }, (_, i) => {
    const rad = (i * 45 * Math.PI) / 180
    return {
      x1: cx + (hub + 6) * Math.sin(rad),
      y1: cy - (hub + 6) * Math.cos(rad),
      x2: cx + rimInner * Math.sin(rad),
      y2: cy - rimInner * Math.cos(rad),
    }
  })

  return (
    <g>
      {/* Tyre layers */}
      <circle cx={cx} cy={cy} r={r}      fill="#07090F" />
      <circle cx={cx} cy={cy} r={r - 4}  fill="#040710" />
      <circle cx={cx} cy={cy} r={r - 9}  fill="#08101C" />
      {/* Chrome rim rings */}
      <circle cx={cx} cy={cy} r={rimOuter + 1} fill="none" stroke="#0E1828" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={rimOuter}      fill="none" stroke="#2A4468" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={rimOuter - 4}  fill="none" stroke="#4C6E92" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={rimOuter - 7}  fill="none" stroke="#1A2E48" strokeWidth="1" />
      {/* Inner disc */}
      <circle cx={cx} cy={cy} r={rimInner} fill="#06091400" />
      {/* 8 spokes — two-pass for depth */}
      {spokes.map((s, i) => (
        <g key={i}>
          <line {...s} stroke="#09111E" strokeWidth="4" />
          <line {...s} stroke="#1C3252" strokeWidth="2" />
          <line {...s} stroke="#3A5A7E" strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
      {/* Hub plate */}
      <circle cx={cx} cy={cy} r={hub + 9} fill="#0A1628" stroke="#162B44" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={hub + 5} fill="#112238" stroke="#223D5E" strokeWidth="1.5" />
      {/* Hub cap chrome */}
      <circle cx={cx} cy={cy} r={hub}     fill="#3A5878" />
      <circle cx={cx} cy={cy} r={hub - 3} fill="#6A94BC" />
      <circle cx={cx} cy={cy} r={hub - 6} fill="#9EC4DC" />
    </g>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MotorcycleAssembly() {
  const { scrollYProgress: p } = useScroll()

  const [labelText, setLabelText]   = useState(LABELS[0].text)
  const [isComplete, setIsComplete] = useState(false)

  useMotionValueEvent(p, 'change', (v) => {
    setLabelText(getLabel(v).text)
    setIsComplete(v >= 0.90)
  })

  const progressWidth = useTransform(p, [0, 1], ['0%', '100%'])
  const glowOpacity   = useTransform(p, [0.88, 1.0], [0, 1])

  // Coordinate key:
  // Ground y=284  |  Rear wheel cx=112 cy=226 r=58  |  Front wheel cx=358 cy=234 r=50
  // Both wheels touch ground: 226+58=284, 234+50=284

  return (
    <div className="moto-rail-inner">

      {/* Top heading */}
      <div className="moto-rail-heading">
        <span className="moto-rail-label">Built from parts</span>
        <h2 className="moto-rail-title">Watch it come<br /><em>together</em></h2>
      </div>

      {/* Motorcycle SVG — 460×288 viewBox */}
      <div className="moto-rail-svg-wrap">
        <svg
          viewBox="0 0 460 288"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="moto-rail-svg"
          aria-hidden="true"
        >

          {/* 1 · Ground shadow */}
          <Part p={p} start={0.00} end={0.07} dy="8px">
            <ellipse cx="234" cy="282" rx="198" ry="7"  fill="rgba(0,0,0,0.45)" />
            <ellipse cx="234" cy="282" rx="154" ry="4"  fill="rgba(249,115,22,0.07)" />
          </Part>

          {/* 2 · Rear wheel + fender + sprocket */}
          <Part p={p} start={0.06} end={0.16} dy="52px">
            <Wheel cx={112} cy={226} r={58} />
            {/* Rear sprocket rings visible on chain side */}
            <circle cx={112} cy={226} r={22} fill="none" stroke="#182C40" strokeWidth="4" />
            <circle cx={112} cy={226} r={17} fill="none" stroke="#0E1C2C" strokeWidth="2.5" />
            {/* Rear fender — arcs over top of wheel at 65° each side */}
            {/* Outer: r=67, from (51,198) to (173,198)  Inner: r=58 from (59,202) to (165,202) */}
            <path
              d="M 51 198 A 67 67 0 0 1 173 198 L 165 202 A 58 58 0 0 0 59 202 Z"
              fill="#0E1A2C" stroke="#1A2E44" strokeWidth="1"
            />
            <path d="M 59 202 A 58 58 0 0 1 165 202"
              stroke="#243848" strokeWidth="1" fill="none" />
          </Part>

          {/* 3 · Front wheel + fender */}
          <Part p={p} start={0.14} end={0.24} dy="52px">
            <Wheel cx={358} cy={234} r={50} />
            {/* Front fender — outer r=59 inner r=50, at 58° each side */}
            {/* Outer: (307,202) to (409,202)  Inner: (316,207) to (400,207) */}
            <path
              d="M 308 203 A 59 59 0 0 1 408 203 L 400 208 A 50 50 0 0 0 316 208 Z"
              fill="#0E1A2C" stroke="#1A2E44" strokeWidth="1"
            />
          </Part>

          {/* 4 · Main cruiser frame */}
          <Part p={p} start={0.22} end={0.33} dy="-28px" scale0={0.92}>
            {/* Steering head tube */}
            <rect x="318" y="130" width="14" height="34" rx="6"
              fill="#0C1828" stroke="#1C2E44" strokeWidth="1.5"
              transform="rotate(5 325 147)" />

            {/* Main backbone spine — nearly horizontal (cruiser style) */}
            <path d="M 322 133 C 285 126 205 128 152 140"
              stroke="#060E1A" strokeWidth="17" strokeLinecap="round" fill="none" />
            <path d="M 322 133 C 285 126 205 128 152 140"
              stroke="#0D1C2E" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M 322 133 C 285 126 205 128 152 140"
              stroke="#1A3050" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 322 133 C 285 126 205 128 152 140"
              stroke="#2E4C6A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Down tube — steering head to front engine mount */}
            <path d="M 318 158 Q 305 178 292 196"
              stroke="#060E1A" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 318 158 Q 305 178 292 196"
              stroke="#0D1C2E" strokeWidth="8"  strokeLinecap="round" fill="none" />
            <path d="M 318 158 Q 305 178 292 196"
              stroke="#1A2E48" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Seat subframe rail */}
            <path d="M 152 140 C 142 148 128 158 118 168"
              stroke="#060E1A" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M 152 140 C 142 148 128 158 118 168"
              stroke="#0D1C2E" strokeWidth="7"  strokeLinecap="round" fill="none" />
            <path d="M 152 140 C 142 148 128 158 118 168"
              stroke="#1A2E48" strokeWidth="2"  strokeLinecap="round" fill="none" />

            {/* Lower cradle tube — runs under engine */}
            <path d="M 292 196 Q 224 210 152 196"
              stroke="#050C18" strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M 292 196 Q 224 210 152 196"
              stroke="#0B192C" strokeWidth="8"  strokeLinecap="round" fill="none" />
            <path d="M 292 196 Q 224 210 152 196"
              stroke="#182C42" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </Part>

          {/* 5 · Swingarm */}
          <Part p={p} start={0.28} end={0.37} dx="-24px">
            <path d="M 154 190 Q 136 206 113 226"
              stroke="#050B17" strokeWidth="19" strokeLinecap="round" fill="none" />
            <path d="M 154 190 Q 136 206 113 226"
              stroke="#0D1A2C" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M 154 190 Q 136 206 113 226"
              stroke="#1A2C3E" strokeWidth="5"  strokeLinecap="round" fill="none" />
            <path d="M 155 191 Q 137 207 114 227"
              stroke="#2E4458" strokeWidth="2"  strokeLinecap="round" fill="none" />
            {/* Axle adjuster block */}
            <rect x="100" y="218" width="26" height="16" rx="5"
              fill="#0C1828" stroke="#1A2C3E" strokeWidth="1.5" />
            <rect x="103" y="221" width="20" height="10" rx="3"
              fill="#162436" />
          </Part>

          {/* 6 · V-twin engine */}
          <Part p={p} start={0.30} end={0.42} dy="-28px">
            {/* Main crankcase */}
            <rect x="178" y="176" width="94" height="46" rx="9"
              fill="#091624" stroke="#172A3E" strokeWidth="1.5" />
            {/* Oil sump */}
            <path d="M 184 222 Q 225 234 266 222 L 266 216 Q 225 227 184 216 Z"
              fill="#07101E" stroke="#13202E" strokeWidth="1" />

            {/* Primary drive cover */}
            <ellipse cx="184" cy="196" rx="15" ry="19"
              fill="#0C1828" stroke="#1A2C40" strokeWidth="1.5" />
            <ellipse cx="184" cy="196" rx="9"  ry="12"
              fill="#162438" stroke="#243C54" strokeWidth="1" />
            <circle  cx="184" cy="196" r="4"
              fill="#2A4060" />

            {/* Front sprocket + drive chain */}
            <circle cx="186" cy="215" r="12"
              fill="#09162A" stroke="#1A2E44" strokeWidth="1.5" />
            <circle cx="186" cy="215" r="8"
              fill="none" stroke="#243C54" strokeWidth="2" />
            <circle cx="186" cy="215" r="4"
              fill="#3A5878" />
            <path d="M 187 219 Q 157 223 114 227"
              stroke="#05101C" strokeWidth="7"   strokeLinecap="round" fill="none" />
            <path d="M 187 219 Q 157 223 114 227"
              stroke="#102034" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 187 219 Q 157 223 114 227"
              stroke="#1E3248" strokeWidth="2"   strokeLinecap="round" fill="none" />

            {/* ── REAR CYLINDER (near-vertical, slight forward lean) ── */}
            <g transform="rotate(-10 217 178)">
              <rect x="205" y="130" width="24" height="50" rx="5"
                fill="#0E1C30" stroke="#1A2E44" strokeWidth="1.5" />
              {/* Cooling fins */}
              {[137, 144, 151, 158, 165, 172].map((fy, i) => (
                <line key={i} x1={202} y1={fy} x2={232} y2={fy}
                  stroke="#243C56" strokeWidth="2" />
              ))}
              {/* Cylinder head */}
              <rect x="203" y="126" width="28" height="12" rx="5"
                fill="#0C1828" stroke="#1E3248" strokeWidth="1.5" />
              {/* Valve cover bolts */}
              <circle cx="210" cy="127" r="3" fill="#2A4464" stroke="#3A5878" strokeWidth="1" />
              <circle cx="226" cy="127" r="3" fill="#2A4464" stroke="#3A5878" strokeWidth="1" />
              {/* Spark plug */}
              <line x1="218" y1="122" x2="218" y2="115"
                stroke="#3A5878" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ── FRONT CYLINDER (angled ~46° forward) ── */}
            <g transform="rotate(-46 251 174)">
              <rect x="239" y="128" width="24" height="50" rx="5"
                fill="#0E1C30" stroke="#1A2E44" strokeWidth="1.5" />
              {/* Cooling fins */}
              {[135, 142, 149, 156, 163, 170].map((fy, i) => (
                <line key={i} x1={236} y1={fy} x2={266} y2={fy}
                  stroke="#243C56" strokeWidth="2" />
              ))}
              {/* Cylinder head */}
              <rect x="237" y="124" width="28" height="12" rx="5"
                fill="#0C1828" stroke="#1E3248" strokeWidth="1.5" />
              {/* Valve cover bolts */}
              <circle cx="244" cy="125" r="3" fill="#2A4464" stroke="#3A5878" strokeWidth="1" />
              <circle cx="260" cy="125" r="3" fill="#2A4464" stroke="#3A5878" strokeWidth="1" />
              {/* Spark plug */}
              <line x1="251" y1="120" x2="251" y2="113"
                stroke="#3A5878" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Timing / cam cover circle */}
            <circle cx="252" cy="198" r="13"
              fill="#09162A" stroke="#182C40" strokeWidth="1.5" />
            <circle cx="252" cy="198" r="8"
              fill="none" stroke="#1E3050" strokeWidth="2" />
            <circle cx="252" cy="198" r="3.5"
              fill="#2A4460" />
          </Part>

          {/* 7 · Exhaust pipes — sweeping back under the engine */}
          <Part p={p} start={0.38} end={0.50} dx="-32px">
            {/* Rear cylinder header */}
            <path d="M 212 196 Q 196 218 184 228 Q 168 238 148 236 Q 130 234 116 228"
              stroke="#060E1A" strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M 212 196 Q 196 218 184 228 Q 168 238 148 236 Q 130 234 116 228"
              stroke="#142436" strokeWidth="7"  strokeLinecap="round" fill="none" />
            <path d="M 213 197 Q 197 219 185 229 Q 169 239 149 237 Q 131 235 117 229"
              stroke="#2A4060" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Front cylinder header — sweeps wider then back */}
            <path d="M 254 198 Q 243 215 228 226 Q 208 240 186 244 Q 162 248 146 242"
              stroke="#060E1A" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M 254 198 Q 243 215 228 226 Q 208 240 186 244 Q 162 248 146 242"
              stroke="#142436" strokeWidth="6"  strokeLinecap="round" fill="none" />
            <path d="M 255 199 Q 244 216 229 227 Q 209 241 187 245 Q 163 249 147 243"
              stroke="#2A4060" strokeWidth="2"  strokeLinecap="round" fill="none" />

            {/* Muffler body */}
            <rect x="86" y="220" width="56" height="18" rx="8"
              fill="#0C1828" stroke="#1A2C40" strokeWidth="1.5" />
            <rect x="90" y="223" width="48" height="12" rx="6"
              fill="#0F1E30" />
            {/* Chrome highlight strip on muffler */}
            <path d="M 93 224 L 136 224"
              stroke="#2A4060" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            {/* End cap */}
            <ellipse cx="88"  cy="229" rx="9"  ry="9"
              fill="#070F1A" stroke="#152030" strokeWidth="1.5" />
            <ellipse cx="88"  cy="229" rx="5"  ry="5"
              fill="#030810" />
            {/* Outlet tip */}
            <ellipse cx="142" cy="229" rx="6"  ry="7"
              fill="#060C14" stroke="#0E1C2A" strokeWidth="1" />
            <ellipse cx="142" cy="229" rx="3.5" ry="4"
              fill="#030810" />
          </Part>

          {/* 8 · Teardrop fuel tank */}
          <Part p={p} start={0.46} end={0.58} dy="-34px">
            {/* Main tank body */}
            <path
              d="M 176 149
                 C 161 138 157 116 176 100
                 Q 218 87 257 96
                 Q 285 102 298 120
                 C 311 138 300 153 284 150
                 Q 244 159 212 157
                 Q 188 156 176 149 Z"
              fill="#091828" stroke="#162636" strokeWidth="1.5"
            />
            {/* Top highlight */}
            <path d="M 192 110 Q 234 100 274 112"
              stroke="#1A3048" strokeWidth="1.5" fill="none" opacity="0.6" />
            {/* Orange racing stripe — matches logo style */}
            <path d="M 190 136 Q 243 128 290 138 L 288 145 Q 241 135 188 144 Z"
              fill="#F97316" opacity="0.92" />
            {/* Knee recesses */}
            <path d="M 178 149 Q 183 139 192 138 Q 187 148 180 151 Z"
              fill="#07121E" />
            <path d="M 283 149 Q 289 140 295 142 Q 292 149 285 151 Z"
              fill="#07121E" />
            {/* Tank filler cap */}
            <ellipse cx="235" cy="97"  rx="17" ry="5.5"
              fill="#0C1C2E" stroke="#1E3248" strokeWidth="1.5" />
            <ellipse cx="235" cy="97"  rx="10"  ry="3"
              fill="#243C58" />
            <circle  cx="235" cy="96"  r="3.5"
              fill="#3A5878" />
          </Part>

          {/* 9 · Seat */}
          <Part p={p} start={0.54} end={0.66} dy="-24px">
            {/* Seat pan + cushion */}
            <path
              d="M 116 163
                 Q 127 148 151 144
                 Q 159 143 163 149
                 L 163 157
                 Q 154 159 144 162
                 L 140 173
                 Q 128 171 118 169 Z"
              fill="#0E1C2E" stroke="#1A2C3E" strokeWidth="1.5"
            />
            {/* Upholstery top surface */}
            <path d="M 120 161 Q 140 153 162 156 L 162 159 Q 140 156 120 164 Z"
              fill="#162436" />
            {/* Stitching line */}
            <path d="M 127 161 Q 148 153 162 156"
              stroke="#1A3050" strokeWidth="1" strokeDasharray="3 2.5" fill="none" />
            {/* Seat back bolster */}
            <path d="M 117 164 Q 118 155 124 152 L 127 163 Q 120 166 117 164 Z"
              fill="#0C1828" stroke="#182A3C" strokeWidth="1" />
          </Part>

          {/* 10 · Front fork — two chrome legs */}
          <Part p={p} start={0.62} end={0.74} dy="-24px" dx="22px">
            {/* Left (inner) fork leg */}
            <path d="M 316 155 Q 330 193 350 233"
              stroke="#050D19" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M 316 155 Q 330 193 350 233"
              stroke="#0E1C2E" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M 316 155 Q 330 193 350 233"
              stroke="#1E3454" strokeWidth="5"  strokeLinecap="round" fill="none" />
            <path d="M 317 157 Q 331 195 351 235"
              stroke="#3A5A7E" strokeWidth="2"  strokeLinecap="round" fill="none" />

            {/* Right (outer) fork leg */}
            <path d="M 330 155 Q 344 193 364 233"
              stroke="#050D19" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M 330 155 Q 344 193 364 233"
              stroke="#0E1C2E" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M 330 155 Q 344 193 364 233"
              stroke="#1E3454" strokeWidth="4"  strokeLinecap="round" fill="none" />
            <path d="M 331 157 Q 345 195 365 235"
              stroke="#3A5A7E" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Upper fork yoke / crown */}
            <rect x="312" y="148" width="32" height="12" rx="5"
              fill="#0C1828" stroke="#1A2C40" strokeWidth="1.5" />
            <rect x="315" y="150" width="26" height="8"  rx="4"
              fill="#162436" stroke="#243C54" strokeWidth="1" />

            {/* Fork slider / lower tubes (chrome) */}
            <rect x="344" y="200" width="26" height="36" rx="7"
              fill="#0A1828" stroke="#1E3454" strokeWidth="1.5" />
            <rect x="347" y="203" width="20" height="30" rx="5"
              fill="#142438" />
            {/* Chrome reflection strip */}
            <path d="M 349 206 L 349 230" stroke="#3A6090" strokeWidth="1.5"
              strokeLinecap="round" opacity="0.55" />
            <path d="M 354 205 L 354 232" stroke="#2A4A70" strokeWidth="1"
              strokeLinecap="round" opacity="0.4" />

            {/* Lower fork brace */}
            <rect x="316" y="192" width="44" height="8" rx="3"
              fill="#0A1828" stroke="#162A3E" strokeWidth="1" />
          </Part>

          {/* 11 · Handlebars — swept-back cruiser style */}
          <Part p={p} start={0.70} end={0.81} dy="-28px">
            {/* Stem */}
            <rect x="319" y="108" width="14" height="28" rx="5"
              fill="#0C1828" stroke="#1A2C3E" strokeWidth="1.5" />

            {/* Handlebar tube */}
            <path d="M 290 113 Q 306 104 326 107 Q 346 104 362 113"
              stroke="#07101E" strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M 290 113 Q 306 104 326 107 Q 346 104 362 113"
              stroke="#162436" strokeWidth="7"  strokeLinecap="round" fill="none" />
            <path d="M 290 113 Q 306 104 326 107 Q 346 104 362 113"
              stroke="#2E4C6A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 291 113 Q 307 105 326 108 Q 345 105 361 113"
              stroke="#4A6E90" strokeWidth="1"   strokeLinecap="round" fill="none" />

            {/* Left grip */}
            <rect x="276" y="105" width="17" height="13" rx="5.5"
              fill="#0A1828" stroke="#182C40" strokeWidth="1.5" />
            <rect x="279" y="108" width="11" height="7" rx="3"
              fill="#1A2E46" />
            {/* Right grip */}
            <rect x="358" y="107" width="17" height="13" rx="5.5"
              fill="#0A1828" stroke="#182C40" strokeWidth="1.5" />
            <rect x="361" y="110" width="11" height="7" rx="3"
              fill="#1A2E46" />

            {/* Brake lever */}
            <path d="M 362 113 Q 371 120 369 126"
              stroke="#1A2C3E" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Instrument cluster (speedometer) */}
            <circle cx="326" cy="100" r="10"
              fill="#09182A" stroke="#182C40" strokeWidth="1.5" />
            <circle cx="326" cy="100" r="6.5"
              fill="#040C18" stroke="#243C54" strokeWidth="1" />
            <circle cx="326" cy="100" r="3"
              fill="#F97316" opacity="0.75" />

            {/* Mirror arm + glass */}
            <line x1="284" y1="107" x2="267" y2="90"
              stroke="#1A2C3E" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="255" y="82" width="24" height="14" rx="5"
              fill="#0C1828" stroke="#1A2C3E" strokeWidth="1.5" />
            <rect x="258" y="85" width="18" height="8"  rx="3"
              fill="#152436" stroke="#2A3E58" strokeWidth="0.8" />
          </Part>

          {/* 12 · Headlight — round chrome bucket */}
          <Part p={p} start={0.78} end={0.89} scale0={0.2} dy="-8px">
            {/* Outer chrome housing */}
            <circle cx="376" cy="164" r="30"
              fill="#09182A" stroke="#1A2E44" strokeWidth="2" />
            {/* Chrome bezel rings */}
            <circle cx="376" cy="164" r="28"
              fill="none" stroke="#3A5A7E" strokeWidth="2.5" />
            <circle cx="376" cy="164" r="25"
              fill="none" stroke="#1A2E44" strokeWidth="1" />
            {/* Reflector housing */}
            <circle cx="376" cy="164" r="23"
              fill="#05101A" />
            {/* Bulb / light element */}
            <circle cx="376" cy="164" r="17"
              fill="#F97316" opacity="0.95" />
            <circle cx="376" cy="164" r="10"
              fill="#FDE68A" />
            <circle cx="376" cy="164" r="5"
              fill="#FFFDE0" />
            {/* Glow halo */}
            <circle cx="376" cy="164" r="28"
              fill="#F97316" opacity="0.12" />
            {/* Chrome highlight arc */}
            <path d="M 350 149 A 26 26 0 0 1 394 153"
              stroke="#6A9EC0" strokeWidth="2" fill="none" opacity="0.5" />
            {/* Light beams */}
            <path d="M 403 153 L 458 137 M 404 164 L 458 164 M 403 175 L 458 191"
              stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          </Part>

          {/* 13 · Tail light + speed/motion lines (matching logo) */}
          <Part p={p} start={0.84} end={0.93} dx="-18px">
            {/* Tail light housing */}
            <rect x="66" y="167" width="28" height="14" rx="6"
              fill="#0C1828" stroke="#1A2C3E" strokeWidth="1.5" />
            <rect x="70" y="170" width="20" height="8" rx="3.5"
              fill="#F97316" opacity="0.88" />
            <rect x="70" y="170" width="9"  height="8" rx="3.5"
              fill="#FF4444" opacity="0.45" />

            {/* Motion speed lines — like in the store logo */}
            <path d="M 64 190 L 30 190" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.72" />
            <path d="M 60 199 L 22 199" stroke="#F97316" strokeWidth="2"   strokeLinecap="round" opacity="0.58" />
            <path d="M 64 208 L 34 208" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.42" />
            <path d="M 66 182 L 44 182" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.32" />
          </Part>

          {/* 14 · Completion — engine glow */}
          <motion.g style={{ opacity: glowOpacity }}>
            <motion.circle
              cx="228" cy="198" r="52"
              fill="#F97316"
              animate={{ opacity: [0.04, 0.14, 0.04], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <ellipse cx="234" cy="281" rx="194" ry="9" fill="#F97316" opacity="0.08" />
          </motion.g>

        </svg>
      </div>

      {/* Live assembly label */}
      <div className="moto-rail-part-label">
        <div className={`moto-rail-live-label${isComplete ? ' is-complete' : ''}`} aria-live="polite">
          {labelText}
        </div>
        <div className="moto-rail-part-count">SCROLL TO BUILD</div>
      </div>

      {/* Progress bar */}
      <div className="moto-rail-progress-wrap" aria-hidden="true">
        <motion.div className="moto-rail-progress-fill" style={{ width: progressWidth }} />
      </div>

    </div>
  )
}
