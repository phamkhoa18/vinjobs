import imageService from './src/services/ImageService.js';
import fs from 'fs';

(async () => {
  try {
    const buffer = Buffer.from('test pdf content');
    const url = await imageService.processAndSaveImage(buffer, { mimetype: 'application/pdf' });
    console.log('Success:', url);
  } catch (err) {
    console.error('Error:', err);
  }
})();
