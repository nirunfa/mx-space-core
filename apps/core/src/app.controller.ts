import dayjs from 'dayjs'

import {
  BadRequestException,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common'

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { InjectModel } from '~/transformers/model.transformer'

import PKG from '../package.json'
import { DEMO_MODE,qiniuConfig } from './app.config'
import { HttpCache } from './common/decorators/cache.decorator'
import { HTTPDecorators } from './common/decorators/http.decorator'
import { IpLocation, IpRecord } from './common/decorators/ip.decorator'
import { AllowAllCorsInterceptor } from './common/interceptors/allow-all-cors.interceptor'
import { RedisKeys } from './constants/cache.constant'
import { OptionModel } from './modules/configs/configs.model'
import { CacheService } from './processors/redis/cache.service'
import { getRedisKey } from './utils/redis.util'

import qiniu from 'qiniu';

@ApiController()
export class AppController {
  constructor(
    private readonly cacheService: CacheService,
    @InjectModel(OptionModel)
    private readonly optionModel: MongooseModel<OptionModel>,
  ) {}

  @Get('/uptime')
  @HttpCache.disable
  @HTTPDecorators.Bypass
  async getUptime() {
    const ts = (process.uptime() * 1000) | 0
    return {
      timestamp: ts,
      humanize: dayjs.duration(ts).locale('en').humanize(),
    }
  }

  @UseInterceptors(AllowAllCorsInterceptor)
  @Get(['/', '/info'])
  async appInfo() {
    return {
      name: PKG.name,
      author: PKG.author,
      version: isDev ? 'dev' : `${DEMO_MODE ? 'demo/' : ''}${PKG.version}`,
      homepage: PKG.homepage,
      issues: PKG.issues,
    }
  }

  @Get('/ping')
  @UseInterceptors(AllowAllCorsInterceptor)
  ping(): 'pong' {
    return 'pong'
  }

  @Get('/love')
  @UseInterceptors(AllowAllCorsInterceptor)
  async love() {
    const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
    const config = new qiniu.conf.Config();
    // config.useHttpsDomain = false;
    // config.regionsProvider = qiniu.httpc.Region.fromRegionId('z0');
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    const options = {
      limit: 10,
      prefix: 'love/',
    };

    let nextMarker = '';
    return await new Promise((resolve, reject) => {
      bucketManager.listPrefix(qiniuConfig.bucket, options,(err, result)=>{
          resolve({err, result});
      });
    });
  }
  @Get('/loveDetail')
  @UseInterceptors(AllowAllCorsInterceptor)
  loveDetail(): 'pong' {
    return 'pong'
  }

  @Get('/experience')
  @UseInterceptors(AllowAllCorsInterceptor)
  async experience() {
    return [
        {'title':'2014年正式参加工作',
        'descrip':'这是毕业后第一份正式工作，这个工作涉及的开发语言包括：JAVA、PHP，用到的框架Thinkphp3.1、Thinkphp3.2、Thinkphp5、Vue2、SSH、SSM等，坚持了差不多四年的增删改查，渐渐发现自己需要动手学习新的东西时时间晚了（因为平时自己太懒了），所以差不多第四年开始准备跳槽了！',
        'time':'2014-04-05'},
        {'title':'2018年第二份工作',
        'descrip':'这是第二份工作，工作内容是培训老师，主要讲前端的东西，虽然这个时候前端的东西很多很杂，但是想着一边学习一边传授自己的理念能更好的吸收，讲解的内容包括必备3件套(HTML+CSS+Javascript)、jquery、Vue、webpack等，但是好景不长，公司的老师一个接一个的离职了，所以我最后一个也离职了',
        'time':'2018-03-06'},
        {
          'title':'2020年第三份工作',
            'descrip':'这次又做回老本行了，在房地产分销公司做房地产相关的网站和小程序以及APP，因为老板懂技术买了其他外包公司的多开PHP源码，所以用的PHP，不过框架用的Laravel+workerman,小程序和APP用的Uniapp开发，本想着一步步完善程序中问题以及优化体验，但是因为疫情房地产行情大跌，公司因为分销拿不到款项所以自己感到危机，于是就跳槽了（捂脸）',
            'time':'2018-03-06'
        },
    ]
  }
  @Get('/experienceDetail')
  @UseInterceptors(AllowAllCorsInterceptor)
  experienceDetail(): 'pong' {
    return 'pong'
  }

  @Post('/like_this')
  @HttpCache.disable
  @HttpCode(204)
  async likeThis(@IpLocation() { ip }: IpRecord) {
    const redis = this.cacheService.getClient()

    const isLikedBefore = await redis.sismember(
      getRedisKey(RedisKeys.LikeSite),
      ip,
    )
    if (isLikedBefore) {
      throw new BadRequestException('一天一次就够啦')
    } else {
      redis.sadd(getRedisKey(RedisKeys.LikeSite), ip)
    }

    await this.optionModel.updateOne(
      {
        name: 'like',
      },
      {
        $inc: {
          value: 1,
        },
      },
      { upsert: true },
    )
  }

  @Get('/like_this')
  @HttpCache.disable
  async getLikeNumber() {
    const doc = await this.optionModel.findOne({ name: 'like' }).lean()
    return doc ? doc.value : 0
  }

  @Get('/clean_catch')
  @HttpCache.disable
  @Auth()
  async cleanCatch() {
    await this.cacheService.cleanCatch()
  }

  @Get('/clean_redis')
  @HttpCache.disable
  @Auth()
  async cleanAllRedisKey() {
    await this.cacheService.cleanAllRedisKey()
  }
}
