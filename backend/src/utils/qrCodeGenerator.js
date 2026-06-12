const QRCode = require('qrcode');

const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      color: {
        dark: '#1e293b', // Slate 800 for custom premium contrast
        light: '#ffffff'
      },
      width: 400,
      margin: 2
    });
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    throw err;
  }
};

module.exports = generateQRCode;
