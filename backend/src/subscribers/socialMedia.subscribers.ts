import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailGeneric } from "../utils/sendEmail";
import { Social } from "../entities/socialMedia.entities";
import logger from "../logger/app.logger";

@EventSubscriber()
export class SocialMediaSubscriber implements EntitySubscriberInterface<Social>{
    listenTo(): Function | string {
        return Social
    }

    async afterInsert(event: InsertEvent<Social>): Promise<void> {
        sendEmailGeneric(event.entity.contact_email, "Social Media Management Service Confirmation", `Thank you for choosing our social media management services! Your service request has been registered with reference ID: ${event.entity.id}. Our social media team will analyze your requirements and reach out to discuss your strategy.`)
            .then(() => logger.info("Social media service confirmation email sent successfully"))
            .catch(error => logger.error("Error sending social media service confirmation email:", error));
    }
}