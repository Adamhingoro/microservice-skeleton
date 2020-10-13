import {Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class BaseModel extends Model {

  @Column(DataType.BOOLEAN)
  public isEnabled: boolean;

}