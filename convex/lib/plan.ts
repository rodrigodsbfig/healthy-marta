/**
 * Marta's nutrition plan, as prescribed by Catarina Ventura (C.P.4752N),
 * Dianadinis Nutrição — "Plano Alimentar Marta Faria 01/2025".
 *
 * This file is the single source of truth for what Marta is allowed to eat
 * and in what quantity. The weekly meal generator may only ever pick options
 * listed here, at the portions listed here, so a generated week is compliant
 * by construction rather than by trusting a model to remember the rules.
 *
 * If the nutritionist issues a revised plan, update THIS file — nothing else
 * should hardcode portions.
 */

/** The eight eating moments in a day, in the order she eats them. */
export type MealMoment =
  | 'acordar'
  | 'pequenoAlmoco'
  | 'meioDaManha'
  | 'almoco'
  | 'lanche1'
  | 'lanche2'
  | 'jantar'
  | 'ceia'

export const MEAL_MOMENTS: MealMoment[] = [
  'acordar', 'pequenoAlmoco', 'meioDaManha', 'almoco',
  'lanche1', 'lanche2', 'jantar', 'ceia',
]

/** The component categories a meal is assembled from. */
export type ComponentKind =
  | 'hidratos'   // carbohydrate source
  | 'proteina'   // protein source
  | 'gordura'    // fat source
  | 'fibra'      // vegetables / fruit
  | 'bebida'     // drink
  | 'sopa'       // soup starter
  | 'livre'      // free choice (lanche 2 only)

/** One allowed food at its prescribed portion. */
export interface PlanOption {
  /** Stable id, used by recipes to declare which option they satisfy. */
  id: string
  /** Label exactly as the nutritionist wrote it, in Portuguese. */
  label: string
  grams?: number
  ml?: number
  /** Free-text amount where grams don't apply, e.g. "1 ovo + 50g claras". */
  amount?: string
  /** Portion when the meal is eaten WITHOUT soup (fibra options only). */
  gramsSemSopa?: number
  /** Flags the generator uses to enforce the plan's weekly rules. */
  tags?: Array<'carneVermelha' | 'ovo' | 'fruta' | 'peixe' | 'vegetariano'>
}

/** A slot within a moment: "choose 1 source of protein", etc. */
export interface ComponentSlot {
  kind: ComponentKind
  /** How many options she picks — always 1 in this plan. */
  choose: number
  optional?: boolean
  options: PlanOption[]
  /** Shown in the UI, e.g. "Escolher 1 fonte de proteína". */
  instruction: string
}

export interface MomentDefinition {
  moment: MealMoment
  label: string
  labelEn: string
  /** Rough time of day, used for ordering and for the 18h lanche label. */
  time?: string
  optional?: boolean
  slots: ComponentSlot[]
  notes?: string[]
}

// ---------------------------------------------------------------------------
// Shared option lists (reused across moments at different portions)
// ---------------------------------------------------------------------------

/** Fibre options. Portions differ depending on whether soup is eaten. */
const LEGUMES_ALMOCO_JANTAR: PlanOption[] = [
  { id: 'legumes-salteados', label: 'legumes salteados', grams: 100, gramsSemSopa: 150 },
  { id: 'legumes-refogados', label: 'legumes refogados', grams: 120, gramsSemSopa: 170 },
  { id: 'legumes-cozidos', label: 'legumes cozidos', grams: 150, gramsSemSopa: 200 },
  { id: 'saladas', label: 'saladas', grams: 180, gramsSemSopa: 230 },
]

/** Protein options for almoço and jantar (identical in both). */
const PROTEINA_PRINCIPAL: PlanOption[] = [
  { id: 'peixe', label: 'peixe', grams: 110, tags: ['peixe'] },
  // The plan writes "90g carnes brancas ou vaca" as a single line because the
  // portion is identical. They are split here because only beef is red meat,
  // and the generator rations red meat to 1–2×/week — grouping them would
  // wrongly ration chicken and turkey too.
  { id: 'carnes-brancas', label: 'carnes brancas', grams: 90 },
  { id: 'vaca', label: 'vaca', grams: 90, tags: ['carneVermelha'] },
  { id: 'atum', label: 'atum em água ou azeite', grams: 85, tags: ['peixe'] },
  { id: 'ovos', label: 'ovos', amount: '2 ovos', tags: ['ovo'] },
  { id: 'tofu', label: 'tofu', grams: 120, tags: ['vegetariano'] },
]

const SOPA: ComponentSlot = {
  kind: 'sopa',
  choose: 1,
  optional: true,
  instruction: 'Pré-refeição para saciedade, fibras e vitaminas',
  options: [{ id: 'sopa', label: 'sopa sem batata', ml: 200 }],
}

