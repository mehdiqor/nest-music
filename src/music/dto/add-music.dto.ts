import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MusicGenre } from "src/schemas/music.schema";

export class AddMusicDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  artist: string;
  
  @IsString()
  @IsOptional()
  album?: string;
  
  @IsEnum(MusicGenre)
  @IsNotEmpty()
  genre: MusicGenre
  
  @IsOptional()
  @IsOptional()
  tags?: string[];
}
