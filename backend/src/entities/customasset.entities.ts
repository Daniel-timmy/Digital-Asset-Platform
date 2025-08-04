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

    @Column({ type: "enum", enum: ["open", "closed", "cancelled"], default: "open"})
    status!: "open" | "closed" | "cancelled";


    @Column({ type: "enum", enum: ["paid", "pending", "processing"], default: "pending"})
    payment_status!: "paid" | "pending" | "processing";

    // needs a due date
    // needs an amount
    @Column({ type: "decimal", precision: 10, scale: 2, default: 2000 })
    price!: number ;

    @CreateDateColumn()
    created_at: Date = new Date();

    @UpdateDateColumn()
    updated_at: Date = new Date();
}

