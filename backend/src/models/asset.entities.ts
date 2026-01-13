import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { Category } from "./category.entities";
import { Tag } from "./tag.entities";

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  file_url!: string;

  @Column({ type: "varchar", length: 255 })
  thumbnail_url!: string;

  @Column({ type: "enum", enum: ["image", "vector", "template", "video"], default: 'image' })
  file_type!: "image" | "vector" | "template" | "video";

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category" })
  category!: Category;

  @Column({ type: "int", default: 0 })
  size!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "enum", enum: ["pending", "approved", "rejected", "deleted"], default: 'pending' })
  status!: "pending" | "approved" | "rejected" | "deleted";

  @Column({ type: "enum", enum: ["free", "premium"], default: 'premium' })
  license!: "free" | "premium";

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;

  @Column({ type: "date", nullable: true })
  deleted_at!: Date;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: "asset_tags",
    joinColumn: { name: "asset", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag", referencedColumnName: "id" }
  })
  tags!: Tag[];
}