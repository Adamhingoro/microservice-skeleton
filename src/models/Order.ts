import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';
import { OrderItem } from './OrderItem';

@Table
export class Order extends Model<Order> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.INTEGER)
  public customerId: number;

  @Column(DataType.INTEGER)
  public restaurantId: number;

  @Column(DataType.INTEGER)
  public subtotal: number;

  @Column(DataType.INTEGER)
  public status: number;
  // this status will be a ENUM for now in the future we will make a database for it

  @Column(DataType.INTEGER)
  public total: number;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

  CalculateTotals = async () => {
    this.total = await OrderItem.sum('total', { where: { orderId: this.id } }); // 50
    console.log("The Order Totals are " , this.total , " for id " , this.id);
    this.save();
  }
}