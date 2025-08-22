class CustomAssetError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'CustomAssetError';
    }
}

export default CustomAssetError;