export default function Soundex(str) {
    const soundexMapping = {
      a: '0', e: '0', i: '0', o: '0', u: '0', y: '0', 
      b: '1', f: '1', p: '1', v: '1', 
      c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2', 
      d: '3', t: '3', 
      l: '4', 
      m: '5', n: '5', 
      r: '6'
    };
  
    if (!str) return '';
  
    // Convert the string to lowercase
    str = str.toLowerCase();
  
    // Keep the first letter of the string
    let result = str[0].toUpperCase();
  
    // Replace characters with their Soundex digits
    for (let i = 1; i < str.length; i++) {
      if (soundexMapping[str[i]]) {
        if (soundexMapping[str[i]] !== soundexMapping[str[i - 1]]) {
          result += soundexMapping[str[i]];
        }
      }
    }
  
    // Pad with 0s to make the code length exactly 4
    return (result + '0000').slice(0, 4);
  }
  