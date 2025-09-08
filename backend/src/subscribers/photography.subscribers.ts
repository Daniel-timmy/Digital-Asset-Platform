import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailGeneric } from "../utils/sendEmail";
import { Photography } from "../entities/photography.entities";
import logger from "../logger/app.logger";

@EventSubscriber()
export class PhotographySubscriber implements EntitySubscriberInterface<Photography>{
    listenTo(): Function | string {
        return Photography
    }

    async afterInsert(event: InsertEvent<Photography>): Promise<void> {
       if (/^\S+@\S+\.\S+$/.test(event.entity.contact)){
            sendEmailGeneric(event.entity.contact, "Photography Session Booking Confirmation", `Thank you for booking a photography session with us! Your booking has been confirmed with reference ID: ${event.entity.id}. We will contact you shortly to discuss the details and schedule your session.`)
               .then(() => logger.info("Photography session confirmation email sent successfully"))
               .catch(error => logger.error("Error sending photography session confirmation email:", error));
       }
    }
}