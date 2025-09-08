import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailGeneric } from "../utils/sendEmail";
import { Website } from "../entities/website.entities";
import logger from "../logger/app.logger";

@EventSubscriber()
export class WebsitesiteSubscriber implements EntitySubscriberInterface<Website>{
    listenTo(): Function | string {
        return Website
    }

    async afterInsert(event: InsertEvent<Website>):  Promise<void> {
        sendEmailGeneric(event.entity.contact_email, "Website Development Project Confirmation", `Thank you for choosing us for your website development needs! Your project has been registered with reference ID: ${event.entity.id}. Our web development team will review your requirements and contact you soon to discuss the next steps.`)
            .then(() => logger.info("Website development confirmation email sent successfully"))
            .catch(error => logger.error("Error sending website development confirmation email:", error));
    }
}