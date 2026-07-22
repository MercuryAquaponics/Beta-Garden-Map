// ─── CATEGORY DEFINITIONS ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'R', hex: '#4f7a48', label: { sv: 'Rektangulära Odlingskärl', en: 'Rectangular Planters' } },
  { id: 'F', hex: '#c9a227', label: { sv: 'Fyrkantiga Odlingskärl',   en: 'Square Planters' } },
  { id: 'T', hex: '#8a8f87', label: { sv: 'Triangulära Odlingskärl',  en: 'Triangular Planters' } },
  { id: 'K', hex: '#7c5c3e', label: { sv: 'Runda Krukor',              en: 'Round Pots' } },
];

// ─── PLANT DATA ───────────────────────────────────────────────────────────────
const PLANTS = {
  R1:  { sv: 'Blåbärstry',                     en: 'Blue Honeysuckle' },
  R2:  { sv: 'Blåbärstry',                     en: 'Blue Honeysuckle' },
  R3:  { sv: 'Selleri',                        en: 'Celery' },
  R4:  { sv: 'Selleri',                        en: 'Celery' },
  R5:  { sv: 'Koriander & Tomat',              en: 'Coriander & Tomato' },
  R6:  { sv: 'Tomatillo',                      en: 'Tomatillo' },
  R7:  { sv: 'Mexican Oregano',                en: 'Mexican Oregano' },
  R8:  { sv: 'Tomat',                          en: 'Tomato' },
  R9:  { sv: 'Bönor',                          en: 'Beans' },
  R10: { sv: 'Tomat',                          en: 'Tomato' },
  R11: { sv: 'Sockerärtor',                    en: 'Sugar Snap peas' },
  R12: { sv: 'Tomat',                          en: 'Tomato' },
  R13: { sv: 'Basilika',                       en: 'Basil' },
  R14: { sv: 'Tomat & Basilika',                en: 'Tomato & Basil' },
  R15: { sv: null,                             en: null },
  R16: { sv: 'Persilja & Mangold',              en: 'Parsley & Mangold' },
  R17: { sv: 'Rosmarin',                       en: 'Rosmarin' },
  R18: { sv: 'Oregano',                        en: 'Oregano' },
  R19: { sv: 'Persilja & Mangold & Sockerärt',  en: 'Parsley & Mangold & Sugarsnap' },
  R20: { sv: 'Mangold',                        en: 'Mangold' },
  R21: { sv: 'Persilja',                       en: 'Parsley' },
  R22: { sv: 'Rabarber',                       en: 'Rhubarb' },
  R23: { sv: 'Rabarber',                       en: 'Rhubarb' },
  F1: { sv: 'Röda Vinbär',   en: 'Red Currants' },
  F2: { sv: 'Krusbär',       en: 'Gooseberries' },
  F3: { sv: 'Svarta Vinbär', en: 'Black Currants' },
  F4: { sv: 'Krusbär',       en: 'Gooseberries' },
  F5: { sv: 'Svarta Vinbär', en: 'Black Currants' },
  F6: { sv: 'Krusbär',       en: 'Gooseberries' },
  F7: { sv: 'Röda Vinbär',   en: 'Red Currants' },
  F8: { sv: 'Björnbär',      en: 'Blackberries' },
  T1: { sv: 'Jordgubbar',         en: 'Strawberries' },
  T2: { sv: 'Jordgubbar',         en: 'Strawberries' },
  T3: { sv: 'Jordärtskockor',     en: 'Artichoke' },
  T4: { sv: 'Oregano & Krusbär',  en: 'Oregano & Gooseberries' },
  T5: { sv: 'Dragon & Röda Vinbär', en: 'Tarragon & Red Currants' },
  T6: { sv: 'Jordgubbar',         en: 'Strawberries' },
  T7: { sv: 'Jordgubbar',         en: 'Strawberries' },
  T8: { sv: 'Gräslök',            en: 'Chives' },
  T9: { sv: 'Dragon',             en: 'Tarragon' },
  K1:  { sv: 'Chili',           en: 'Chili' },
  K2:  { sv: 'Tomat',           en: 'Tomato' },
  K3:  { sv: 'Tomat',           en: 'Tomato' },
  K4:  { sv: 'Tomat',           en: 'Tomato' },
  K5:  { sv: 'Gurka/Zucchini',  en: 'Cucumber/Zucchini' },
  K6:  { sv: 'Gurka/Zucchini',  en: 'Cucumber/Zucchini' },
  K7:  { sv: 'Gurka/Zucchini',  en: 'Cucumber/Zucchini' },
  K8:  { sv: 'Gurka/Zucchini',  en: 'Cucumber/Zucchini' },
  K9:  { sv: 'Bönor',           en: 'Bean' },
  K10: { sv: 'Sockerärtor',     en: 'Sugar Snap peas' },
  K11: { sv: 'Bönor',           en: 'Bean' },
};

