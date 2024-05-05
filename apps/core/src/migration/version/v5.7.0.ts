import {
  LOVE_PHOTO_COLLECTION_NAME,
} from '~/constants/db.constant'

import { defineMigration } from '../helper'

export default defineMigration('v5.7.0__0', async (db, connection) => {
  try {
    await Promise.all([
      db
        .collection(LOVE_PHOTO_COLLECTION_NAME)
        .updateMany({}, { $unset: { options: 1 } })
    ])

  } catch (err) {
    console.error('v5.7.0 migration failed')
    throw err
  }
})
