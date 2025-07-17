import dayjs from 'dayjs';
import { db, EditInfoTableItem } from './db';

export const changeIndexDbEvent = new CustomEvent('changeIndexDb');

/**添加editInfo数据 */
export const addDbEditInfo = async (
  list: Array<Omit<EditInfoTableItem, 'createdAt' | 'updateAt'>>
) => {
  const now = dayjs().toDate();
  const ids: string[] = [];
  const newList = list.map((item) => {
    const _id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    ids.push(_id);
    return {
      ...item,
      id: _id,
      createdAt: now,
      updateAt: now,
    };
  });
  await db.editInfo.bulkAdd(newList);
  window.dispatchEvent(changeIndexDbEvent);
  return ids;
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

/**获取批量的数据 */
export const getSomeDbEditInfo = async (ids: string[]) => {
  try {
    const res = (await db.editInfo.bulkGet(ids)).filter(Boolean);
    return (res || []) as EditInfoTableItem[];
  } catch (err) {
    console.error('error', err);
    return [];
  }
};

/** 清空editInfo数据库 */
export const clearDbEditInfo = async () => {
  await db.editInfo.clear();
  window.dispatchEvent(changeIndexDbEvent);
  return true;
};
