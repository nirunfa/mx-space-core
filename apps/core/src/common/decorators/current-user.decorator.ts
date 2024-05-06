import { createParamDecorator } from '@nestjs/common'

import { getNestExecutionContextRequest } from '~/transformers/get-req.transformer'
import type { ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getNestExecutionContextRequest(ctx).user
  },
)

export const CurrentUserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const token = getNestExecutionContextRequest(ctx).token

    return token ? token.replace(/[Bb]earer /, '') : ''
  },
)
