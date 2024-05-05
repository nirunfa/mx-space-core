import { Module } from '@nestjs/common'

import { LovePhotoController } from './love-photo.controller'

@Module({ controllers: [LovePhotoController] })
export class LovePhotoModule {}