// ---------------------------------------------------------------------------
// The plan
// ---------------------------------------------------------------------------

export const PLAN: MomentDefinition[] = [
  {
    moment: 'acordar',
    label: 'Acordar',
    labelEn: 'On waking',
    slots: [{
      kind: 'bebida',
      choose: 1,
      instruction: 'Beber ao acordar',
      options: [{ id: 'agua-acordar', label: 'água', amount: '1 a 2 copos de água' }],
    }],
    notes: ['Se quiseres podes adicionar canela ou gengibre'],
  },

  {
    moment: 'pequenoAlmoco',
    label: 'Pequeno Almoço',
    labelEn: 'Breakfast',
    slots: [
      {
        kind: 'hidratos',
        choose: 1,
        instruction: 'Escolher 1 fonte de hidrato de carbono',
        options: [
          { id: 'pa-pao', label: 'pão / pão escuro', grams: 50 },
          { id: 'pa-granola', label: 'granola ou cereais 0%', grams: 25 },
          { id: 'pa-aveia', label: 'flocos / farinha de aveia', grams: 25 },
          { id: 'pa-tapioca', label: 'tapioca / polvilho doce', grams: 25 },
          { id: 'pa-marinheiras', label: 'marinheiras', amount: '3 marinheiras' },
          { id: 'pa-tortitas', label: 'tortitas de milho ou arroz', amount: '5 tortitas de milho ou arroz' },
        ],
      },
      {
        kind: 'proteina',
        choose: 1,
        instruction: 'Escolher 1 fonte de proteína',
        options: [
          { id: 'pa-queijo-fresco', label: 'queijo fresco magro', grams: 50 },
          { id: 'pa-philadelphia', label: 'philadelphia light', grams: 20 },
          { id: 'pa-ovo-claras', label: 'ovo + claras', amount: '1 ovo + 50g claras', tags: ['ovo'] },
          { id: 'pa-claras', label: 'claras de ovo', grams: 100, tags: ['ovo'] },
          { id: 'pa-queijo-magro', label: 'queijo magro', amount: '1 fatia de queijo magro' },
          { id: 'pa-babybel', label: 'babybel light', amount: '1 babybel light' },
          { id: 'pa-vaca-que-ri', label: 'vaca que ri light', amount: '1 vaca que ri light' },
          { id: 'pa-iogurte-magro', label: 'iogurte magro 0% açúcar', amount: '1 iogurte magro 0% açúcar' },
          { id: 'pa-iogurte-proteico', label: 'iogurte proteico', amount: '1 iogurte proteico' },
          { id: 'pa-bebida-vegetal', label: 'bebida vegetal 0%', ml: 200 },
        ],
      },
      {
        kind: 'gordura',
        choose: 1,
        instruction: 'Escolher 1 fonte de gordura',
        options: [
          { id: 'pa-abacate', label: 'abacate', grams: 30 },
          { id: 'pa-frutos-secos', label: 'frutos secos', grams: 10 },
          { id: 'pa-sementes', label: 'sementes', grams: 10 },
          { id: 'pa-chocolate', label: 'chocolate mín. 70% cacau 0% açúcar', grams: 10 },
        ],
      },
      {
        kind: 'fibra',
        choose: 1,
        optional: true,
        instruction: 'Fruta — apenas em dias que está em casa',
        options: [{ id: 'pa-fruta', label: 'fruta', grams: 100, tags: ['fruta'] }],
      },
      {
        kind: 'bebida',
        choose: 1,
        instruction: 'Escolher 1 bebida',
        options: [
          { id: 'pa-cafe', label: 'café sem açúcar', amount: '1 café sem açúcar' },
          { id: 'pa-cha', label: 'chá sem açúcar', amount: '1 chávena de chá sem açúcar' },
          { id: 'pa-agua', label: 'água', amount: '1 copo de água' },
        ],
      },
    ],
    notes: ['Nos dias em que come fruta ao pequeno-almoço (em casa), não faz meio da manhã'],
  },

  {
    moment: 'meioDaManha',
    label: 'Meio da Manhã',
    labelEn: 'Mid-morning',
    optional: true,
    slots: [
      {
        kind: 'hidratos',
        choose: 1,
        instruction: 'Escolher 1 fonte de hidrato de carbono',
        options: [
          { id: 'mm-fruta', label: 'fruta', grams: 100, tags: ['fruta'] },
          { id: 'mm-legumes', label: 'legumes', grams: 100 },
        ],
      },
      {
        kind: 'proteina',
        choose: 1,
        instruction: 'Escolher 1 fonte de proteína',
        options: [
          { id: 'mm-iogurte-magro', label: 'iogurte magro 0% açúcares', amount: '1 iogurte magro 0% açúcares' },
          { id: 'mm-bebida-vegetal', label: 'bebida vegetal 0%', ml: 200 },
          { id: 'mm-babybel', label: 'babybel / vaca que ri light', amount: '1 babybel ou vaca que ri light' },
        ],
      },
    ],
  },

  {
    moment: 'almoco',
    label: 'Almoço',
    labelEn: 'Lunch',
    slots: [
      SOPA,
      { kind: 'proteina', choose: 1, instruction: 'Escolher 1 fonte de proteína', options: PROTEINA_PRINCIPAL },
      {
        kind: 'hidratos',
        choose: 1,
        instruction: 'Escolher 1 fonte de hidrato de carbono',
        options: [
          { id: 'al-arroz', label: 'arroz basmati', grams: 90 },
          { id: 'al-massa', label: 'massa', grams: 90 },
          { id: 'al-quinoa', label: 'quinoa', grams: 90 },
          { id: 'al-inhame', label: 'inhame', grams: 90 },
          { id: 'al-amaranto', label: 'amaranto', grams: 90 },
          { id: 'al-bulgur', label: 'bulgur', grams: 130 },
          { id: 'al-trigo-sarraceno', label: 'trigo sarraceno', grams: 90 },
          { id: 'al-batata', label: 'batata doce / batata inglesa', grams: 130 },
        ],
      },
      { kind: 'fibra', choose: 1, instruction: 'Escolher 1 fonte de fibra', options: LEGUMES_ALMOCO_JANTAR },
    ],
    notes: [
      'Substituições: 15g requeijão / 25g queijo fresco / 1 fatia fina de presunto — reduzir 10g de proteína da refeição',
      'Tostas: 2 a 3 pequenas — reduz 10g de HC no plano',
      'Gordura para confecionar e temperar: 5g azeite ou 5g molhos, ou 30g abacate ou 10g frutos secos',
    ],
  },

  {
    moment: 'lanche1',
    label: 'Lanche 1',
    labelEn: 'Afternoon snack',
    slots: [
      {
        kind: 'hidratos',
        choose: 1,
        instruction: 'Escolher 1 fonte de hidrato de carbono',
        options: [
          { id: 'l1-marinheiras', label: 'marinheiras', amount: '3 marinheiras' },
          { id: 'l1-tortilhas', label: 'tortilhas milho ou arroz', amount: '4 tortilhas de milho ou arroz' },
          { id: 'l1-tostas', label: 'tostas extrafinas', amount: '10 tostas extrafinas' },
          { id: 'l1-granola', label: 'granola / aveia / cereais 0%', grams: 20 },
          { id: 'l1-pao', label: 'pão', grams: 40 },
        ],
      },
      {
        kind: 'proteina',
        choose: 1,
        instruction: 'Escolher 1 fonte de proteína',
        options: [
          { id: 'l1-queijo-fresco', label: 'queijo fresco magro', grams: 50 },
          { id: 'l1-philadelphia', label: 'philadelphia light', grams: 30 },
          { id: 'l1-ovo-claras', label: 'ovo + claras', amount: '1 ovo + 50g claras', tags: ['ovo'] },
          { id: 'l1-claras', label: 'claras de ovo', grams: 100, tags: ['ovo'] },
          { id: 'l1-queijo-magro', label: 'queijo magro', amount: '1 fatia de queijo magro' },
          { id: 'l1-babybel', label: 'babybel light', amount: '1 babybel light' },
          { id: 'l1-vaca-que-ri', label: 'vaca que ri light', amount: '1 vaca que ri light' },
          { id: 'l1-iogurte-magro', label: 'iogurte magro', amount: '1 iogurte magro' },
          { id: 'l1-iogurte-proteico', label: 'iogurte proteico', amount: '1 iogurte proteico' },
          { id: 'l1-pudim', label: 'pudim proteico', amount: '½ pudim proteico (100g)' },
          { id: 'l1-bebida-vegetal', label: 'bebida vegetal 0%', ml: 200 },
          { id: 'l1-tremocos', label: 'tremoços', grams: 50 },
        ],
      },
    ],
    notes: [
      'Substituições: 1 açaí com fruta (+ 1 fonte de proteína)',
      '1 fatia fina de bolo caseiro (+ 1 fonte de proteína)',
      '1 miniatura de doce de ovo em vez da fonte de hidratos do plano',
    ],
  },

  {
    moment: 'lanche2',
    label: 'Lanche 2',
    labelEn: 'Evening snack',
    time: '18:00',
    slots: [
      {
        kind: 'livre',
        choose: 1,
        instruction: 'Escolher 1 fonte à escolha',
        options: [
          { id: 'l2-frutos-secos', label: 'frutos secos', grams: 10 },
          { id: 'l2-chocolate', label: 'chocolate mín. 70% cacau 0% açúcar', grams: 10 },
          { id: 'l2-quadrado', label: 'chocolate que gostar', amount: '1 quadrado de chocolate que gostar' },
        ],
      },
      {
        kind: 'fibra',
        choose: 1,
        instruction: 'Escolher 1 fonte de fibra',
        options: [
          { id: 'l2-fruta', label: 'fruta', grams: 100, tags: ['fruta'] },
          { id: 'l2-gelado', label: 'gelado 100% fruta', amount: '1 gelado 100% fruta', tags: ['fruta'] },
        ],
      },
    ],
  },

  {
    moment: 'jantar',
    label: 'Jantar',
    labelEn: 'Dinner',
    slots: [
      SOPA,
      { kind: 'proteina', choose: 1, instruction: 'Escolher 1 fonte de proteína', options: PROTEINA_PRINCIPAL },
      {
        // Note the smaller portions than almoço — this is prescribed, not a typo.
        kind: 'hidratos',
        choose: 1,
        instruction: 'Escolher 1 fonte de hidratos de carbono',
        options: [
          { id: 'ja-arroz', label: 'arroz basmati', grams: 60 },
          { id: 'ja-massa', label: 'massa', grams: 60 },
          { id: 'ja-quinoa', label: 'quinoa', grams: 60 },
          { id: 'ja-inhame', label: 'inhame', grams: 60 },
          { id: 'ja-amaranto', label: 'amaranto', grams: 60 },
          { id: 'ja-bulgur', label: 'bulgur', grams: 100 },
          { id: 'ja-trigo-sarraceno', label: 'trigo sarraceno', grams: 60 },
          { id: 'ja-batata', label: 'batata doce / batata inglesa', grams: 100 },
        ],
      },
      { kind: 'fibra', choose: 1, instruction: 'Escolher 1 fonte de fibra', options: LEGUMES_ALMOCO_JANTAR },
    ],
    notes: [
      'Se vai comer sopa e não consegue adicionar legumes, coloque as opções escolhidas num prato de sobremesa',
      'Gordura para confecionar e temperar: 5g azeite ou 5g molhos, ou 30g abacate ou 10g frutos secos',
    ],
  },

  {
    moment: 'ceia',
    label: 'Ceia',
    labelEn: 'Supper',
    optional: true,
    slots: [{
      kind: 'proteina',
      choose: 1,
      instruction: 'Se sentir necessidade, escolher 1 opção',
      options: [
        { id: 'ce-cha', label: 'chá sem açúcar', amount: '1 chávena de chá sem açúcar' },
        { id: 'ce-iogurte', label: 'iogurte magro ou proteico', amount: '1 iogurte magro ou proteico' },
        { id: 'ce-pudim', label: 'pudim proteico', amount: '½ pudim proteico' },
        { id: 'ce-babybel', label: 'babybel light', amount: '1 babybel light' },
      ],
    }],
  },
]

