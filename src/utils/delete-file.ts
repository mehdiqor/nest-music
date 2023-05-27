import * as fs from 'fs';
import { join } from 'path';

export function deleteFileInPublic(fileAddress: string) {
  if (fileAddress) {
    const filePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      'musics',
      fileAddress,
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export function deleteImageInPublic(imageAddress: string) {
  if (imageAddress) {
    const filePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      'films',
      imageAddress,
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
