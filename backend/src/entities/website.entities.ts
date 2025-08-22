import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("website")
export class Website {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    company_name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 255 })
    industry!: string;

    @Column({ type: "varchar", length: 255 })
    contact_email!: string;

    @Column({ type: "varchar", length: 255 })
    website_type!: string;

    @Column({ type: "varchar", length: 255})
    features!: string;

    @Column({ type: "enum", enum: ['UI/UX', 'website'], default:'website'})
    service!: "UI/UX" | 'website'

    @CreateDateColumn()
    created_at: Date = new Date();

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user?: User;
}