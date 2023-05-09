import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27027/nestdb', {
      connectionFactory: (connection) => {
        connection.on("connect", () => {
          console.log(
            'Mongoose connect successfully!',
          );
        });
        connection.on('disconnected', () => {
          console.log(
            'Mongoose disconnected',
          );
        });
        connection.on('error', (err) => {
          console.log(
            'Mongoose connection error:',
            err,
          );
        });
        return connection;
      },
    }),
    MusicModule,
  ],
})
export class AppModule {}
