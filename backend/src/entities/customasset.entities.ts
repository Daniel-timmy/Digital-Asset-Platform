import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entities";
import { Asset } from "./asset.entities"

@Entity("customassets")
export class CustomAsset {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar"})
    name!: string;

    @Column({ type: "varchar"})
    description!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Asset)
    @JoinColumn({ name: "asset_id" })
    asset!: Asset;

    @Column({ type: "enum", enum: ["open", "closed"], default: "open"})
    status!: "open" | "closed";


    @Column({ type: "enum", enum: ["paid", "pending"], default: "pending"})
    payment_status!: "paid" | "pending";

    @CreateDateColumn()
    created_at: Date = new Date();

    @UpdateDateColumn()
    updated_at: Date = new Date();
}

