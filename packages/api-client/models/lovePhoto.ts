import type { BaseModel } from './base'

export interface LovePhotoModel  extends BaseModel{
  title: string
  descrip?: string
  colors?: string
  time?: string
  key?: string
  hasPhotos?: string
}
