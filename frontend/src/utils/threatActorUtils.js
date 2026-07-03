/** Known messy name variants → canonical display label */
const DISPLAY_ALIASES = {
  'the gentlemen': 'The Gentlemen',
  'cmdorganization': 'CMD',
  'cmd': 'CMD',
  '3am': '3AM',
  'auditteam': 'Audit Team',
  'audit team': 'Audit Team',
  'braincipher': 'Brain Cipher',
  'brain cipher': 'Brain Cipher',
  'ransomhouse': 'RansomHouse',
  'shinyhunters': 'ShinyHunters',
  'play (playcrypt)': 'Play',
  'play': 'Play',
  'eraleign (apt73)': 'Apt73',
  'eraleign': 'Apt73',
  'apt73': 'Apt73',
  'nova': 'Nova',
  'redact': 'REDACT',
};

const ARTICLES = new Set(['the', 'a', 'an']);

export function normalizeThreatActorName(name) {
  if (!name) return '';
  let s = name.trim().replace(/\s+/g, ' ');
  const lower = s.toLowerCase();

  if (DISPLAY_ALIASES[lower]) return DISPLAY_ALIASES[lower];

  const paren = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    const inner = paren[2].trim();
    const innerLower = inner.toLowerCase();
    if (DISPLAY_ALIASES[innerLower]) return DISPLAY_ALIASES[innerLower];
    if (/apt\d+/i.test(inner)) return inner.charAt(0).toUpperCase() + inner.slice(1);
    const outerLower = paren[1].trim().toLowerCase();
    if (DISPLAY_ALIASES[outerLower]) return DISPLAY_ALIASES[outerLower];
    return paren[1].trim();
  }

  return s;
}

function stripForInitials(name) {
  const normalized = normalizeThreatActorName(name);
  return normalized
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitCamelCase(word) {
  return word.split(/(?=[A-Z])/).filter(Boolean);
}

function singleWordInitials(word) {
  if (!word) return '?';

  const upper = word.toUpperCase();
  if (word.length <= 3 && word === upper) {
    if (/^3AM$/i.test(word)) return '3A';
    return upper.slice(0, 3);
  }

  if (/^3am$/i.test(word)) return '3A';

  if (/\d/.test(word)) {
    const alnum = word.replace(/[^a-zA-Z0-9]/g, '');
    if (alnum.length <= 3) return alnum.toUpperCase();
    const digitPart = alnum.slice(1).replace(/[^0-9]/g, '');
    return (alnum[0].toUpperCase() + digitPart).slice(0, 3);
  }

  const parts = splitCamelCase(word);
  if (parts.length >= 2) {
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase().slice(0, 3);
  }

  return word[0].toUpperCase();
}

export function getThreatActorInitials(name) {
  const base = stripForInitials(name);
  if (!base) return '?';

  const words = base.split(' ').filter(Boolean);
  if (words.length >= 2) {
    const meaningful = words.filter(w => !ARTICLES.has(w.toLowerCase()));
    const use = meaningful.length >= 2 ? meaningful : words;
    return (use[0][0] + use[1][0]).toUpperCase().slice(0, 3);
  }

  return singleWordInitials(words[0]);
}
