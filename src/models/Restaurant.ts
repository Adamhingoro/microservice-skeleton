import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';

@Table
export class Restaurant extends Model<Restaurant> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.STRING)
  public name: string;

  @Column(DataType.STRING)
  public address: string;

  @Column(DataType.STRING)
  public city: string;

  @Column(DataType.STRING)
  public country: string;

  @Column(DataType.STRING)
  public state: string;

  @Column(DataType.STRING)
  public cuisine: string;

  @Column(DataType.STRING)
  public imageURL: string;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

}