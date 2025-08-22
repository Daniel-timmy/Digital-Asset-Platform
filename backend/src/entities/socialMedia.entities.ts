import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("social")
export class Social {
        @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    company_name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 255 })
    audience!: string;

    @Column({ type: "varchar", length: 255 })
    contact_email!: string;

    @Column({ type: "varchar", length: 255 })
    preferred_contact_method!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    contact_means!: string;

    @CreateDateColumn()
    created_at: Date = new Date();

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user?: User;   
}