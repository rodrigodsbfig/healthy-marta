export type Lang = 'en' | 'pt'

// Tag display names: values are stored as English in DB, displayed translated
export const TAG_KEYS = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack',
  'Vegetarian', 'Vegan', 'High Protein', 'Low Carb', 'Gluten-Free', 'Dairy-Free',
] as const

export type TagKey = typeof TAG_KEYS[number]

const tagTranslations: Record<Lang, Record<TagKey, string>> = {
  en: {
    'Breakfast':    'Breakfast',
    'Lunch':        'Lunch',
    'Dinner':       'Dinner',
    'Snack':        'Snack',
    'Vegetarian':   'Vegetarian',
    'Vegan':        'Vegan',
    'High Protein': 'High Protein',
    'Low Carb':     'Low Carb',
    'Gluten-Free':  'Gluten-Free',
    'Dairy-Free':   'Dairy-Free',
  },
  pt: {
    'Breakfast':    'Pequeno-Almoço',
    'Lunch':        'Almoço',
    'Dinner':       'Jantar',
    'Snack':        'Lanche',
    'Vegetarian':   'Vegetariano',
    'Vegan':        'Vegan',
    'High Protein': 'Rico em Proteína',
    'Low Carb':     'Baixo em Hidratos',
    'Gluten-Free':  'Sem Glúten',
    'Dairy-Free':   'Sem Lactose',
  },
}

export function translateTag(tag: string, lang: Lang): string {
  return tagTranslations[lang][tag as TagKey] ?? tag
}

// Day names by index (Mon=0 … Sun=6)
export const DAY_NAMES: Record<Lang, string[]> = {
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  pt: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
}

export const DAY_SHORT: Record<Lang, string[]> = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
}

// Meal type labels (stored in English in DB)
export const MEAL_LABELS: Record<Lang, Record<string, string>> = {
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' },
  pt: { breakfast: 'Pequeno-almoço', lunch: 'Almoço', dinner: 'Jantar', snack: 'Lanche' },
}

