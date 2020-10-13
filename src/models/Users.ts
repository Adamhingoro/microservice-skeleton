import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, DataType, Unique, BelongsTo, HasOne, ForeignKey} from 'sequelize-typescript';
import { Profiles } from './Profiles';
import * as bcrypt from "bcryptjs";


@Table
export class Users extends Model<Users> {

  @HasOne(() => Profiles)
  public profile: Profiles;

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number;

  @Unique
  @Column(DataType.STRING)
  public email: string;

  @Unique
  @Column(DataType.STRING)
  public username: string;

  @Column(DataType.BOOLEAN)
  public isSuperAdmin: boolean;

  @Column(DataType.STRING)
  private passwordHash: string;

  @Column(DataType.STRING)
  public resetHash: string;

  @Column(DataType.DATE)
  @CreatedAt
  public createdAt: Date = new Date();

  @Column(DataType.DATE)
  @UpdatedAt
  public updatedAt: Date = new Date();

  @Column(DataType.BOOLEAN)
  public isEnabled: boolean;

  short() {
    return {
      email: this.email
    }
  }

  hashPassword(password : string) {
    this.passwordHash = bcrypt.hashSync(password, 8);
    return this;
  }

  async validatePassword(unencryptedPassword: string) {
    console.log("Unencrypted password " , unencryptedPassword);
    console.log(" password " , this.passwordHash);
    const result = await bcrypt.compareSync(unencryptedPassword, this.passwordHash);

    console.log(" Result " , result);
    return result;
  }
}