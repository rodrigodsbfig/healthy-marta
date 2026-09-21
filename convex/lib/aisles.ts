/**
 * Supermarket aisle for a food, in the order the shop is walked.
 *
 * One definition, used by both the shopping list and the Despensa. They used
 * to carry a copy each, and the copies had drifted: "pudim proteico",
 * "bebida vegetal 0%" and "feijão verde" landed in different aisles depending
 * on which screen asked, so the same food appeared under two headings.
 *
 * Portuguese first — the whole recipe library is Portuguese — with English
 * terms kept so hand-typed items still land somewhere sensible.
 */

export const AISLES = [
  'Peixe', 'Carne', 'Frescos', 'Frutas e Legumes', 'Padaria', 'Mercearia', 'Outros',
] as const

export type Aisle = typeof AISLES[number]

const RULES: Array<[RegExp, Aisle]> = [
  [/salm[ãa]o|pescada|dourada|atum|bacalhau|peixe|marisco|camar[ãa]o|fish|salmon|tuna/, 'Peixe'],
  [/frango|peru|vaca|bife|porco|carne|presunto|fiambre|chicken|beef|turkey|pork/, 'Carne'],
  [/ovo|clara|queijo|iogurte|babybel|vaca que ri|philadelphia|requeij[ãa]o|manteiga|leite|natas|pudim proteico|egg|cheese|yogurt/, 'Frescos'],
  [/legume|salada|br[óo]colo|couve|cenoura|tomate|alface|pepino|courgette|curgete|pimento|ab[óo]bora|espinafre|cebola|alho|feij[ãa]o|fruta|banana|ma[çc][ãa]|laranja|lim[ãa]o|morango|frutos vermelhos|abacate|vegetable|fruit/, 'Frutas e Legumes'],
  [/p[ãa]o|tosta|marinheira|tortilha|tortita|bread|toast/, 'Padaria'],
  [/arroz|massa|quinoa|bulgur|amaranto|trigo|aveia|granola|cereai|tapioca|polvilho|batata|inhame|lentilha|gr[ãa]o|tremo[çc]o|rice|pasta|oat/, 'Mercearia'],
  [/azeite|[óo]leo|vinagre|molho|sal|pimenta|especiaria|canela|or[ée]g[ãa]os|salsa|tomilho|alecrim|louro|gengibre|soja|chocolate|frutos secos|semente|noz|amendoim|caf[ée]|ch[áa]|bebida vegetal|sopa|gelado|oil|sauce|spice/, 'Mercearia'],
]

export function categorise(name: string): Aisle {
  const n = name.toLowerCase()
  for (const [pattern, aisle] of RULES) {
    if (pattern.test(n)) return aisle
  }
  return 'Outros'
}
