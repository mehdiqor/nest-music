import * as path from 'path';

export const editFileName = (
  req,
  file,
  callback,
) => {
  const fileExtName = path.extname(
    file.originalname,
  );
  const name = path.join(
    req.body.artist + '-' + req.body.name,
  );

  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth().toString();
  const day = date.getDate().toString();
  const uploadDate = year + month + day;

  callback(
    null,
    `${name}-${uploadDate}${fileExtName}`,
  );
};
