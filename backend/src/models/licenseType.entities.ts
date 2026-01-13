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
@Column({ type: 'enum', enum: ['free', 'premium'], default: 'free' })
name!: 'free' | 'premium';

@CreateDateColumn({ type: 'timestamptz' })
createdAt!: Date;

@UpdateDateColumn({ type: 'timestamptz' })
updatedAt!: Date;

@DeleteDateColumn({ type: 'timestamptz', nullable: true })
deletedAt?: Date;
}