// ---------------------------------------------------------------------------
// Weekly and daily rules the generator must respect
// ---------------------------------------------------------------------------

export const PLAN_RULES = {
  /** Weight-loss phase: 1 free meal per week (maintenance allows 2–3). */
  refeicoesLivresPorSemana: 1,
  /** "Pode comer 1 a 2 vezes por semana carnes vermelhas." */
  carneVermelhaMaxPorSemana: 2,
  /** "Pode consumir 1 ovo por dia." */
  ovosMaxPorDia: 1,
  /** "Consumir 2 a 3 peças de fruta por dia, 1 peça = 100g." */
  frutaPecasPorDia: { min: 2, max: 3 },
  /** "Não esquecer de beber no mínimo 1,5L de água." */
  aguaMinimaLitros: 1.5,
  /** Preferred cooking methods, in the nutritionist's order of preference. */
  metodosConfecao: ['grelhado', 'cozido a vapor', 'cozido em água'],
} as const

/** 1 peça de fruta = 100g. Household equivalents for common fruit. */
export const FRUTA_EQUIVALENTES: Record<string, string> = {
  ameixa: '2 unidades médias',
  ananas: '1 rodela fina',
  melancia: '1 talhada',
  cerejas: '16 bagos',
  damasco: '2 unidades pequenas',
  diospiro: '1 unidade pequena',
  figo: '2 unidades pequenas',
  framboesa: '25 unidades',
  kiwi: '1 unidade grande',
  laranja: '1 unidade média',
  maca: '1 unidade pequena',
  manga: '1/3 da unidade',
  banana: '½ banana ou 1 banana da madeira',
  melao: '1 talhada',
  meloa: '¼ de uma unidade',
  morango: '6 unidades pequenas ou 3 médias',
  nectarina: '1 unidade',
  nespera: '2 unidades médias',
  papaia: '1/3 da unidade',
  pera: '1 unidade média',
  pessego: '1 unidade grande',
  tangera: '2 unidades médias',
  tangerina: '2 unidades médias',
  toranja: '1 unidade média',
  uvas: '14 bagos',
}

