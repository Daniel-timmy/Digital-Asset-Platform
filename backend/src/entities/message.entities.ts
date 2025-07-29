import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { Ticket } from "./ticket.entities";

@Entity("message")
export class Message{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Ticket)
    @JoinColumn({ name: "ticket" })
    ticket?: Ticket;

    @Column({ type: "varchar"})
    message!: string;

    @CreateDateColumn()
    created_at: Date = new Date();
}