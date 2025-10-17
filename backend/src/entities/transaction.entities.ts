import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { CustomAsset } from "./customasset.entities";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  // @ManyToOne(() => CustomAsset)
  // @JoinColumn({ name: "custom_asset" })
  // custom_asset!: CustomAsset;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "enum", enum: ["pending", "completed", "cancelled", "failed", "processing"], default: "pending" })
  payment_status!: "pending" | "completed" | "failed" | "cancelled" | "processing";

  @CreateDateColumn()
  created_at: Date = new Date();
}