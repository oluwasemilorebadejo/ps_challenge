import {
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
  IsEmpty,
} from "class-validator";

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(1)
  amountPerPerson!: number;

  @IsInt()
  @Min(1)
  maxNumberOfPeople!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  billingDate!: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  amountPerPerson?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxNumberOfPeople?: number;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  billingDate?: number;

  @IsEmpty()
  code?: string;
}
