/**
 * The starter recipe library, written against Marta's nutrition plan.
 *
 * A recipe does not hardcode quantities. It declares which plan option each
 * ingredient satisfies (`optionId`) and which concrete food she actually buys
 * (`as`) — "110g salmão" is the plan's `peixe` slot filled with salmon. The
 * quantities are then resolved from convex/lib/plan.ts for whichever moment
 * the recipe is served at, so one dish works at both almoço (90g arroz) and
 * jantar (60g arroz) without ever stating a wrong portion.
 *
 * `as` is also what lands on the shopping list, so the list names real
 * supermarket items rather than plan categories.
 */

import {
  equivalentOption, amountFor, getMoment, OPTIONS_BY_ID,
  type MealMoment, type ComponentKind,
} from './plan'
import { macrosFor, addMacros, roundMacros, ZERO, type Macros } from './foodMacros'

export interface SeedComponent {
  /** Plan option this fills. Cooked meals use the almoço ids as canonical. */
  optionId: string
  /** The concrete food, e.g. 'salmão' for the plan's generic 'peixe'. */
  as?: string
  /** Key into the macro tables. Defaults to `as`, then the option label. */
  macroKey?: string
  /** Set for unit-counted foods so macros use the per-unit table. */
  units?: number
}

export interface SeedRecipe {
  title: string
  description: string
  /** Every moment this dish may be served at. */
  moments: MealMoment[]
  prepTime: number
  cookTime: number
  components: SeedComponent[]
  /** Whether the soup starter is included — changes the fibre portion. */
  comSopa?: boolean
  /** Seasonings and aromatics outside the plan's portion control. */
  extras?: Array<{ name: string; quantity: number; unit: string }>
  steps: string[]
  tags: string[]
}

export interface BuiltRecipe {
  ingredients: Array<{ name: string; quantity: number; unit: string; optionId?: string }>
  nutrition: Macros
}

/**
 * Resolve a seed recipe's ingredients and nutrition for a given moment.
 * Unknown option ids are skipped rather than thrown on, so a plan revision
 * that drops a food degrades to a shorter ingredient list instead of a crash.
 */
export function buildRecipe(seed: SeedRecipe, moment: MealMoment): BuiltRecipe {
  const comSopa = seed.comSopa ?? false
  const ingredients: BuiltRecipe['ingredients'] = []
  let nutrition = ZERO

  if (comSopa && getMoment(moment).slots.some((s) => s.kind === 'sopa')) {
    ingredients.push({ name: 'sopa sem batata', quantity: 200, unit: 'ml', optionId: 'sopa' })
    nutrition = addMacros(nutrition, macrosFor('sopa', { grams: 200 }))
  }

  for (const c of seed.components) {
    const option = equivalentOption(c.optionId, moment)
    if (!option) continue
    const name = c.as ?? option.label
    const key = c.macroKey ?? c.as ?? option.label
    const amt = amountFor(option, { comSopa })

    if (c.units !== undefined) {
      ingredients.push({ name, quantity: c.units, unit: 'unidades', optionId: c.optionId })
      nutrition = addMacros(nutrition, macrosFor(key, { units: c.units }))
    } else if (amt.grams !== undefined) {
      ingredients.push({ name, quantity: amt.grams, unit: 'g', optionId: c.optionId })
      nutrition = addMacros(nutrition, macrosFor(key, { grams: amt.grams }))
    } else if (amt.ml !== undefined) {
      ingredients.push({ name, quantity: amt.ml, unit: 'ml', optionId: c.optionId })
      nutrition = addMacros(nutrition, macrosFor(key, { grams: amt.ml }))
    } else {
      // Unit-counted option, e.g. "1 babybel light". The plan's phrase already
      // contains the count, so using it as the ingredient name would render as
      // "1 café sem açúcar × 4" once a week's worth is added up. Keep the food
      // name and let the quantity carry the count.
      ingredients.push({ name, quantity: 1, unit: 'unidade', optionId: c.optionId })
      nutrition = addMacros(nutrition, macrosFor(key, { units: 1 }))
    }
  }

  for (const e of seed.extras ?? []) {
    ingredients.push(e)
    if (e.unit === 'g') nutrition = addMacros(nutrition, macrosFor(e.name, { grams: e.quantity }))
  }

  return { ingredients, nutrition: roundMacros(nutrition) }
}

