import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class npmPackage {
    @PrimaryGeneratedColumn() id: string;

    @Column('varchar') channelId: string;

    @Column('varchar') name: string;

    @Column('int') latest: string;
}