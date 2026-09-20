import { MEAL_MOMENTS, type MealMoment } from '../../convex/lib/plan'

export type { MealMoment }
export { MEAL_MOMENTS }

/**
 * Colour per eating moment. Warm greens for the two cooked meals, ambers and
 * ochres for the snacks, muted neutrals for the water and optional supper —
 * per the warm, non-clinical palette in CLAUDE.md.
 */
export const MOMENT_COLORS: Record<MealMoment, { dot: string; bg: string }> = {
  acordar:       { dot: 'bg-[#A8B5A0]', bg: 'bg-[#F0F3EC]' },
  pequenoAlmoco: { dot: 'bg-[#7B5EA7]', bg: 'bg-[#EEE0FF]' },
  meioDaManha:   { dot: 'bg-[#E8B45C]', bg: 'bg-[#FDF3E0]' },
  almoco:        { dot: 'bg-[#2D9B5C]', bg: 'bg-[#E8F5EE]' },
  lanche1:       { dot: 'bg-[#E89B6C]', bg: 'bg-[#FFF3E8]' },
  lanche2:       { dot: 'bg-[#B5739B]', bg: 'bg-[#FBEAF4]' },
  jantar:        { dot: 'bg-[#3D8B7A]', bg: 'bg-[#E6F2EF]' },
  ceia:          { dot: 'bg-[#7A6775]', bg: 'bg-[#F5EDE0]' },
}

/** Moments that carry a cooked dish — the ones worth a recipe and a photo. */
export const COOKED_MOMENTS: MealMoment[] = ['almoco', 'jantar']
