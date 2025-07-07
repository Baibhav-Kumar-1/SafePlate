// Common allergens and their alternative names
const ALLERGEN_MAP = {
  peanut: ['peanuts', 'peanut butter', 'groundnut'],
  treenut: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
  milk: ['dairy', 'cream', 'butter', 'cheese', 'yogurt', 'lactose', 'whey', 'casein'],
  egg: ['eggs', 'mayonnaise', 'albumen', 'meringue', 'eggnog'],
  soy: ['soya', 'tofu', 'edamame', 'tempeh', 'miso'],
  wheat: ['flour', 'bread', 'pasta', 'gluten', 'semolina', 'couscous'],
  fish: ['cod', 'salmon', 'tuna', 'halibut', 'anchovy', 'bass', 'trout'],
  shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish', 'oyster', 'mussel', 'clam'],
  sesame: ['tahini', 'sesame oil', 'sesame seeds'],
  sulfite: ['sulfites', 'sulphites', 'wine', 'dried fruit'],
};

/**
 * Detect potential allergens in text
 * @param {string} text - Menu text
 * @returns {Array<{allergen: string, mentions: Array<{term: string, context: string}>}>}
 */
export function detectAllergens(text) {
  const lowerText = text.toLowerCase();
  const results = [];

  for (const [allergen, terms] of Object.entries(ALLERGEN_MAP)) {
    const mentions = [];
    
    // Check for main allergen
    if (lowerText.includes(allergen)) {
      mentions.push({
        term: allergen,
        context: getTextContext(text, allergen),
      });
    }

    // Check for alternative terms
    for (const term of terms) {
      if (lowerText.includes(term.toLowerCase())) {
        mentions.push({
          term,
          context: getTextContext(text, term),
        });
      }
    }

    if (mentions.length > 0) {
      results.push({ allergen, mentions });
    }
  }

  return results;
}

/**
 * Extract menu items and their ingredients
 * @param {string} text - Menu text
 * @returns {Array<{name: string, ingredients: Array<string>, allergens: Array<string>}>}
 */
export function extractMenuItems(text) {
  if (!text) return [];
  return [{
    name: text,
    description: "",
    price: "",
    ingredients: [],
    allergens: []
  }];
}

/**
 * Process a menu item to extract ingredients and allergens
 * @param {Object} item - Menu item with name and description
 * @returns {Object} - Processed item with ingredients and allergens
 */
function processMenuItem(item) {
  const ingredients = extractIngredients(item.description);
  const allergens = detectAllergens(item.description + ' ' + item.name);
  
  return {
    ...item,
    ingredients,
    allergens: allergens.map(a => a.allergen),
  };
}

/**
 * Extract ingredients from text
 * @param {string} text - Description text
 * @returns {Array<string>}
 */
function extractIngredients(text) {
  // Look for ingredient lists in parentheses or after "contains" or "includes"
  const matches = text.match(/\(([^)]+)\)|\b(?:contains|includes|with)\s+([^.]+)/gi);
  
  if (!matches) return [];

  return matches
    .map(match => 
      match
        .replace(/[()]/g, '')
        .replace(/\b(?:contains|includes|with)\s+/i, '')
        .split(/[,&]/)
        .map(i => i.trim())
        .filter(Boolean)
    )
    .flat();
}

/**
 * Get surrounding text context for a term
 * @param {string} text - Full text
 * @param {string} term - Term to find context for
 * @returns {string}
 */
function getTextContext(text, term) {
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(term.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + term.length + 30);
  
  return text.slice(start, end).trim();
}

/**
 * Calculate confidence score for allergen detection
 * @param {Object} menuItem - Processed menu item
 * @returns {number} - Confidence score (0-1)
 */
export function calculateAllergenConfidence(menuItem) {
  let score = 0;
  const maxScore = 3;

  // Direct allergen mention
  if (menuItem.allergens.length > 0) {
    score += 1;
  }

  // Ingredient list presence
  if (menuItem.ingredients.length > 0) {
    score += 1;
  }

  // Clear allergen warning in description
  if (menuItem.description.toLowerCase().includes('allerg')) {
    score += 1;
  }

  return score / maxScore;
}