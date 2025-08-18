import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("photography")
export class Photography {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({type: "varchar"})
  name!: string

  @Column({ type: "enum", enum: ["portrait", "landscape", "wildlife", "macro", "street"], default: "portrait" })
  picture_type!: string;

  @Column({ type: "enum", enum: ["wedding", "event", "commercial", "personal"], default: "personal" })
  event_type!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 255 })
  contact!: string;

  @Column({ type: "date", nullable: false })
  event_date!: Date;

  @CreateDateColumn()
  created_at: Date = new Date();

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User;

}