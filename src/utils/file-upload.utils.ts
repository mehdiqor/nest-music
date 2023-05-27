import { join, extname } from 'path';

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const name = join(
    req.body.artistName + '-' + req.body.trackName,
  ).replace(/\s/g, '');

  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth().toString();
  const day = date.getDate().toString();
  const uploadDate = year + month + day;

  callback(null, `${name}-${uploadDate}${fileExtName}`);
};

export const editImageName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const name = join(
    req.body.directorName + '-' + req.body.title,
  ).replace(/\s/g, '');

  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth().toString();
  const day = date.getDate().toString();
  const uploadDate = year + month + day;

  callback(null, `${name}-${uploadDate}${fileExtName}`);
};
