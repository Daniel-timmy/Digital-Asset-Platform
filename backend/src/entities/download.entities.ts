import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { User } from "./user.entities";
import { Asset } from "./asset.entities";
import { Transaction } from "./transaction.entities";

@Entity("downloads")
export class Download {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: "asset_id" })
  asset!: Asset;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number ;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: "transaction_id" })
  transaction!: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: "creator_id" })
  creator!: User;

  // @ManyToOne(() => CustomAsset)
  // @JoinColumn({ name: "custom_asset_id" })
  // custom_asset!: CustomAsset;

  @CreateDateColumn()
  downloaded_at: Date = new Date();

  @CreateDateColumn()
  created_at: Date = new Date();
}