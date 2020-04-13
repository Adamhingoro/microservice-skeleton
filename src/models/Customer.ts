import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique} from 'sequelize-typescript';

@Table
export class Customer extends Model<Customer> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.STRING)
  public fullName: string;

  @Unique
  @Column(DataType.STRING)
  public email: string;

  @Column(DataType.STRING)
  public address: string;

  @Column(DataType.STRING)
  public city: string;

  @Column(DataType.STRING)
  public country: string;

  @Column(DataType.STRING)
  public state: string;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

  short() {
    return {
      email: this.email
    }
  }
}