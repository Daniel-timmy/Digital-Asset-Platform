import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("user_profiles")
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  instagram?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  x?: string; // X (Twitter) handle

  @Column({ type: "varchar", length: 100, nullable: true })
  facebook?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  coverPhoto?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  title?: string;

  @Column({ type: "simple-array", nullable: true })
  interest?: string[];

  @OneToOne(() => User)
  @JoinColumn()
  user?: User;
}
