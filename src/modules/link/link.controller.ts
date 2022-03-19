import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import type mongoose from 'mongoose'
import { LinkQueryDto } from './link.dto'
import { LinkModel, LinkState } from './link.model'
import { LinkService } from './link.service'
import { Auth } from '~/common/decorator/auth.decorator'
import { Paginator } from '~/common/decorator/http.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'
import { IsMaster } from '~/common/decorator/role.decorator'
import { PagerDto } from '~/shared/dto/pager.dto'
import { BaseCrudFactory, BaseCrudModuleType } from '~/utils/crud.util'

const paths = ['links', 'friends']
@Controller(paths)
@ApiName
export class LinkControllerCrud extends BaseCrudFactory({
  model: LinkModel,
}) {
  @Get('/')
  @Paginator
  async gets(
    this: BaseCrudModuleType<LinkModel>,
    @Query() pager: PagerDto,
    @IsMaster() isMaster: boolean,
  ) {
    const { size, page, state } = pager

    return await this._model.paginate(state !== undefined ? { state } : {}, {
      limit: size,
      page,
      sort: { created: -1 },
      select: isMaster ? '' : '-email',
    })
  }

  @Get('/all')
  async getAll(this: BaseCrudModuleType<LinkModel>) {
    // 过滤未通过审核的
    const condition: mongoose.FilterQuery<LinkModel> = {
      state: LinkState.Pass,
    }
    return await this._model.find(condition).sort({ created: -1 }).lean()
  }
}

@Controller(paths)
@ApiName
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('/state')
  @Auth()
  async getLinkCount() {
    return await this.linkService.getCount()
  }

  /** 申请友链 */
  @Post('/audit')
  @HttpCode(204)
  async applyForLink(@Body() body: LinkModel, @Query() query: LinkQueryDto) {
    await this.linkService.applyForLink(body)
    process.nextTick(async () => {
      await this.linkService.sendToMaster(query.author, body)
    })

    return
  }

  @Patch('/audit/:id')
  @Auth()
  @HttpCode(204)
  async approveLink(@Param('id') id: string) {
    const doc = await this.linkService.approveLink(id)

    process.nextTick(async () => {
      if (doc.email) {
        await this.linkService.sendToCandidate(doc)
      }
    })
    return
  }

  @Auth()
  @Get('/health')
  async checkHealth() {
    return this.linkService.checkLinkHealth()
  }
}
