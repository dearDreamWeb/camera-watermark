import { fabric } from 'fabric';

/**图片加载 */
export const loadImage = async (url: string): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(url, (img) => {
      if (!img.width) {
        reject('load fail');
        return;
      }
      resolve(img);
    });
  });
};
