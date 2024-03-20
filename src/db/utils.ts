import dayjs from 'dayjs';
import { db, EditInfoTableItem } from './db';

/**添加editInfo数据 */
export const addDbEditInfo = async (
  list: Array<Omit<EditInfoTableItem, 'createdAt' | 'updateAt'>>
) => {
  const now = dayjs().toDate();
  const newList = list.map((item) => ({
    ...item,
    createdAt: now,
    updateAt: now,
  }));
  const num = await db.editInfo.bulkAdd(newList);
  return num;
};

/**获取全部的数据 */
export const getDbEditInfo = async () => {
  try {
    const res = await db.editInfo.orderBy('id').toArray();
    return res || [];
  } catch (err) {
    console.error('error', err);
    return [];
  }
};

/** 清空editInfo数据库 */
export const clearDbEditInfo = async () => {
  await db.editInfo.clear();
  return true;
};
