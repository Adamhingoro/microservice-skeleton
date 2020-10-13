import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique, Length, BelongsToMany, ForeignKey, BelongsTo} from 'sequelize-typescript';

@Table
export class SmsVerifications extends Model {

  @Column(DataType.BOOLEAN)
  public isVerified: boolean;

  @Unique
  @Column(DataType.STRING)
  public mobileNumber: string;

  @Column(DataType.STRING(6))
  public verificationCode: string;

  @Column(DataType.STRING(128))
  public token: string;

}