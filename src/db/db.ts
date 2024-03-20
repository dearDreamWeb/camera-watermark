import Dexie, { Table } from 'dexie';

export interface EditInfoTableItem {
  id?: number;
  exifInfo: any;
  file: File;
  filename: string;
  imgUrl: string;
  createdAt: Date;
  updateAt: Date;
}

export class DB extends Dexie {
  editInfo!: Table<EditInfoTableItem>;

  constructor() {
    super('CameraWatermark');

    this.version(1).stores({
      editInfo: '++id,createdAt,updateAt',
    });
  }
}

export const db = new DB();
