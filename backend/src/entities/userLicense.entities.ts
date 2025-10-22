import {

Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
UpdateDateColumn,
DeleteDateColumn,
Index,
} from 'typeorm';

@Entity({ name: 'license_types' })
export class LicenseType {
@PrimaryGeneratedColumn('uuid')
id!: string;

@Index({ unique: true })
@Column({ type: 'varchar', length: 100 })
name!: string;

@Column({ type: 'text', nullable: true })
description?: string;

// Duration of the license in months
@Column({ type: 'int', default: 12 })
durationMonths!: number;

// Price stored as numeric/decimal; some drivers return string for decimals
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
price?: number | string;

@Column({ type: 'boolean', default: true })
isActive!: boolean;

@CreateDateColumn({ type: 'timestamptz' })
createdAt!: Date;

@UpdateDateColumn({ type: 'timestamptz' })
updatedAt!: Date;

@DeleteDateColumn({ type: 'timestamptz', nullable: true })
deletedAt?: Date;
}