/**
 * The plan components a recipe satisfies, for compliance checking.
 *
 * The kind comes from OPTIONS_BY_ID rather than from equivalentOption, which
 * returns a bare PlanOption carrying no kind of its own.
 */
export function planComponentsOf(seed: SeedRecipe): Array<{ kind: string; optionId: string }> {
  const out: Array<{ kind: ComponentKind; optionId: string }> = []
  for (const c of seed.components) {
    const canonical = OPTIONS_BY_ID[c.optionId]
    if (canonical) out.push({ kind: canonical.kind, optionId: c.optionId })
  }
  return out
}

const COOKED: MealMoment[] = ['almoco', 'jantar']

// ---------------------------------------------------------------------------
// Pequeno Almoço — the nutritionist's own example combinations first
// ---------------------------------------------------------------------------

const PEQUENO_ALMOCO: SeedRecipe[] = [
  {
    title: 'Panquecas de aveia e banana',
    description: 'A combinação sugerida pela nutricionista. Rende 3 panquecas pequenas.',
    moments: ['pequenoAlmoco'], prepTime: 5, cookTime: 8,
    components: [
      { optionId: 'pa-aveia', as: 'flocos de aveia', macroKey: 'aveia' },
      { optionId: 'pa-ovo-claras', as: 'ovo + claras', macroKey: 'ovo', units: 1 },
      { optionId: 'pa-fruta', as: 'banana', macroKey: 'fruta' },
      { optionId: 'pa-frutos-secos', as: 'manteiga de amendoim', macroKey: 'frutos secos' },
      { optionId: 'pa-cafe', as: 'café sem açúcar' },
    ],
    extras: [{ name: 'canela', quantity: 1, unit: 'pitada' }],
    steps: [
      'Esmaga a banana num prato fundo até ficar em puré.',
      'Junta o ovo, as claras e os flocos de aveia e mistura bem. Adiciona a canela.',
      'Aquece uma frigideira antiaderente em lume médio, sem gordura.',
      'Deita porções pequenas da massa e cozinha 2 minutos de cada lado, até dourar.',
      'Serve com a manteiga de amendoim por cima e o café.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Papas de aveia com banana',
    description: 'Podem ser feitas quentes ou deixadas a dormir no frigorífico.',
    moments: ['pequenoAlmoco'], prepTime: 3, cookTime: 5,
    components: [
      { optionId: 'pa-aveia', as: 'flocos de aveia', macroKey: 'aveia' },
      { optionId: 'pa-bebida-vegetal', as: 'bebida vegetal 0%', macroKey: 'bebida vegetal' },
      { optionId: 'pa-fruta', as: 'banana', macroKey: 'fruta' },
      { optionId: 'pa-sementes', as: 'sementes de chia', macroKey: 'sementes' },
      { optionId: 'pa-cha', as: 'chá sem açúcar' },
    ],
    extras: [{ name: 'canela', quantity: 1, unit: 'pitada' }],
    steps: [
      'Leva a bebida vegetal ao lume com os flocos de aveia.',
      'Mexe em lume brando 4 a 5 minutos, até engrossar.',
      'Retira do lume, junta as sementes e a canela.',
      'Serve com a banana às rodelas por cima.',
      'Em alternativa: mistura tudo à noite e deixa no frigorífico até de manhã.',
    ],
    tags: ['Vegetarian'],
  },
  {
    title: 'Tosta de abacate e ovo escalfado',
    description: 'A sugestão da nutricionista — saciante e rápida.',
    moments: ['pequenoAlmoco'], prepTime: 5, cookTime: 5,
    components: [
      { optionId: 'pa-pao', as: 'pão escuro', macroKey: 'pão' },
      { optionId: 'pa-ovo-claras', as: 'ovo + claras', macroKey: 'ovo', units: 1 },
      { optionId: 'pa-abacate', as: 'abacate' },
      { optionId: 'pa-cafe', as: 'café sem açúcar' },
    ],
    extras: [
      { name: 'sumo de limão', quantity: 1, unit: 'colher de chá' },
      { name: 'sal e pimenta', quantity: 1, unit: 'q.b.' },
    ],
    steps: [
      'Torra o pão.',
      'Esmaga o abacate com o sumo de limão, sal e pimenta.',
      'Leva uma panela com água a ferver, baixa o lume e junta um fio de vinagre.',
      'Parte o ovo numa taça, deita na água em rodopio e escalfa 3 minutos.',
      'Barra o abacate na tosta e coloca o ovo escalfado por cima.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Crepioca',
    description: 'A opção da nutricionista — pode ser doce ou salgada.',
    moments: ['pequenoAlmoco'], prepTime: 3, cookTime: 6,
    components: [
      { optionId: 'pa-tapioca', as: 'polvilho doce / tapioca', macroKey: 'tapioca' },
      { optionId: 'pa-ovo-claras', as: 'ovo + claras', macroKey: 'ovo', units: 1 },
      { optionId: 'pa-queijo-fresco', as: 'queijo fresco magro', macroKey: 'queijo fresco' },
      { optionId: 'pa-cha', as: 'chá sem açúcar' },
    ],
    steps: [
      'Bate o ovo e as claras numa taça com uma pitada de sal.',
      'Junta o polvilho e mistura até ficar homogéneo.',
      'Deita numa frigideira antiaderente quente e espalha como um crepe.',
      'Ao fim de 2 minutos vira, recheia com o queijo fresco e dobra ao meio.',
    ],
    tags: ['Gluten-Free', 'High Protein'],
  },
  {
    title: 'Iogurte proteico com granola e frutos vermelhos',
    description: 'Sem cozinhar — para as manhãs com pressa.',
    moments: ['pequenoAlmoco'], prepTime: 3, cookTime: 0,
    components: [
      { optionId: 'pa-granola', as: 'granola 0% açúcar', macroKey: 'granola' },
      { optionId: 'pa-iogurte-proteico', as: 'iogurte proteico', units: 1 },
      { optionId: 'pa-frutos-secos', as: 'nozes', macroKey: 'frutos secos' },
      { optionId: 'pa-fruta', as: 'frutos vermelhos', macroKey: 'fruta' },
      { optionId: 'pa-cafe', as: 'café sem açúcar' },
    ],
    steps: [
      'Deita o iogurte numa taça.',
      'Junta a granola, as nozes partidas e os frutos vermelhos por cima.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Pão com queijo fresco e abacate',
    description: 'Clássico, pronto em cinco minutos.',
    moments: ['pequenoAlmoco'], prepTime: 5, cookTime: 0,
    components: [
      { optionId: 'pa-pao', as: 'pão escuro', macroKey: 'pão' },
      { optionId: 'pa-queijo-fresco', as: 'queijo fresco magro', macroKey: 'queijo fresco' },
      { optionId: 'pa-abacate', as: 'abacate' },
      { optionId: 'pa-cha', as: 'chá sem açúcar' },
    ],
    extras: [{ name: 'orégãos', quantity: 1, unit: 'pitada' }],
    steps: [
      'Torra o pão.',
      'Barra com o queijo fresco e dispõe o abacate às fatias.',
      'Tempera com orégãos e um fio de limão.',
    ],
    tags: ['Vegetarian'],
  },
]

// ---------------------------------------------------------------------------
// Meio da Manhã
// ---------------------------------------------------------------------------

const MEIO_DA_MANHA: SeedRecipe[] = [
  {
    title: 'Fruta com iogurte magro',
    description: 'O meio da manhã mais simples do plano.',
    moments: ['meioDaManha'], prepTime: 2, cookTime: 0,
    components: [
      { optionId: 'mm-fruta', as: 'fruta da época', macroKey: 'fruta' },
      { optionId: 'mm-iogurte-magro', as: 'iogurte magro 0%', macroKey: 'iogurte magro', units: 1 },
    ],
    steps: ['Corta a fruta e come com o iogurte.'],
    tags: [],
  },
  {
    title: 'Batido de fruta com bebida vegetal',
    description: 'Leva-se num frasco para o trabalho.',
    moments: ['meioDaManha'], prepTime: 4, cookTime: 0,
    components: [
      { optionId: 'mm-fruta', as: 'fruta da época', macroKey: 'fruta' },
      { optionId: 'mm-bebida-vegetal', as: 'bebida vegetal 0%', macroKey: 'bebida vegetal' },
    ],
    extras: [{ name: 'canela', quantity: 1, unit: 'pitada' }],
    steps: [
      'Junta a fruta e a bebida vegetal no copo da varinha.',
      'Tritura até ficar liso e leva num frasco fechado.',
    ],
    tags: ['Vegan'],
  },
  {
    title: 'Palitos de legumes com babybel',
    description: 'Para os dias em que já comeu fruta ao pequeno-almoço.',
    moments: ['meioDaManha'], prepTime: 5, cookTime: 0,
    components: [
      { optionId: 'mm-legumes', as: 'cenoura e pepino', macroKey: 'legumes' },
      { optionId: 'mm-babybel', as: 'babybel light', macroKey: 'babybel light', units: 1 },
    ],
    steps: ['Corta os legumes em palitos e leva num recipiente com o queijo.'],
    tags: ['Low Carb'],
  },
]

// ---------------------------------------------------------------------------
// Almoço & Jantar — portions resolve per moment (90g vs 60g de hidratos)
// ---------------------------------------------------------------------------

const REFEICOES: SeedRecipe[] = [
  {
    title: 'Salmão grelhado com arroz basmati e brócolos',
    description: 'Grelhado, como recomenda o plano. Ótimo para levar em marmita.',
    moments: COOKED, prepTime: 10, cookTime: 20, comSopa: true,
    components: [
      { optionId: 'peixe', as: 'salmão' },
      { optionId: 'al-arroz', as: 'arroz basmati' },
      { optionId: 'legumes-cozidos', as: 'brócolos' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'limão', quantity: 0.5, unit: 'unidade' },
      { name: 'alho', quantity: 1, unit: 'dente' },
      { name: 'sal e pimenta', quantity: 1, unit: 'q.b.' },
    ],
    steps: [
      'Coze o arroz basmati em água temperada com sal, cerca de 12 minutos. Pesa depois de cozido.',
      'Entretanto coze os brócolos a vapor 6 a 8 minutos — devem ficar firmes.',
      'Tempera o salmão com sal, pimenta, alho picado e sumo de limão.',
      'Grelha o salmão 4 minutos de cada lado numa grelha bem quente.',
      'Serve com o azeite cru por cima dos legumes.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Frango grelhado com quinoa e salada',
    description: 'A refeição de base — simples e fácil de repetir na semana.',
    moments: COOKED, prepTime: 10, cookTime: 20, comSopa: true,
    components: [
      { optionId: 'carnes-brancas', as: 'peito de frango', macroKey: 'frango' },
      { optionId: 'al-quinoa', as: 'quinoa' },
      { optionId: 'saladas', as: 'salada mista', macroKey: 'salada' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'vinagre balsâmico', quantity: 1, unit: 'colher de chá' },
      { name: 'paprica', quantity: 1, unit: 'pitada' },
      { name: 'sal e pimenta', quantity: 1, unit: 'q.b.' },
    ],
    steps: [
      'Coze a quinoa em água a ferver 15 minutos e escorre bem. Pesa depois de cozida.',
      'Tempera o frango com sal, pimenta e paprica.',
      'Grelha o frango 5 a 6 minutos de cada lado, até não ficar rosado no centro.',
      'Tempera a salada com o azeite e o vinagre.',
      'Deixa o frango repousar 2 minutos antes de cortar.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Atum com batata doce e legumes salteados',
    description: 'Feito com atum em conserva — sem cozinhar proteína.',
    moments: COOKED, prepTime: 8, cookTime: 25, comSopa: false,
    components: [
      { optionId: 'atum', as: 'atum em água', macroKey: 'atum' },
      { optionId: 'al-batata', as: 'batata doce' },
      { optionId: 'legumes-salteados', as: 'courgette e pimento', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'alho', quantity: 1, unit: 'dente' },
      { name: 'salsa', quantity: 1, unit: 'q.b.' },
    ],
    steps: [
      'Coze a batata doce com casca 20 minutos, ou assa no forno a 200°C.',
      'Salteia a courgette e o pimento com o alho no azeite, 5 minutos em lume forte.',
      'Escorre bem o atum e junta aos legumes fora do lume.',
      'Serve com a batata doce e salsa picada.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Tofu salteado com bulgur e legumes',
    description: 'Opção vegetariana do plano.',
    moments: COOKED, prepTime: 10, cookTime: 20, comSopa: true,
    components: [
      { optionId: 'tofu', as: 'tofu firme', macroKey: 'tofu' },
      { optionId: 'al-bulgur', as: 'bulgur' },
      { optionId: 'legumes-salteados', as: 'legumes salteados', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'molho de soja', quantity: 1, unit: 'colher de chá' },
      { name: 'gengibre', quantity: 1, unit: 'pitada' },
    ],
    steps: [
      'Coze o bulgur em água a ferver 10 minutos e escorre. Pesa depois de cozido.',
      'Escorre bem o tofu, seca com papel e corta em cubos.',
      'Salteia o tofu no azeite até dourar de todos os lados, cerca de 8 minutos.',
      'Junta os legumes e o gengibre e salteia mais 4 minutos.',
      'Tempera com o molho de soja fora do lume.',
    ],
    tags: ['Vegetarian'],
  },
  {
    title: 'Bife de vaca com massa e legumes refogados',
    description: 'Carne vermelha — o plano permite 1 a 2 vezes por semana.',
    moments: COOKED, prepTime: 8, cookTime: 18, comSopa: true,
    components: [
      { optionId: 'vaca', as: 'bife de vaca', macroKey: 'vaca' },
      { optionId: 'al-massa', as: 'massa integral', macroKey: 'massa' },
      { optionId: 'legumes-refogados', as: 'legumes refogados', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'alho', quantity: 1, unit: 'dente' },
      { name: 'louro', quantity: 1, unit: 'folha' },
    ],
    steps: [
      'Coze a massa em água temperada com sal. Pesa depois de cozida.',
      'Refoga os legumes com o alho e o louro no azeite, em lume brando, 10 minutos.',
      'Aquece bem uma frigideira e sela o bife 2 a 3 minutos de cada lado.',
      'Deixa o bife repousar antes de servir.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Pescada cozida com batata e legumes',
    description: 'Cozido em água, o método que a nutricionista recomenda.',
    moments: COOKED, prepTime: 5, cookTime: 20, comSopa: true,
    components: [
      { optionId: 'peixe', as: 'pescada', macroKey: 'pescada' },
      { optionId: 'al-batata', as: 'batata', macroKey: 'batata' },
      { optionId: 'legumes-cozidos', as: 'couve e cenoura', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'alho', quantity: 1, unit: 'dente' },
      { name: 'vinagre', quantity: 1, unit: 'colher de chá' },
    ],
    steps: [
      'Leva uma panela com água e sal ao lume.',
      'Junta a batata e a cenoura e coze 10 minutos.',
      'Adiciona a pescada e a couve e coze mais 8 minutos.',
      'Escorre e tempera à mesa com o azeite, o alho picado e o vinagre.',
    ],
    tags: [],
  },
  {
    title: 'Omelete de dois ovos com arroz e salada',
    description: 'O plano permite 1 ovo por dia — esta conta como a refeição de ovos.',
    moments: COOKED, prepTime: 5, cookTime: 10, comSopa: false,
    components: [
      { optionId: 'ovos', as: 'ovos', macroKey: 'ovo', units: 2 },
      { optionId: 'al-arroz', as: 'arroz basmati' },
      { optionId: 'saladas', as: 'salada mista', macroKey: 'salada' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'cebolinho', quantity: 1, unit: 'q.b.' },
    ],
    steps: [
      'Coze o arroz e reserva. Pesa depois de cozido.',
      'Bate os ovos com sal, pimenta e cebolinho picado.',
      'Deita numa frigideira antiaderente quente com o azeite.',
      'Cozinha em lume médio até o fundo ficar firme e dobra ao meio.',
      'Serve com o arroz e a salada temperada.',
    ],
    tags: ['Vegetarian'],
  },
  {
    title: 'Peru grelhado com trigo sarraceno e legumes',
    description: 'Carne branca magra, boa para preparar em quantidade.',
    moments: COOKED, prepTime: 10, cookTime: 20, comSopa: true,
    components: [
      { optionId: 'carnes-brancas', as: 'bifes de peru', macroKey: 'peru' },
      { optionId: 'al-trigo-sarraceno', as: 'trigo sarraceno' },
      { optionId: 'legumes-salteados', as: 'feijão verde', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'limão', quantity: 0.5, unit: 'unidade' },
      { name: 'tomilho', quantity: 1, unit: 'pitada' },
    ],
    steps: [
      'Coze o trigo sarraceno 12 minutos e escorre. Pesa depois de cozido.',
      'Tempera o peru com sal, pimenta, tomilho e sumo de limão.',
      'Grelha 4 minutos de cada lado.',
      'Salteia o feijão verde no azeite 5 minutos.',
    ],
    tags: ['High Protein'],
  },
  {
    title: 'Dourada no forno com inhame e salada',
    description: 'Assado no forno, sem gordura acrescentada na confeção.',
    moments: COOKED, prepTime: 10, cookTime: 25, comSopa: false,
    components: [
      { optionId: 'peixe', as: 'dourada', macroKey: 'dourada' },
      { optionId: 'al-inhame', as: 'inhame' },
      { optionId: 'saladas', as: 'salada de tomate', macroKey: 'salada' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'limão', quantity: 0.5, unit: 'unidade' },
      { name: 'alho', quantity: 2, unit: 'dentes' },
    ],
    steps: [
      'Aquece o forno a 200°C.',
      'Coloca a dourada num tabuleiro com rodelas de limão e alho laminado.',
      'Leva ao forno 20 a 25 minutos.',
      'Coze o inhame em água com sal, cerca de 15 minutos. Pesa depois de cozido.',
      'Tempera a salada com o azeite.',
    ],
    tags: [],
  },
  {
    title: 'Frango com amaranto e legumes assados',
    description: 'Tudo no forno — pouco trabalho e fácil de duplicar.',
    moments: COOKED, prepTime: 10, cookTime: 30, comSopa: true,
    components: [
      { optionId: 'carnes-brancas', as: 'peito de frango', macroKey: 'frango' },
      { optionId: 'al-amaranto', as: 'amaranto' },
      { optionId: 'legumes-cozidos', as: 'abóbora e curgete', macroKey: 'legumes' },
    ],
    extras: [
      { name: 'azeite', quantity: 5, unit: 'g' },
      { name: 'alecrim', quantity: 1, unit: 'pitada' },
    ],
    steps: [
      'Aquece o forno a 200°C.',
      'Espalha os legumes num tabuleiro, tempera com o azeite e o alecrim.',
      'Coloca o frango por cima e leva ao forno 25 a 30 minutos.',
      'Coze o amaranto em água 20 minutos. Pesa depois de cozido.',
    ],
    tags: ['High Protein'],
  },
]

// ---------------------------------------------------------------------------
// Lanche 1
// ---------------------------------------------------------------------------

const LANCHE_1: SeedRecipe[] = [
  {
    title: 'Tostas com queijo fresco',
    description: 'O lanche mais rápido do plano.',
    moments: ['lanche1'], prepTime: 3, cookTime: 0,
    components: [
      { optionId: 'l1-tostas', as: 'tostas extrafinas', macroKey: 'tosta extrafina', units: 10 },
      { optionId: 'l1-queijo-fresco', as: 'queijo fresco magro', macroKey: 'queijo fresco' },
    ],
    extras: [{ name: 'orégãos', quantity: 1, unit: 'pitada' }],
    steps: ['Barra o queijo fresco nas tostas e polvilha com orégãos.'],
    tags: [],
  },
  {
    title: 'Pão com philadelphia e tomate',
    description: 'Leva-se feito de casa.',
    moments: ['lanche1'], prepTime: 4, cookTime: 0,
    components: [
      { optionId: 'l1-pao', as: 'pão escuro', macroKey: 'pão' },
      { optionId: 'l1-philadelphia', as: 'philadelphia light', macroKey: 'philadelphia' },
    ],
    extras: [{ name: 'tomate', quantity: 1, unit: 'unidade' }],
    steps: ['Barra o pão com o queijo e cobre com rodelas finas de tomate.'],
    tags: [],
  },
  {
    title: 'Tortilhas de milho com vaca que ri',
    description: 'Crocante e fácil de transportar.',
    moments: ['lanche1'], prepTime: 2, cookTime: 0,
    components: [
      { optionId: 'l1-tortilhas', as: 'tortilhas de milho', macroKey: 'tortilha', units: 4 },
      { optionId: 'l1-vaca-que-ri', as: 'vaca que ri light', macroKey: 'vaca que ri light', units: 1 },
    ],
    steps: ['Barra as tortilhas com o queijo.'],
    tags: [],
  },
  {
    title: 'Iogurte proteico com granola',
    description: 'Boa opção depois do treino.',
    moments: ['lanche1'], prepTime: 2, cookTime: 0,
    components: [
      { optionId: 'l1-granola', as: 'granola 0% açúcar', macroKey: 'granola' },
      { optionId: 'l1-iogurte-proteico', as: 'iogurte proteico', macroKey: 'iogurte proteico', units: 1 },
    ],
    steps: ['Mistura a granola no iogurte.'],
    tags: ['High Protein'],
  },
  {
    title: 'Marinheiras com tremoços',
    description: 'Lanche salgado, muito saciante.',
    moments: ['lanche1'], prepTime: 2, cookTime: 0,
    components: [
      { optionId: 'l1-marinheiras', as: 'marinheiras', macroKey: 'marinheira', units: 3 },
      { optionId: 'l1-tremocos', as: 'tremoços', macroKey: 'tremoços' },
    ],
    steps: ['Escorre bem os tremoços e come com as marinheiras.'],
    tags: ['Vegan'],
  },
]

// ---------------------------------------------------------------------------
// Lanche 2 (18h), Ceia, Acordar
// ---------------------------------------------------------------------------

const LANCHE_2: SeedRecipe[] = [
  {
    title: 'Frutos secos com fruta',
    description: 'O lanche das 18h do plano.',
    moments: ['lanche2'], prepTime: 1, cookTime: 0,
    components: [
      { optionId: 'l2-frutos-secos', as: 'mistura de frutos secos', macroKey: 'frutos secos' },
      { optionId: 'l2-fruta', as: 'fruta da época', macroKey: 'fruta' },
    ],
    steps: ['Pesa os frutos secos — 10g é cerca de uma mão fechada pequena.'],
    tags: ['Vegan'],
  },
  {
    title: 'Chocolate negro com fruta',
    description: 'Mínimo 70% cacau, sem açúcar, como pede o plano.',
    moments: ['lanche2'], prepTime: 1, cookTime: 0,
    components: [
      { optionId: 'l2-chocolate', as: 'chocolate 70% cacau', macroKey: 'chocolate 70%' },
      { optionId: 'l2-fruta', as: 'fruta da época', macroKey: 'fruta' },
    ],
    steps: ['Come devagar, a saborear — é o conselho da própria nutricionista.'],
    tags: [],
  },
  {
    title: 'Gelado 100% fruta com chocolate',
    description: 'Para os dias quentes.',
    moments: ['lanche2'], prepTime: 1, cookTime: 0,
    components: [
      { optionId: 'l2-quadrado', as: 'quadrado de chocolate', macroKey: 'quadrado de chocolate', units: 1 },
      { optionId: 'l2-gelado', as: 'gelado 100% fruta', macroKey: 'gelado de fruta', units: 1 },
    ],
    steps: ['Serve o gelado com o quadrado de chocolate ralado por cima.'],
    tags: [],
  },
]

const CEIA: SeedRecipe[] = [
  {
    title: 'Chá sem açúcar',
    description: 'Cavalinha, centelha asiática, erva-doce, canela ou gengibre.',
    moments: ['ceia'], prepTime: 3, cookTime: 0,
    components: [{ optionId: 'ce-cha', as: 'chá', macroKey: 'chá', units: 1 }],
    steps: ['Deixa a infusão 4 minutos e bebe sem açúcar.'],
    tags: [],
  },
  {
    title: 'Iogurte proteico',
    description: 'Só se sentir necessidade — a ceia é opcional no plano.',
    moments: ['ceia'], prepTime: 1, cookTime: 0,
    components: [{ optionId: 'ce-iogurte', as: 'iogurte proteico', macroKey: 'iogurte proteico', units: 1 }],
    steps: ['Come o iogurte.'],
    tags: ['High Protein'],
  },
  {
    title: 'Pudim proteico',
    description: 'Meia unidade, como indica o plano.',
    moments: ['ceia'], prepTime: 1, cookTime: 0,
    components: [{ optionId: 'ce-pudim', as: 'pudim proteico', macroKey: 'pudim proteico', units: 1 }],
    steps: ['Serve metade da unidade.'],
    tags: ['High Protein'],
  },
]

const ACORDAR: SeedRecipe[] = [
  {
    title: 'Água com limão e canela',
    description: 'O plano sugere canela ou gengibre, se quiseres.',
    moments: ['acordar'], prepTime: 1, cookTime: 0,
    components: [{ optionId: 'agua-acordar', as: 'água', macroKey: 'água', units: 1 }],
    extras: [
      { name: 'limão', quantity: 0.25, unit: 'unidade' },
      { name: 'canela', quantity: 1, unit: 'pitada' },
    ],
    steps: ['Bebe 1 a 2 copos de água ao acordar, com o limão e a canela.'],
    tags: [],
  },
]

export const RECIPE_LIBRARY: SeedRecipe[] = [
  ...ACORDAR, ...PEQUENO_ALMOCO, ...MEIO_DA_MANHA, ...REFEICOES,
  ...LANCHE_1, ...LANCHE_2, ...CEIA,
]
