import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent!: Category | null;

  @CreateDateColumn()
  created_at: Date = new Date();
}