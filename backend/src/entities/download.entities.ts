import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { Asset } from "./asset.entities";
import { CustomAsset } from "./customasset.entities";

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

  @ManyToOne(() => CustomAsset)
  @JoinColumn({ name: "custom_asset_id" })
  custom_asset!: CustomAsset;

  @CreateDateColumn()
  downloaded_at: Date = new Date();

  @CreateDateColumn()
  created_at: Date = new Date();
}