import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import Transaction from "./Transaction";
import User from "./User";

@Entity()
export default class PaystackAuthorization extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({})
  authorizationCode!: string;

  @Column({})
  cardType!: string;

  @Column({ type: "bigint" })
  last4!: number;

  @Column({})
  expMonth!: string;

  @Column({})
  expYear!: string;

  @Column({ type: "bigint" })
  bin!: number;

  @Column({})
  bank!: string;

  @Column({})
  channel!: string;

  @Column({})
  signature!: string;

  @Column({ type: "boolean" })
  reusable!: boolean;

  @Column({ type: "varchar" })
  countryCode!: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @OneToOne(() => Transaction)
  @JoinColumn()
  transaction!: Transaction;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;
}
