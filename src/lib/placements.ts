import { type Skill, type SkillTag } from '../data'

// ── Star-map placement ───────────────────────────────────────────────────────
// Pure geometry behind Skills.tsx, kept out of the component: orbit radii and
// the deterministic placement pass. Placement is collision-aware but
// orbit-true: a node's radius is ALWAYS its ring, only the angle moves. After
// the sector-spread initial pass, overlapping label boxes are separated by
// rotating nodes along their own orbit, capped at ±22° from their initial
// slot so groups stay grouped. Phones pass one tier at a time so tiers don't
// false-collide. Pure: same roster + measured box → same sky, every render.

/** Orbit radii as % of the map box: advanced inner, basic outer. */
export const RING_PCT = [22, 36, 48] as const
/** Phones draw one circle per box, all at the same radius. */
export const STACKED_RING_PCT = [37, 37, 37] as const

/** Slack around the measured node box. */
const BOX_PAD_PX = 8

/** Max angular escape from the initial slot during relaxation. */
const ANGLE_CAP_DEG = 22

export type Placement = {
  skill: Skill
  ring: 0 | 1 | 2 // tier 3 → 0 (inner), tier 1 → 2 (outer)
  angle: number // degrees, 0 = 12 o'clock, clockwise (post-relaxation)
}

type MutableNode = Placement & { initialAngle: number }

/** The node's real extents, measured off the rendered markup (useMapMetrics
    in Skills.tsx) so the collision box can't drift from it. Offsets are
    relative to the node's centre: top ≤ 0 (disc/wrapper), bottom ≥ 0 (label). */
export type NodeBox = { top: number; bottom: number; halfW: number }

/** Tier → ring: advanced (tier 3) inner … basic (tier 1) outer. */
export const ringOf = (skill: Skill) => (3 - skill.tier) as 0 | 1 | 2

const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))

/** Turn a desired correction into a step along the node's own orbit:
    project onto the tangent at its CURRENT angle (dθ = want · t / r). The
    0.35 floor keeps radially-aligned pairs (want ⊥ tangent) parting too,
    instead of stalling at projection ≈ 0. */
function orbitStep(n: MutableNode, r: number, wx: number, wy: number) {
  const th = ((n.angle - 90) * Math.PI) / 180
  const proj = (wx * -Math.sin(th) + wy * Math.cos(th)) / r
  const mag = Math.hypot(wx, wy) / r
  const use = Math.abs(proj) < mag * 0.35 ? Math.sign(proj || 1) * mag * 0.35 : proj
  n.angle = clamp(
    n.initialAngle - ANGLE_CAP_DEG,
    n.initialAngle + ANGLE_CAP_DEG,
    n.angle + (use * 180) / Math.PI
  )
}

/** Initial polar placement, then deterministic collision relaxation.
    Angle-only: every node stays exactly on its ring's circle. `wide` initial
    angles group by tag sector; phones get even per-ring spacing (half-sector
    offset per ring, so rings interleave instead of stacking radially). */
export function computePlacements(
  roster: readonly Skill[],
  tagList: readonly SkillTag[],
  boxPx: number,
  nodeBox: NodeBox | null,
  mode: 'wide' | 'stacked'
): Placement[] {
  const ringPct = mode === 'wide' ? RING_PCT : STACKED_RING_PCT
  const sector = 360 / tagList.length

  // Per-ring totals for the even-spacing (stacked) initial pass.
  const totals = new Map<number, number>()
  for (const s of roster) {
    const r = ringOf(s)
    totals.set(r, (totals.get(r) ?? 0) + 1)
  }
  const seen = new Map<number, number>()

  const nodes: MutableNode[] = roster.map((skill) => {
    const ring = ringOf(skill)

    let angle: number
    if (mode === 'wide') {
      const tagIndex = tagList.indexOf(skill.tag)
      const peers = roster.filter((s) => s.tag === skill.tag && s.tier === skill.tier)
      const within = peers.findIndex((s) => s.name === skill.name)
      // (within + 0.5) / peers: pairs sit at quarter points (not thirds), which
      // doubles the angular gap between two skills sharing a sector slot.
      const spread = (within + 0.5) / peers.length
      angle = tagIndex * sector + spread * sector
    } else {
      const n = totals.get(ring) ?? 1
      const idx = seen.get(ring) ?? 0
      seen.set(ring, idx + 1)
      angle = (idx * 360) / n + (ring * 180) / n
    }

    return { skill, ring, angle, initialAngle: angle }
  })

  // Nothing to relax against until the map and the nodes are measured.
  if (boxPx <= 0 || !nodeBox) return nodes

  // Collision box straight off the DOM — wrapper/disc top to label bottom,
  // centred slightly below the node's centre.
  const halfW = nodeBox.halfW + BOX_PAD_PX / 2
  const offsetY = (nodeBox.top + nodeBox.bottom) / 2
  const halfH = (nodeBox.bottom - nodeBox.top) / 2 + BOX_PAD_PX / 2

  const toPos = (n: MutableNode) => {
    const r = (ringPct[n.ring] / 100) * boxPx
    const rad = ((n.angle - 90) * Math.PI) / 180
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) + offsetY, r }
  }

  for (let pass = 0; pass < 80; pass++) {
    let collided = false

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const pa = toPos(a)
        const pb = toPos(b)

        const dx = pb.x - pa.x
        const dy = pb.y - pa.y
        const ox = halfW * 2 - Math.abs(dx)
        const oy = halfH * 2 - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue

        collided = true

        // Desired correction along the axis of least overlap: push a one way,
        // b the other.
        const useX = ox < oy
        const axis = useX ? dx : dy
        const push = (useX ? ox : oy) / 2
        const s = axis === 0 ? 1 : Math.sign(axis)
        const wx = useX ? -s * push : 0
        const wy = useX ? 0 : -s * push

        orbitStep(a, pa.r, wx, wy)
        orbitStep(b, pb.r, -wx, -wy)
      }
    }

    if (!collided) break
  }

  return nodes
}
