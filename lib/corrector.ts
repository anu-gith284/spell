import nlp from 'compromise';

// A dictionary of common English spelling mistakes and their corrections
const commonTypos: { [key: string]: string } = {
  "teh": "the",
  "recieve": "receive",
  "adress": "address",
  "seperate": "separate",
  "definately": "definitely",
  "occured": "occurred",
  "untill": "until",
  "beleive": "believe",
  "goverment": "government",
  "relevent": "relevant",
  "accomodate": "accommodate",
  "acheive": "achieve",
  "accross": "across",
  "calender": "calendar",
  "cemetary": "cemetery",
  "commited": "committed",
  "concious": "conscious",
  "copywrite": "copyright",
  "dilema": "dilemma",
  "embarass": "embarrass",
  "enviroment": "environment",
  "existance": "existence",
  "farenheit": "fahrenheit",
  "familliar": "familiar",
  "finaly": "finally",
  "florescent": "fluorescent",
  "foriegn": "foreign",
  "fourty": "forty",
  "foward": "forward",
  "guage": "gauge",
  "happend": "happened",
  "harrass": "harass",
  "honorary": "honorary",
  "humorous": "humorous",
  "imediately": "immediately",
  "incidently": "incidentally",
  "independant": "independent",
  "interupt": "interrupt",
  "knowlege": "knowledge",
  "liason": "liaison",
  "maintance": "maintenance",
  "millenium": "millennium",
  "mischeivous": "mischievous",
  "noticable": "noticeable",
  "occurence": "occurrence",
  "persue": "pursue",
  "possession": "possession",
  "prefered": "preferred",
  "publically": "publicly",
  "realy": "really",
  "religous": "religious",
  "rememberance": "remembrance",
  "sentance": "sentence",
  "tommorow": "tomorrow",
  "truely": "truly",
  "unforseen": "unforeseen",
  "unfortunatly": "unfortunately",
  "wich": "which",
  "wether": "whether",
  "alot": "a lot",
  "arguement": "argument",
  "basicly": "basically",
  "begining": "beginning",
  "buisness": "business",
  "comming": "coming",
  "curiousity": "curiosity",
  "dissapoint": "disappoint",
  "freind": "friend",
  "gaurantee": "guarantee",
  "hieght": "height",
  "immediatly": "immediately",
  "loose": "lose",
  "paralell": "parallel",
  "weird": "weird",
  "avilble": "available",
  "availble": "available",
  "avialable": "available",
  "offic": "office",
  "offise": "office",
  "nothigi": "nothing",
  "gaveing": "giving",
  "pls": "please",
  "hey": "hey", // mostly for capitalization consistency if needed
};

// Common grammar pattern fixes
const grammarRules = [
  { pattern: /\bi m\b/gi, replacement: "I am" },
  { pattern: /\bi'm\b/gi, replacement: "I am" },
  { pattern: /\b(i)\s+(am|was|will|do|have|can|should|would)\b/gi, replacement: "I $2" },
  { pattern: /\b(me)\s+(and)\s+([a-z]+)\b/gi, replacement: "$3 and I" },
  { pattern: /\b(should|could|would)\s+of\b/gi, replacement: "$1 have" },
  { pattern: /\b(there)\s+(is)\s+([a-z]+s)\b/gi, replacement: "there are $3" },
  { pattern: /\b(he|she|it)\s+(don't)\b/gi, replacement: "$1 doesn't" },
  { pattern: /\b(they|we|you)\s+(doesn't)\b/gi, replacement: "$1 don't" },
  { pattern: /\b(i|you|we|they)\s+(is)\b/gi, replacement: "$1 are" },
  { pattern: /\b(he|she|it)\s+(are)\b/gi, replacement: "$1 is" },
  { pattern: /\b(your)\s+(welcome)\b/gi, replacement: "you're welcome" },
  { pattern: /\b(you're)\s+(car|house|book|name)\b/gi, replacement: "your $2" },
  { pattern: /\b(it's)\s+(color|size|name|purpose)\b/gi, replacement: "its $2" },
  { pattern: /\b(its)\s+(a|an|the|very|really)\b/gi, replacement: "it's $2" },
  { pattern: /\b(their)\s+(is|are|was|were)\b/gi, replacement: "there $2" },
  { pattern: /\b(there)\s+(house|car|family|opinion)\b/gi, replacement: "their $2" },
  { pattern: /\b(they're)\s+(going|doing|coming|eating)\b/gi, replacement: "they are $2" },
];

export function correctTextLocally(text: string): string {
  if (!text) return "";

  // 1. Basic cleaning: remove double spaces and trim
  let corrected = text.replace(/\s+/g, ' ').trim();

  // 2. Apply Grammar Rules (Regex based)
  for (const rule of grammarRules) {
    corrected = corrected.replace(rule.pattern, rule.replacement);
  }

  // 3. Use Compromise for NLP-based corrections
  const doc = nlp(corrected);

  // Fix some basic grammar with compromise
  doc.contractions().expand();
  
  corrected = doc.text();

  // 4. Manual Typos Lookup
  const words = corrected.split(/(\s+|[.,!?;:])/);
  const fixedWords = words.map((word, index) => {
    if (!word || /^\s+$/.test(word) || /^[.,!?;:]+$/.test(word)) return word;
    
    const cleanWord = word.toLowerCase();
    
    if (commonTypos[cleanWord]) {
      // Preserve capitalization if it was already capitalized (like at start of sentence)
      const isCapitalized = word[0] === word[0].toUpperCase();
      let replacement = commonTypos[cleanWord];
      if (isCapitalized) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    }
    return word;
  });

  corrected = fixedWords.join('');

  // 5. Final Polish
  
  // Ensure the very first letter is capitalized
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  
  // Fix "a" vs "an"
  corrected = corrected.replace(/\ba\s+([aeiou])/gi, (match, p1) => {
    return match.startsWith('A') ? 'An ' + p1 : 'an ' + p1;
  });
  corrected = corrected.replace(/\ban\s+([^aeiou])/gi, (match, p1) => {
    return match.startsWith('An') ? 'A ' + p1 : 'a ' + p1;
  });

  // Fix capitalization after punctuation
  corrected = corrected.replace(/([.!?])\s+([a-z])/g, (match, p1, p2) => {
    return p1 + ' ' + p2.toUpperCase();
  });

  // Fix standalone "i"
  corrected = corrected.replace(/\bi\b/g, 'I');

  // Ensure sentence ends with punctuation if missing
  if (corrected.length > 0 && !/[.!?]$/.test(corrected)) {
    corrected += '.';
  }

  return corrected;
}
