// worker.js
import { downloadFile, getBlob } from '@/utils';

self.addEventListener('message', async (event) => {
  const { imageData } = event.data;
  const response = await fetch(imageData);
  const blob = await response.blob();

  self.postMessage({ blob });
});
