import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { AuthClients } from './AuthClients';
import { Users } from './Users';


@Table
export class AuthRefreshTokens extends Model {

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