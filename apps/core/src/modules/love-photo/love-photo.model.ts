import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, IsUrl, isURL } from 'class-validator'

import { modelOptions, prop } from '@typegoose/typegoose'

import { BaseModel } from '~/shared/model/base.model'


@modelOptions({
  options: {
    customName: 'love_photo',
  },
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

  @prop({  })
  @IsString()
  @IsOptional()
  timePrefix: string

  @prop({ required: true })
  @IsString()
  @IsOptional()
  time: Date

  @prop({  })
  @IsString()
  @IsOptional()
  timeSuffix: string

  @prop({ required: true })
  @IsString()
  @IsOptional()
  key: string

  @prop()
  @IsBoolean()
  @IsOptional()
  hasPhotos: boolean

  @prop({ })
  @IsString()
  @IsOptional()
  music: string

  @prop({ })
  @IsString()
  @IsOptional()
  detailMap: string

}
