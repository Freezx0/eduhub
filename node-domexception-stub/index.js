// Export native DOMException since Node.js >= 18 has it built-in.
module.exports = globalThis.DOMException || global.DOMException;
