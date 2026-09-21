import { PartialType } from '@nestjs/mapped-types';
import { CreateDemoClassDto } from './create-demo-class.dto';

export class UpdateDemoClassDto extends PartialType(CreateDemoClassDto) {}