// ─── PLANT DESCRIPTIONS (placeholder - to be filled in) ────────────────────────
const PLANT_INFO = {
  // Tomato: { sv: 'Lorem ipsum...', en: 'Lorem ipsum...' },
  // Add descriptions here for each unique plant
};

// ─── PIN POSITIONS (percent of image) ──────────────────────────────────────────
const POSITIONS = {
  R1:{x:33.80,y:6.63}, R2:{x:73.36,y:6.29}, R3:{x:46.71,y:12.73}, R4:{x:57.52,y:13.16},
  R5:{x:46.53,y:20.26}, R6:{x:57.53,y:17.63}, R7:{x:46.53,y:26.01}, R8:{x:57.52,y:21.98},
  R9:{x:46.71,y:32.63}, R10:{x:57.53,y:26.33}, R11:{x:46.71,y:36.98}, R12:{x:57.53,y:32.90},
  R13:{x:47.24,y:47.73}, R14:{x:57.52,y:37.25}, R15:{x:57.53,y:44.08}, R16:{x:57.53,y:44.08},
  R17:{x:47.24,y:56.44}, R18:{x:57.52,y:48.43}, R19:{x:82.31,y:52.83}, R20:{x:57.53,y:52.79},
  R21:{x:57.70,y:62.84}, R22:{x:74.54,y:74.35}, R23:{x:74.55,y:78.70},
  F1:{x:47.07,y:6.55}, F2:{x:59.84,y:6.56}, F3:{x:46.50,y:16.51}, F4:{x:57.50,y:29.63},
  F5:{x:47.04,y:40.81}, F6:{x:57.50,y:56.84}, F7:{x:46.86,y:63.07}, F8:{x:79.66,y:59.09},
  T1:{x:21.10,y:11.18}, T2:{x:84.04,y:9.78}, T3:{x:21.10,y:23.44}, T4:{x:83.87,y:22.26},
  T5:{x:20.74,y:35.81}, T6:{x:84.57,y:35.16}, T7:{x:20.57,y:47.85}, T8:{x:86.88,y:47.20},
  T9:{x:21.10,y:58.60},
  K1:{x:80.99,y:6.01}, K2:{x:79.39,y:15.58}, K3:{x:79.21,y:18.70}, K4:{x:63.79,y:20.09},
  K5:{x:57.40,y:40.63}, K6:{x:47.12,y:44.29}, K7:{x:46.77,y:60.63}, K8:{x:57.58,y:59.45},
  K9:{x:74.96,y:65.79}, K10:{x:75.13,y:67.62}, K11:{x:75.31,y:69.99},
};
POSITIONS.R15 = { x: 57.53, y: 40.81 };

// ─── UI STRINGS (expandable for all languages) ───────────────────────────────
const UI_STRINGS = {
  sv: {
    search: 'Sök växt…',
    noMatches: 'Inga träffar',
    showAll: 'Visa alla',
    empty: '(Tom)',
  },
  en: {
    search: 'Search plant…',
    noMatches: 'No matches',
    showAll: 'Show all',
    empty: '(empty)',
  },
};

// Map images dimensions
const IMG_W = 564, IMG_H = 930;
