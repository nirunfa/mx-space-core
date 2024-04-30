import type { IRequestAdapter } from '~/interfaces/adapter'
import type { IController } from '~/interfaces/controller'
import type { IRequestHandler } from '~/interfaces/request'
import type { LovePhotoModel } from '~/models/lovePhotos'
import type { HTTPClient } from '../core'

import { autoBind } from '~/utils/auto-bind'

import { BaseCrudController } from './base'

declare module '../core/client' {
  interface HTTPClient<
    T extends IRequestAdapter = IRequestAdapter,
    ResponseWrapper = unknown,
  > {
    lovePhoto: LovePhotoController<ResponseWrapper>
  }
}

export class LovePhotoController<ResponseWrapper>
  extends BaseCrudController<LovePhotoModel, ResponseWrapper>
  implements IController
{
  base = 'love-photos'
  name = 'love-photos'

  constructor(protected client: HTTPClient) {
    super(client)
    autoBind(this)
  }

  public get proxy(): IRequestHandler<ResponseWrapper> {
    return this.client.proxy(this.base)
  }

  /**
   * 获取随机一条
   */
  getRandom() {
    return this.proxy.random.get<{ data: LovePhotoModel | null }>()
  }
}
