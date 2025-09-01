import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { CustomAsset } from "./customasset.entities";

@Entity('ticket')
export class Ticket{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    opened_by!: User;

    @Column({type : "varchar"})
    name!: string;

    @Column({type: "varchar"})
    description!: string;

    @OneToOne(() => CustomAsset)
    @JoinColumn({ name: "custom_asset" })
    custom_asset?: CustomAsset;

    @Column({ type: "enum", enum: ["open", "closed"], default: "open"})
    status!: "open" | "closed"

    @CreateDateColumn()
    created_at: Date = new Date();
}