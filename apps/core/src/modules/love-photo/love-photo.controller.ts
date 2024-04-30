import { sample } from 'lodash'

import { Get } from '@nestjs/common'

import { BaseCrudFactory } from '~/transformers/crud-factor.transformer'

import { LovePhotoModel } from './love-photo.model'

export class LovePhotoController extends BaseCrudFactory({ model: LovePhotoModel }) {
  @Get('/random')
  async getRandomOne() {
    const res = await this.model.find({}).lean()
    if (!res.length) {
      return { data: null }
    }
    return { data: sample(res) }
  }
}
