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
    file: any

}