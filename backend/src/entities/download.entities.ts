import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { Asset } from "./asset.entities";

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

  @CreateDateColumn()
  downloaded_at: Date = new Date();

  @CreateDateColumn()
  created_at: Date = new Date();
}