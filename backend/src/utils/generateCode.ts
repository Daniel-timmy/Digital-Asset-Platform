import logger from "../logger/app.logger";

function generateVerificationCode(): string {
    try {
        logger.info(`Generating 6-character verification code`);
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        logger.info(`Successfully generated verification code: ${code}`);
        return code;
    } catch (error) {
        logger.error(`Error generating verification code: ${error}`);
        throw new Error("Failed to generate verification code");
    }
}

export default generateVerificationCode;
