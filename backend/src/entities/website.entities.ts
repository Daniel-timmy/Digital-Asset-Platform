import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("website")
export class Website {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    url!: string;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 255 })
    company_name!: string;

    @Column({ type: "varchar", length: 255 })
    industry!: string;

    @Column({ type: "varchar", length: 255 })
    contact_email!: string;

    @CreateDateColumn()
    created_at: Date = new Date();

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user!: User;
}