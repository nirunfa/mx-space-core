import { BaseCrudFactory } from '~/transformers/crud-factor.transformer'

import { LovePhotoModel } from './love-photo.model'

import { DEMO_MODE,qiniuConfig } from '~/app.config'
import qiniu from 'qiniu';

import {
  BadRequestException,
  Get,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { AllowAllCorsInterceptor } from '~/common/interceptors/allow-all-cors.interceptor';
import { MongoIdDto } from '~/shared/dto/id.dto';
import { url } from 'inspector';

export class LovePhotoController extends BaseCrudFactory({
  model: LovePhotoModel,
}) {

  @Get('/loves')
  @UseInterceptors(AllowAllCorsInterceptor)
  async love() {
      return this._model.find({
        where: {
          isDelete: false,
        },
        order: {
          id: 'ASC',
        },
      })
  }

  @Get('/loveDetail/:id')
  @UseInterceptors(AllowAllCorsInterceptor)
  async loveDetail(@Param() param: MongoIdDto){
    const { id } = param
    const loveModel = await this._model.findById(id).lean()

    const keyMap = {"marry-me":"love-marry","baby-birthday":"love-baby","marry-day2":"love-weddingDay-2","marry-day3":"love-weddingDay-3"}

    const loveKey = loveModel.key
    let loveDetailMap = loveModel.detailMap
    if(loveDetailMap && loveDetailMap.trim().length > 0 ) loveDetailMap = JSON.parse(loveDetailMap)

    const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
    const config = new qiniu.conf.Config();
    // config.useHttpsDomain = false;
    // config.regionsProvider = qiniu.httpc.Region.fromRegionId('z0');
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    let prefix = "";
    let findPathKey = keyMap[loveKey];
    if(!findPathKey) findPathKey = loveKey;
    prefix+=findPathKey.replace(/-/g,"/")+"/";

    const data : any = [] as any;
    await new Promise((resolve, reject) => {
      let i = 0;
      loveDetailMap.forEach(async element => {
        const maps = element.split(",");
        const title : string = maps[0] as string;
        const mapPrefix = (prefix+maps[1].trim()).trim()+"/";
        const options = {
          limit: 9999,
          prefix:mapPrefix,
        };

        const list : any = await new Promise((resolve, reject) => {
          bucketManager.listPrefix(qiniuConfig.bucket, options,(err, result)=>{
              resolve({err, items:(result.items ?? []).filter(item=>!item.mimeType.includes('object-manager')).map(item=>{
                return qiniuConfig.domain+item.key;
              })});
          });
        }) as any;

        data.push({title,list})

        i++;
        if(i >= loveDetailMap.length) resolve('ok');
      });
    });


    return  data;
  }

}
