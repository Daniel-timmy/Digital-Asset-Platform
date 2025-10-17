import { CustomAsset } from "../entities/customasset.entities";

export interface IAsset {
    title? : string;
    description? : string;
    file_url?: string;
    thumbnail_url?: string;
    file_type?: string;
    category_id?: string;
    tags_id?: string;
    price?: number;
    status?: string;
    files: any
}

export interface IFitltered {
    results: CustomAsset[]
    total: Number,
    page: Number,
    limit: Number,
    totalPages: Number
}