import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';

@Table
export class MenuItem extends Model<MenuItem> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  // HERE ARE THE ESSENTIALS DB PARTS.
  @Column(DataType.STRING)
  public name: string;

  @Column(DataType.STRING)
  public description: string;

  @Column(DataType.INTEGER)
  public menuId: number;

  @Column(DataType.INTEGER)
  public price: number;

  @Column(DataType.STRING)
  public imageURL: string;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

}