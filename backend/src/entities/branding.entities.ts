import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";

@Entity("branding")
export class Branding {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    brand_name!: string;
    
    @Column("simple-array")
    colors!: string[];
    
    @Column({ type: "text" })
    description!: string;

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