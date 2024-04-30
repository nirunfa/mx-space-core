import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { modelOptions, prop } from '@typegoose/typegoose'

import { BaseModel } from '~/shared/model/base.model'

@modelOptions({
  options: { customName: 'lovePhoto' },
})
export class LovePhotoModel extends BaseModel {
  @prop({ required: true })
  @IsString()
  title: string

  @prop({ required: true })
  @IsString()
  @IsOptional()
  descrip: string

  @prop()
  @IsString()
  @IsOptional()
  colors: string

  @prop({ required: true })
  @IsString()
  @IsOptional()
  time: string

  @prop({ required: true })
  @IsString()
  @IsOptional()
  key: string

  @prop()
  @IsBoolean()
  @IsOptional()
  hasPhotos: boolean
  
}
