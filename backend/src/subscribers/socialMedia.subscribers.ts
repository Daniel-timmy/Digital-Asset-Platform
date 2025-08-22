import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailBooking } from "../utils/sendEmail";
import { Social } from "../entities/socialMedia.entities";

@EventSubscriber()
export class SocialMediaSubscriber implements EntitySubscriberInterface<Social>{
    listenTo(): Function | string {
        return Social
    }

    async afterInsert(event: InsertEvent<Social>): Promise<void> {
        sendEmailBooking(event.entity.contact_email, "New Social Booking Created", `A new website booking has been created with ID: ${event.entity.id}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    }
}