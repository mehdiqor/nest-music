import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Director,
  DirectorSchema,
} from 'src/schemas/movie.schema';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { editImageName } from 'src/utils';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async () => ({
        dest: join(
          __dirname,
          '..',
          '..',
          '..',
          'uploads',
          'films',
        ),
        limits: { fileSize: 5000000 },
        fileFilter: (req, file, cb) => {
          if (
            !file.originalname.match(
              /\.(jpeg|png|gif|tiff|jpg|webp)$/,
            )
          ) {
            return cb(
              new Error('Only images are allowed!'),
              false,
            );
          }
          cb(null, true);
        },
        storage: diskStorage({
          destination: join(
            __dirname,
            '..',
            '..',
            '..',
            'uploads',
            'films',
          ),
          filename: editImageName,
        }),
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Director.name,
        schema: DirectorSchema,
      },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
