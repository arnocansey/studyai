import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  refreshToken: string;
}

export class ExchangeDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  code: string;
}
