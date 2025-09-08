import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailGeneric } from "../utils/sendEmail";
import { Branding } from "../entities/branding.entities";
import logger from "../logger/app.logger";

@EventSubscriber()
export class BrandingSubscriber implements EntitySubscriberInterface<Branding> {
    listenTo(): Function | string {
        return Branding
    }

    async afterInsert(event: InsertEvent<Branding>): Promise<void> {
        sendEmailGeneric(event.entity.contact_email, "Your Branding Project Request Confirmation", `Thank you for choosing our branding services! Your project request has been successfully received with reference ID: ${event.entity.id}. Our team will review your requirements and get back to you shortly.`)
            .then(() => logger.info("Branding confirmation email sent successfully"))
            .catch(error => logger.error("Error sending branding confirmation email:", error));
    }
}