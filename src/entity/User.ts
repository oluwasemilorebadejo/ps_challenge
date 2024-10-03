import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { UserRole } from "../enums/User";
import Room from "./Room";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  age!: number;

  @Column()
  email!: string;

  // @Column()
  // mobile!: string;

  @Column()
  password!: string;

  @Column()
  address!: string;

  @Column({ type: "boolean", default: false })
  verified!: boolean;

  @Column({ type: "enum", enum: UserRole })
  role!: UserRole;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLowerCase();
  }

  @ManyToMany(() => Room)
  @JoinTable()
  room!: Room[];
}
