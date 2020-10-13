import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { Users } from './Users';
import { BaseModel } from './BaseModel';

@Table
export class Profiles extends BaseModel {

  @Column(DataType.STRING(32))
  public name: string;

  @Column(DataType.STRING(32))
  public country: string;

  @Column(DataType.STRING(32))
  public state: string;

  @Column(DataType.STRING(32))
  public city: string;

  @Column(DataType.STRING(100))
  public address: string;

  @Column(DataType.STRING(256))
  public image: string;

  @Column(DataType.STRING(32))
  public dateOfBirth: string;

  @Unique
  @Column(DataType.STRING(32))
  public mobileNumber: string;

  @Unique
  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => Users)
  public user : Users;

}