import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';

@Table
export class OrderHistory extends Model<OrderHistory> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.INTEGER)
  public orderId: number;

  @Column(DataType.STRING)
  public log: string;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

}