import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import User from "./User";

@Entity()
export default class Room extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  code!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "float" })
  amountPerPerson!: number;

  @Column({ type: "int", default: 0 })
  numberOfPeople!: number;

  @Column({ type: "int" })
  maxNumberOfPeople!: number;

  @ManyToOne(() => User)
  @JoinColumn()
  owner!: User;

  // currency
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamptz" })
  joinedAt!: Date;

  // @ManyToMany(() => User)
  // @JoinTable()
  // user!: User[];
}
