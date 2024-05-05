import { Injectable } from '@nestjs/common'

import { InjectModel } from '~/transformers/model.transformer'

import { LovePhotoModel } from './love-photo.model'

@Injectable()
export class LovePhotoService {
  constructor(
    @InjectModel(LovePhotoModel) private readonly lovePhotoModel: MongooseModel<LovePhotoModel>,
  ) {}

  public get model() {
    return this.lovePhotoModel
  }

  

}
