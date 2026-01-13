import { Entity, PrimaryGeneratedColumn,OneToOne, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { User } from "./user.entities";
import { Asset } from "./asset.entities";
import { Transaction } from "./transaction.entities";
import { License } from "./license.entities";

@Entity("downloads")
export class Download {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Asset , { nullable: false})
  @JoinColumn({ name: "asset_id" })
  asset!: Asset;

  @ManyToOne(() => License, { nullable: false})
  @JoinColumn({ name: "license_id" })
  license!: License;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number ;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: "transaction_id" })
  transaction!: Transaction;

  @ManyToOne(() => User, { nullable: false})
  @JoinColumn({ name: "creator_id" })
  creator!: User;

  @CreateDateColumn()
  downloaded_at: Date = new Date();

  @CreateDateColumn()
  created_at: Date = new Date();
}