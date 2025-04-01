import Dexie, { Table } from 'dexie';

export interface EditInfoTableItem {
  id: string;
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

    this.version(2).stores({
      editInfo: '&id,filename,createdAt,updateAt',
    });
  }
}

export const db = new DB();
