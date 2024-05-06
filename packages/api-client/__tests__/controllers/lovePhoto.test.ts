import camelcaseKeys from 'camelcase-keys'

import { mockRequestInstance } from '~/__tests__/helpers/instance'
import { mockResponse } from '~/__tests__/helpers/response'
import { LovePhotoController } from '~/controllers'

describe('test LovePhoto client', () => {
  const client = mockRequestInstance(LovePhotoController)

  test('GET /lovePhotos/all', async () => {
    const mocked = mockResponse('/lovePhotos/all', {
      data: [
        { _id: "6635ef274782196cfc508e44", "title": "相识相爱的开始", "descrip": "从5月份我们加微信好友，聊天到相互了解到确认恋爱关系，这是我们在一起恋爱的年份；此刻应该播放\"告别气球\"了！", "colors": "#fff,blue,pink", "key": "love-start", "hasPhotos": false, created: new Date("2024-05-04T15:30:00Z") },

      ],
    })
    console.log(client.lovePhoto)
    const data = await client.lovePhoto.getAll()
    expect(data.$raw.data).toEqual(mocked)
    expect(data.data).toEqual(mocked.data)
    expect(data.data[0].title).toEqual('相识相爱的开始')
  })

  describe('GET /lovePhotos', () => {
    it('should get without page and size', async () => {
      const mocked = mockResponse('/lovePhotos', {
        data: [
          { _id: "6635ef274782196cfc508e44", "title": "相识相爱的开始", "descrip": "从5月份我们加微信好友，聊天到相互了解到确认恋爱关系，这是我们在一起恋爱的年份；此刻应该播放\"告别气球\"了！", "colors": "#fff,blue,pink", "key": "love-start", "hasPhotos": false, created: new Date("2024-05-04T15:30:00Z") },

        ],
        pagination: {
          total: 1,
          current_page: 1,
          total_page: 1,
          size: 10,
          has_next_page: true,
          has_prev_page: false,
        },
      })

      const data = await client.lovePhoto.getAllPaginated()
      expect(data.$raw.data).toEqual(mocked)
      expect(data.data).toEqual(camelcaseKeys(mocked.data, { deep: true }))
      expect(data.data[0].title).toEqual('相识相爱的开始')
    })

    it('should with page and size', async () => {
      const mocked = await mockResponse('/lovePhotos?size=1&page=1', {
        data: [
          { _id: "6635ef274782196cfc508e44", "title": "相识相爱的开始", "descrip": "从5月份我们加微信好友，聊天到相互了解到确认恋爱关系，这是我们在一起恋爱的年份；此刻应该播放\"告别气球\"了！", "colors": "#fff,blue,pink", "key": "love-start", "hasPhotos": false, created: new Date("2024-05-04T15:30:00Z") },

        ],
        pagination: {
          total: 1,
          current_page: 1,
          total_page: 1,
          size: 1,
          has_next_page: true,
          has_prev_page: false,
        },
      })

      const data = await client.lovePhoto.getAllPaginated(1, 1)
      expect(data.$raw.data).toEqual(mocked)
    })
  })

  test('GET /lovePhotos/:id', async () => {
    const mocked = mockResponse('/says/6635ef274782196cfc508e44', { _id: "6635ef274782196cfc508e44", "title": "相识相爱的开始", "descrip": "从5月份我们加微信好友，聊天到相互了解到确认恋爱关系，这是我们在一起恋爱的年份；此刻应该播放\"告别气球\"了！", "colors": "#fff,blue,pink", "key": "love-start", "hasPhotos": false, created: new Date("2024-05-04T15:30:00Z") }
    )
    const data = await client.lovePhoto.getById('6635ef274782196cfc508e44')
    expect(data.$raw.data).toEqual(mocked)
    expect(data.id).toEqual('6635ef274782196cfc508e44')
  })
})