// All other UI strings
const en = {
  // Nav
  nav_today:         'Today',
  nav_meal_plan:     'Meal Plan',
  nav_recipes:       'Recipes',
  nav_shopping:      'Shopping List',
  nav_profile:       'Profile',
  nav_prep:          'Prep',

  // Common
  cancel:            'Cancel',
  delete:            'Delete',
  edit:              'Edit',
  save_changes:      'Save changes',
  saving:            'Saving…',
  loading:           'Loading…',
  add:               'Add',
  servings:          'Servings',
  min:               'min',
  kcal:              'kcal',
  today_label:       'Today',

  // Today page
  good_morning:      'Good morning',
  log_a_meal:        'Log a meal',
  todays_menu:       "Today's Menu",
  todays_plan:       "Today's Plan",
  logged_meals:      'Logged',
  no_planned_meals:  'Nothing planned for today',
  goal:              'goal',
  remaining:         'remaining',
  log:               'Log',
  this_week:         'This Week',
  view_meal_plan:    'View meal plan',
  date_locale:       'en-GB',

  // Log meal modal
  log_meal_title:    'Log a meal',
  from_recipe:       'From recipe',
  manual_entry:      'Manual',
  select_recipe:     'Select a recipe',
  log_confirm:       'Log meal',
  no_nutrition:      'No nutrition data',

  // Prep session
  prep_session:      'Prep Session',
  gen_prep:          'Generate from plan',
  recipes_prepped:   'recipes prepped',
  all_ingredients:   'All Ingredients',
  no_prep_yet:       'No prep plan yet',
  prep_hint:         'Generate a prep plan from your meal plan',
  prepped:           'Prepped',

  // Recipe scaling
  adjust_servings:   'Servings',
  scaled_note:       'Scaled',

  // Meal Plan
  meal_plan:         'Meal Plan',
  add_meal:          'Add meal',
  no_meals_planned:  'No meals planned',
  nothing_planned:   'Nothing planned yet for this day.',
  add_a_recipe:      'Add a recipe',

  // Recipes
  recipes:           'Recipes',
  add_recipe:        'Add recipe',
  search_recipes:    'Search recipes or tags…',
  no_recipes_found:  'No recipes found',
  no_recipes_yet:    'No recipes yet',
  try_diff_search:   'Try a different search term.',
  add_first_recipe:  'Add your first recipe to get started.',

  // Recipe Detail
  back_to_recipes:   'Back to Recipes',
  loading_recipe:    'Loading recipe…',
  recipe_not_found:  'Recipe not found.',
  back_link:         '← Back to Recipes',
  ingredients:       'Ingredients',
  instructions:      'Instructions',
  prep:              'Prep',
  cook:              'Cook',
  del_recipe_title:  'Delete recipe?',
  del_recipe_body_suffix: "will be permanently removed. This can't be undone.",

  // Shopping List
  shopping_list:     'Shopping List',
  from_meal_plan:    'from meal plan',
  gen_from_plan:     'Generate from plan',
  generating:        'Generating…',
  no_items_yet:      'No items yet',
  shopping_hint:     'Plan your meals first, then generate your shopping list.',
  gen_from_ml:       'Generate from meal plan',
  add_to_my_list:    'Add to my own list',
  add_item:          'Add item',
  item_name:         'Item name',
  qty:               'Qty',
  unit_hint:         'Unit (g, ml, pieces…)',
  of_items:          'of',
  items:             'items',

  // Recipe Form
  new_recipe:        'New Recipe',
  edit_recipe:       'Edit Recipe',
  title_field:       'Title',
  title_ph:          'e.g. Salmon & Quinoa',
  desc_optional:     'Description (optional)',
  desc_ph:           'A short description...',
  prep_min:          'Prep (min)',
  cook_min:          'Cook (min)',
  tags_label:        'Tags',
  ingredient:        'Ingredient',
  add_ingredient:    'Add ingredient',
  add_step:          'Add step',
  nutrition_label:   'Nutrition per serving (optional)',
  step_prefix:       'Step',

  // Recipe Import
  import_title:      'Add recipe',
  import_subtitle:   'AI will fill in the details for you',
  tab_photo:         'Photo',
  tab_url:           'URL',
  tab_describe:      'Describe',
  photo_hint:        'Take a photo of a cookbook page, a recipe card, or anything with recipe text on it.',
  take_photo:        'Take photo',
  upload_image:      'Upload image',
  reading_recipe:    'Reading the recipe…',
  url_hint:          'Paste a link from any recipe website — BBC Good Food, AllRecipes, NYT Cooking, and most others work.',
  import_recipe:     'Import recipe',
  importing:         'Importing…',
  describe_hint:     'Describe a meal you love and AI will generate a full recipe for it.',
  describe_ph:       "e.g. My mum's chicken soup with carrots, celery and noodles. Serves 4, takes about an hour.",
  generate_recipe:   'Generate recipe',
  ai_disclaimer:     'AI results are editable — you\'ll review before saving',

  // Recipe Picker
  pick_from_library: 'Pick a recipe from your library',
  search_recipes_picker: 'Search recipes…',
  no_match:          'No recipes match your search.',
  no_recipes_add:    'No recipes yet. Add some first!',
  add_to_plan:       'Add to plan',

  // Profile
  profile:           'Profile',
  auth_coming:       'Auth coming in Phase 2.',
  language_label:    'Language',

  // Voice pantry
  voice_listening:   'Listening… speak clearly',
  voice_done:        'Done',
  voice_processing:  'Extracting items…',
  voice_found:       '{n} items found',
  voice_add_items:   'Add {n} item(s)',
  voice_try_again:   'Nothing found — try again',
  voice_error:       'Microphone error — try again',

  // Pantry
  to_buy:            'To Buy',
  in_pantry:         'Pantry',
  pantry_empty:      'Your pantry is empty',
  pantry_hint:       'Add things you already have at home — they\'ll be flagged on your shopping list.',
  add_to_pantry:     'Add to pantry',
  have_it:           'Have it',

  // Log modal — recent tab
  recent_meals:      'Recent',
  no_recent_meals:   'No meals logged yet',
  log_again:         'Log again',

  // Recipe filters
  all_tags:          'All',
  sort_default:      'Default',
  sort_protein:      'Protein ↓',
  sort_calories:     'Calories ↑',
  sort_time:         'Quickest',

  // Weekly history
  no_data:           '—',

  // Nutrition labels
  cal_label:         'Calories',
  protein_label:     'Protein',
  carbs_label:       'Carbs',
  fat_label:         'Fat',
  protein_unit:      'protein (g)',
  carbs_unit:        'carbs (g)',
  fat_unit:          'fat (g)',
  cal_unit:          'kcal',
}

