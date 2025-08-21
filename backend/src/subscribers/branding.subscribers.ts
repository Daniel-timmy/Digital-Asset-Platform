import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailBooking } from "../utils/sendEmail";
import { Branding } from "../entities/branding.entities";

@EventSubscriber()
export class BrandingSubscriber implements EntitySubscriberInterface<Branding> {
    listenTo(): Function | string {
        return Branding
    }

    async afterInsert(event: InsertEvent<Branding>): Promise<void> {
        sendEmailBooking(event.entity.contact_email, "New Branding Booking Created", `A new website booking has been created with ID: ${event.entity.id}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    }
}