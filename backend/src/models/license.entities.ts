import { Entity, PrimaryGeneratedColumn, Column,JoinColumn, CreateDateColumn, OneToOne } from "typeorm";
import { Asset } from "./asset.entities";
@Entity("licenses")
export class License {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  downloadUrl!: string;

  @OneToOne(() => Asset, (asset) => asset.license, {
    cascade: true,  
    onDelete: "CASCADE"  // Deletes license when asset is deleted
  })
  @JoinColumn({ name: "asset_id",  })
  asset!: Asset;

  @CreateDateColumn()
  created_at: Date = new Date();
}