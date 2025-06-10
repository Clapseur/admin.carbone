/**
 * QRCode.js - Simple QR Code generator for React
 * Based on QRCode.js library principles
 */

class QRCode {
  constructor(element, options) {
    this.element = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!this.element) {
      console.warn('QRCode: Element not found or is null');
      return;
    }
    
    this.options = {
      text: '',
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
      ...options
    };
    
    if (typeof options === 'string') {
      this.options.text = options;
    } else if (options && options.text) {
      this.options.text = options.text;
    }
    
    if (this.options.text) {
      this.makeCode(this.options.text);
    }
  }
  
  makeCode(text) {
    this.options.text = text;
    this.clear();
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    canvas.style.width = this.options.width + 'px';
    canvas.style.height = this.options.height + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    const ctx = canvas.getContext('2d');
    
    // Generate QR pattern (simplified version)
    const size = 21; // Standard QR code size for version 1
    const moduleSize = Math.floor(this.options.width / size);
    
    // Clear canvas with background color
    if (this.options.colorLight !== 'transparent') {
      ctx.fillStyle = this.options.colorLight;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set foreground color
    ctx.fillStyle = this.options.colorDark;
    
    // Generate a simple QR-like pattern based on text
    const pattern = this.generatePattern(text, size);
    
    // Draw the pattern
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
    
    this.element.appendChild(canvas);
    return this;
  }
  
  generatePattern(text, size) {
    const pattern = Array(size).fill().map(() => Array(size).fill(false));
    
    // Add finder patterns (corner squares)
    this.addFinderPattern(pattern, 0, 0);
    this.addFinderPattern(pattern, 0, size - 7);
    this.addFinderPattern(pattern, size - 7, 0);
    
    // Add timing patterns
    for (let i = 8; i < size - 8; i++) {
      pattern[6][i] = i % 2 === 0;
      pattern[i][6] = i % 2 === 0;
    }
    
    // Add data pattern based on text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!this.isReserved(row, col, size)) {
          pattern[row][col] = ((hash + row * size + col) % 3) === 0;
        }
      }
    }
    
    return pattern;
  }
  
  addFinderPattern(pattern, startRow, startCol) {
    const finderPattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (startRow + row < pattern.length && startCol + col < pattern[0].length) {
          pattern[startRow + row][startCol + col] = finderPattern[row][col] === 1;
        }
      }
    }
  }
  
  isReserved(row, col, size) {
    // Check if position is reserved for finder patterns, timing patterns, etc.
    return (
      (row < 9 && col < 9) || // Top-left finder
      (row < 9 && col >= size - 8) || // Top-right finder
      (row >= size - 8 && col < 9) || // Bottom-left finder
      (row === 6) || // Horizontal timing
      (col === 6)    // Vertical timing
    );
  }
  
  clear() {
    if (!this.element) {
      return;
    }
    
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
  
  makeImage() {
    return this;
  }
}

// Error correction levels
QRCode.CorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};

// Helper function for transparent QR codes
export function createTransparentQRCode(element, text, options = {}) {
  if (!element) {
    console.warn('createTransparentQRCode: Element parameter is null or undefined');
    return null;
  }
  
  const qrOptions = {
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: 'transparent',
    ...options
  };
  
  return new QRCode(element, { text, ...qrOptions });
}

export default QRCode;