const pt: typeof en = {
  nav_today:         'Hoje',
  nav_meal_plan:     'Plano',
  nav_recipes:       'Receitas',
  nav_shopping:      'Compras',
  nav_profile:       'Perfil',
  nav_prep:          'Prep',

  cancel:            'Cancelar',
  delete:            'Eliminar',
  edit:              'Editar',
  save_changes:      'Guardar alterações',
  saving:            'A guardar…',
  loading:           'A carregar…',
  add:               'Adicionar',
  servings:          'Porções',
  min:               'min',
  kcal:              'kcal',
  today_label:       'Hoje',

  good_morning:      'Bom dia',
  log_a_meal:        'Registar refeição',
  todays_menu:       'Menu de Hoje',
  todays_plan:       'Plano de Hoje',
  logged_meals:      'Registado',
  no_planned_meals:  'Nada planeado para hoje',
  goal:              'objectivo',
  remaining:         'restante',
  log:               'Registar',
  this_week:         'Esta Semana',
  view_meal_plan:    'Ver plano de refeições',
  date_locale:       'pt-PT',

  log_meal_title:    'Registar refeição',
  from_recipe:       'De receita',
  manual_entry:      'Manual',
  select_recipe:     'Selecionar receita',
  log_confirm:       'Registar refeição',
  no_nutrition:      'Sem dados nutricionais',

  prep_session:      'Sessão de Prep',
  gen_prep:          'Gerar do plano',
  recipes_prepped:   'receitas preparadas',
  all_ingredients:   'Todos os Ingredientes',
  no_prep_yet:       'Sem plano de prep ainda',
  prep_hint:         'Gera um plano de prep do teu plano de refeições',
  prepped:           'Preparado',

  adjust_servings:   'Porções',
  scaled_note:       'Escalado',

  meal_plan:         'Plano de Refeições',
  add_meal:          'Adicionar refeição',
  no_meals_planned:  'Nenhuma refeição planeada',
  nothing_planned:   'Nada planeado para este dia.',
  add_a_recipe:      'Adicionar receita',

  recipes:           'Receitas',
  add_recipe:        'Adicionar receita',
  search_recipes:    'Pesquisar receitas ou tags…',
  no_recipes_found:  'Nenhuma receita encontrada',
  no_recipes_yet:    'Sem receitas ainda',
  try_diff_search:   'Tenta outro termo de pesquisa.',
  add_first_recipe:  'Adiciona a tua primeira receita para começar.',

  back_to_recipes:   'Voltar às Receitas',
  loading_recipe:    'A carregar receita…',
  recipe_not_found:  'Receita não encontrada.',
  back_link:         '← Voltar às Receitas',
  ingredients:       'Ingredientes',
  instructions:      'Instruções',
  prep:              'Prep',
  cook:              'Cozedura',
  del_recipe_title:  'Eliminar receita?',
  del_recipe_body_suffix: 'será permanentemente removida. Esta ação não pode ser desfeita.',

  shopping_list:     'Lista de Compras',
  from_meal_plan:    'do plano de refeições',
  gen_from_plan:     'Gerar do plano',
  generating:        'A gerar…',
  no_items_yet:      'Sem itens ainda',
  shopping_hint:     'Planeia primeiro as refeições e depois gera a lista de compras.',
  gen_from_ml:       'Gerar do plano de refeições',
  add_to_my_list:    'Adicionar à minha lista',
  add_item:          'Adicionar item',
  item_name:         'Nome do item',
  qty:               'Qtd',
  unit_hint:         'Unidade (g, ml, peças…)',
  of_items:          'de',
  items:             'itens',

  new_recipe:        'Nova Receita',
  edit_recipe:       'Editar Receita',
  title_field:       'Título',
  title_ph:          'ex: Salmão & Quinoa',
  desc_optional:     'Descrição (opcional)',
  desc_ph:           'Uma breve descrição...',
  prep_min:          'Prep (min)',
  cook_min:          'Cozedura (min)',
  tags_label:        'Tags',
  ingredient:        'Ingrediente',
  add_ingredient:    'Adicionar ingrediente',
  add_step:          'Adicionar passo',
  nutrition_label:   'Nutrição por porção (opcional)',
  step_prefix:       'Passo',

  import_title:      'Adicionar receita',
  import_subtitle:   'A IA preencherá os detalhes por ti',
  tab_photo:         'Foto',
  tab_url:           'URL',
  tab_describe:      'Descrever',
  photo_hint:        'Tira uma foto de uma página de livro de receitas, um cartão de receita, ou qualquer texto com receita.',
  take_photo:        'Tirar foto',
  upload_image:      'Carregar imagem',
  reading_recipe:    'A ler a receita…',
  url_hint:          'Cola um link de qualquer site de receitas — BBC Good Food, AllRecipes, e a maioria funciona.',
  import_recipe:     'Importar receita',
  importing:         'A importar…',
  describe_hint:     'Descreve uma refeição que adoras e a IA irá gerar a receita completa.',
  describe_ph:       'ex: A sopa de frango da minha mãe com cenoura, aipo e massa. Para 4 pessoas, demora cerca de uma hora.',
  generate_recipe:   'Gerar receita',
  ai_disclaimer:     'Os resultados da IA são editáveis — irás rever antes de guardar',

  pick_from_library: 'Escolhe uma receita da tua biblioteca',
  search_recipes_picker: 'Pesquisar receitas…',
  no_match:          'Nenhuma receita corresponde à pesquisa.',
  no_recipes_add:    'Sem receitas ainda. Adiciona algumas primeiro!',
  add_to_plan:       'Adicionar ao plano',

  profile:           'Perfil',
  auth_coming:       'Autenticação na Fase 2.',
  language_label:    'Idioma',

  // Voice pantry
  voice_listening:   'A ouvir… fala claramente',
  voice_done:        'Pronto',
  voice_processing:  'A extrair itens…',
  voice_found:       '{n} itens encontrados',
  voice_add_items:   'Adicionar {n} item(ns)',
  voice_try_again:   'Nada encontrado — tenta de novo',
  voice_error:       'Erro no microfone — tenta de novo',

  // Pantry
  to_buy:            'Para Comprar',
  in_pantry:         'Despensa',
  pantry_empty:      'A tua despensa está vazia',
  pantry_hint:       'Adiciona o que já tens em casa — serão assinalados na lista de compras.',
  add_to_pantry:     'Adicionar à despensa',
  have_it:           'Tenho',

  // Log modal — recent tab
  recent_meals:      'Recente',
  no_recent_meals:   'Nenhuma refeição registada ainda',
  log_again:         'Registar de novo',

  // Recipe filters
  all_tags:          'Todos',
  sort_default:      'Padrão',
  sort_protein:      'Proteína ↓',
  sort_calories:     'Calorias ↑',
  sort_time:         'Mais rápido',

  // Weekly history
  no_data:           '—',

  cal_label:         'Calorias',
  protein_label:     'Proteína',
  carbs_label:       'Hidratos',
  fat_label:         'Gordura',
  protein_unit:      'proteína (g)',
  carbs_unit:        'hidratos (g)',
  fat_unit:          'gordura (g)',
  cal_unit:          'kcal',
}

export const translations: Record<Lang, typeof en> = { en, pt }
