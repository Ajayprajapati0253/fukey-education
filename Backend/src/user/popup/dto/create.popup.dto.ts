import { IsNotEmpty, IsString } from "class-validator";

export class MarkPopupSeenDto {
  @IsString()
  @IsNotEmpty()
  popup_id: string;
}