import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique} from 'sequelize-typescript';
import * as bcrypt from "bcryptjs";
@Table
export class User extends Model<User> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @Column(DataType.INTEGER)
  public type: number;
    // 1. SUPER ADMIN
    // 2. restaurant OWNER

  @Column(DataType.INTEGER)
  public ownership: number;
    // This will be the restaurant ID

  @Unique
  @Column(DataType.STRING)
  public email: string;

  @Column(DataType.STRING)
  public passwordHash: string;

  @Column(DataType.STRING)
  public resetHash: string;

  @Column(DataType.STRING)
  public fullName: string;

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

  hashPassword() {
    this.passwordHash = bcrypt.hashSync(this.passwordHash, 8);
  }

  async checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return await bcrypt.compareSync(unencryptedPassword, this.passwordHash);
  }
}