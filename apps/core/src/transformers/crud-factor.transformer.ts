import pluralize from 'pluralize'

import {
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { PartialType } from '@nestjs/mapped-types'

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { HTTPDecorators, Paginator } from '~/common/decorators/http.decorator'
import { EventScope } from '~/constants/business-event.constant'
import { EventManagerService } from '~/processors/helper/helper.event.service'
import { MongoIdDto } from '~/shared/dto/id.dto'
import { PagerDto } from '~/shared/dto/pager.dto'
import { InjectModel } from '~/transformers/model.transformer'
import type { BaseModel } from '~/shared/model/base.model'
import type { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import type { Type } from '@nestjs/common'


function isCamelCase(str) {
  if (!/^[a-zA-Z][a-z]*$/g.test(str)) {
    return false;
  }
  
  if (str.includes('_') || str.includes(' ')) {
    return false;
  }

  const words = str.split(/[A-Z]/);
  return words.every(word => word.length > 2);
}

export type BaseCrudModuleType<T> = {
  _model: MongooseModel<T>
}

export type ClassType<T> = new (...args: any[]) => T
export function BaseCrudFactory<
  T extends AnyParamConstructor<BaseModel & { id: string }>,
>({ model, classUpper }: { model: T; classUpper?: ClassType<any> }): Type<any> {
  const modelName= model.name;
  const compareModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  let prefix = compareModelName.toLowerCase().replace(/model$/, '')
  //这里修改判断，如果模型名称符合骆驼命名法的法，则使用首字母小写的模型名称作为前缀
  if(!isCamelCase(compareModelName.replace(/Model$/, ''))){
    prefix = compareModelName.replace(/Model$/, '')
  }
  const pluralizeName = pluralize(prefix) as string

  const eventNamePrefix = `${prefix.toUpperCase()}_`

  class PDto extends PartialType(model as any) {}

  class Dto extends model {}

  const Upper = classUpper || class {}

  console.log('pluralizeName:'+pluralizeName);
  @ApiController(pluralizeName)
  class BaseCrud extends Upper {
    constructor(
      @InjectModel(model) private readonly _model: MongooseModel<T>,
      private readonly eventManager: EventManagerService,
    ) {
      super(_model, eventManager)
    }

    public get model() {
      return this._model
    }

    @Get('/:id')
    async get(@Param() param: MongoIdDto) {
      const { id } = param
      return await this._model.findById(id).lean()
    }

    @Get('/')
    @Paginator
    async gets(@Query() pager: PagerDto) {
      const { size, page, select, state, sortBy, sortOrder } = pager
      // @ts-ignore
      return await this._model.paginate(state !== undefined ? { state } : {}, {
        limit: size,
        page,
        sort: sortBy ? { [sortBy]: sortOrder } : { created: -1 },
        select,
      })
    }

    @Get('/all')
    async getAll() {
      return await this._model.find({}).sort({ created: -1 }).lean()
    }

    @Post('/')
    @HTTPDecorators.Idempotence()
    @Auth()
    async create(@Body() body: Dto) {
      return await this._model
        .create({ ...body, created: new Date() })
        .then((res) => {
          this.eventManager.broadcast(
            `${eventNamePrefix}CREATE` as any,
            res.toObject(),
            {
              scope: EventScope.TO_SYSTEM_VISITOR,
            },
          )
          return res
        })
    }

    @Put('/:id')
    @Auth()
    async update(@Body() body: Dto, @Param() param: MongoIdDto) {
      return await this._model
        .findOneAndUpdate(
          { _id: param.id as any },
          {
            ...body,
            modified: new Date(),
          } as any,
          { new: true },
        )
        .lean()
        .then((res) => {
          this.eventManager.broadcast(`${eventNamePrefix}UPDATE` as any, res, {
            scope: EventScope.TO_SYSTEM_VISITOR,
          })
          return res
        })
    }

    @Patch('/:id')
    @Auth()
    @HttpCode(204)
    async patch(@Body() body: PDto, @Param() param: MongoIdDto) {
      // @ts-expect-error
      await this.update(body, param)
      return
    }

    @Delete('/:id')
    @Auth()
    @HttpCode(204)
    async delete(@Param() param: MongoIdDto) {
      await this._model.deleteOne({ _id: param.id as any })

      await this.eventManager.broadcast(
        `${eventNamePrefix}DELETE` as any,
        param.id,
        {
          scope: EventScope.ALL,
        },
      )

      return
    }
  }

  return BaseCrud
}
