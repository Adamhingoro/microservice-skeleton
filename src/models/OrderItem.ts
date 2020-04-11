import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';

@Table
export class OrderItem extends Model<OrderItem> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.INTEGER)
  public orderId: number;

  @Column(DataType.INTEGER)
  public menuItemId: number;

  @Column(DataType.INTEGER)
  public price: number;
  // this status will be a ENUM for now in the future we will make a database for it

  @Column(DataType.INTEGER)
  public quantity: number;

  @Column(DataType.INTEGER)
  public total: number;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

}