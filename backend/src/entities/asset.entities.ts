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

  @Column({ type: "varchar", length: 255 })
  file_url!: string;

  @Column({ type: "varchar", length: 255 })
  thumbnail_url!: string;

  @Column({ type: "enum", enum: ["image", "vector", "template", "video"], default: 'image' })
  file_type!: "image" | "vector" | "template" | "video";

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category" })
  category!: Category;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({ type: "enum", enum: ["pending", "approved", "rejected"], default: 'pending' })
  status!: "pending" | "approved" | "rejected";

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @ManyToMany(() => Tag)
  @JoinTable({
    name: "asset_tags", // Name of the junction table
    joinColumn: { name: "asset", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag", referencedColumnName: "id" }
  })
  tags!: Tag[];
}