/** Scale weight → household measure, for cooking without a scale. */
export const MEDIDAS_CASEIRAS: Array<{ balanca: string; caseira: string }> = [
  { balanca: '100g arroz, massa, quinoa, couscous (cozinhados)', caseira: '3 colheres de sopa' },
  { balanca: '140g batata cozinhada', caseira: '2 batatas de tamanho médio' },
  { balanca: '120g batata (cozinhada)', caseira: '1 batata e ½ de tamanho médio' },
  { balanca: '30g cereais', caseira: '4 colheres de sopa' },
  { balanca: '30g aveia', caseira: '4 colheres de sopa rasas' },
  { balanca: '100g feijão, grão, ervilhas, lentilhas, favas', caseira: '4 colheres de sopa' },
]

/** Cooking fats, for translating recipe quantities. */
export const GORDURAS_CONFECAO: Record<string, number> = {
  'colher de sopa de azeite': 10,
  'colher de sobremesa de manteiga': 15,
  'colher de sobremesa de manteiga de amendoim': 10,
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getMoment(moment: MealMoment): MomentDefinition {
  const found = PLAN.find((m) => m.moment === moment)
  if (!found) throw new Error(`Unknown meal moment: ${moment}`)
  return found
}

/** Every option in the plan, flattened, keyed by id — for recipe validation. */
export const OPTIONS_BY_ID: Record<string, PlanOption & { moment: MealMoment; kind: ComponentKind }> =
  Object.fromEntries(
    PLAN.flatMap((m) =>
      m.slots.flatMap((s) =>
        s.options.map((o) => [o.id, { ...o, moment: m.moment, kind: s.kind }] as const)
      )
    )
  )

/**
 * The portion for an option, accounting for the soup rule: fibre portions
 * increase when the meal is eaten without soup.
 */
export function portionFor(optionId: string, opts: { comSopa?: boolean } = {}): string {
  const o = OPTIONS_BY_ID[optionId]
  if (!o) throw new Error(`Unknown plan option: ${optionId}`)
  if (o.kind === 'fibra' && o.gramsSemSopa !== undefined && opts.comSopa === false) {
    return `${o.gramsSemSopa}g ${o.label}`
  }
  if (o.grams !== undefined) return `${o.grams}g ${o.label}`
  if (o.ml !== undefined) return `${o.ml}ml ${o.label}`
  // `amount` is already a complete phrase in the nutritionist's own wording
  // ("3 marinheiras", "1 ovo + 50g claras"), so it is returned as written.
  return o.amount ?? o.label
}

/**
 * Find the same food's option at a different meal moment.
 *
 * The plan lists the same foods at different portions per moment — 90g arroz
 * at almoço, 60g at jantar — as separate options with separate ids. A recipe
 * declares its components once (at almoço portions) and this resolves them for
 * whichever moment it is actually being served at, so one recipe can be both
 * lunch and dinner without stating the wrong quantity.
 */
export function equivalentOption(optionId: string, moment: MealMoment): PlanOption | undefined {
  const source = OPTIONS_BY_ID[optionId]
  if (!source) return undefined
  if (source.moment === moment) return source
  const slot = getMoment(moment).slots.find((s) => s.kind === source.kind)
  return slot?.options.find((o) => o.label === source.label)
}

/** The grams (or ml) an option calls for, accounting for the soup rule. */
export function amountFor(
  option: PlanOption,
  opts: { comSopa?: boolean } = {}
): { grams?: number; ml?: number; amount?: string } {
  if (option.grams !== undefined) {
    const useSemSopa = option.gramsSemSopa !== undefined && opts.comSopa === false
    return { grams: useSemSopa ? option.gramsSemSopa : option.grams }
  }
  if (option.ml !== undefined) return { ml: option.ml }
  return { amount: option.amount }
}
