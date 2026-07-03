// utils/copticConverter.js

export function convertLegacyToUnicodeCoptic(legacyText) {
  if (!legacyText) return '';
  
  const copticMap = {
    '2': 'ϣ', 'q': 'Ϧ', 'Q': 'Ϧ', '4': 'ϥ', 'h': 'ϩ', 'H': 'Ϩ',
    'g': 'ϫ', 'G': 'Ϫ', 's': 'ϭ', 'S': 'Ϭ', '5': 'ϯ', '3': 'ⲏ',
    '0': 'ⲑ', '0': 'Ⲑ', 'w': 'ⲱ', 'W': 'Ⲱ', 'x': 'ⲭ', 'X': 'Ⲭ',
    'j': 'ⲅ', 'J': 'Ⲅ', '`': '̀',
    'a': 'ⲁ', 'A': 'Ⲁ', 'b': 'ⲃ', 'B': 'Ⲃ', 'e': 'ⲉ', 'E': 'Ⲉ',
    'z': 'Ⲋ', 'Z': 'ⲋ', 'i': 'ⲓ', 'I': 'Ⲓ', 'k': 'ⲕ', 'K': 'Ⲕ',
    'l': 'ⲗ', 'L': 'Ⲗ', 'm': 'ⲙ', 'M': 'Ⲙ', 'n': 'ⲛ', 'N': 'Ⲛ',
    'o': 'ⲟ', 'O': 'Ⲟ', 'p': 'ⲡ', 'P': 'Ⲡ', 'r': 'ⲣ', 'R': 'Ⲣ',
    'c': 'ⲥ', 'C': 'Ⲥ', 't': 'ⲧ', 'T': 'Ⲧ', 'v': 'ⲩ', 'V': 'Ⲩ',
    'y': 'Ⲯ', 'Y': 'Ⲯ', '\\': '', '%': ''
  };

  return legacyText
    .split('')
    .map(char => copticMap[char] || char)
    .join('')
    .replace(/̀([ⲁ-ⲱ])/g, '$1̀'); 
}