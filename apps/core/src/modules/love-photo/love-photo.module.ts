import { Module } from '@nestjs/common'

import { LovePhotoController } from './love-photo.controller'
import { LovePhotoService } from './love-photo.service'

@Module({
  controllers: [LovePhotoController],
  providers: [LovePhotoService],
  exports: [LovePhotoService],
})
export class LovePhotoModule {}
