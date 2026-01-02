import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class DoubleDto {
  @Type(() => Number)      // convertit "12" -> 12
  @IsNumber()
  value!: number;
}
