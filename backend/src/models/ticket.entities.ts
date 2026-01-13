import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { CustomAsset } from "./customasset.entities";
import { Transaction } from "./transaction.entities";
@Entity('ticket')
export class Ticket{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    opened_by!: User;

    @Column({type : "varchar"})
    name!: string;

    @Column({type: "varchar", nullable: true})
    description!: string;

    @OneToOne(() => Transaction)
    @JoinColumn({ name: "transaction" })
    transaction?: Transaction;

    @Column({ type: "enum", enum: ["open", "closed"], default: "open"})
    status!: "open" | "closed"

    @CreateDateColumn()
    created_at: Date = new Date();
}