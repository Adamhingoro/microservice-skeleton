import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { Users } from './Users';
import { AuthClients } from './AuthClients';

@Table
export class AuthAccessTokens extends Model {

  @Column(DataType.STRING)
  public token: string;

  @ForeignKey(() => AuthClients)
  @Column(DataType.INTEGER)
  clientId: number;

  @BelongsTo(() => AuthClients)
  public client : AuthClients;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => Users)
  public user : Users;

}