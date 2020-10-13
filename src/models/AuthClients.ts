import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique} from 'sequelize-typescript';

@Table
export class AuthClients extends Model {

  @Column(DataType.STRING)
  public name: string;

  @Column(DataType.STRING)
  public clientId: string;

  @Column(DataType.STRING)
  public clientSecret: string;

  // this field is for auto-approve if the client is highly trusted
  @Column(DataType.BOOLEAN)
  public isTrusted: number;

}