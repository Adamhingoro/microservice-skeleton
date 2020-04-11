import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType} from 'sequelize-typescript';

@Table
export class User extends Model<User> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @Column(DataType.STRING)
  public email: string;

  @Column(DataType.STRING)
  public passwordHash: string;

  @Column(DataType.STRING)
  public resetHash: string;

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