import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailGeneric } from "../utils/sendEmail";
import { Website } from "../entities/website.entities";

@EventSubscriber()
export class WebsitesiteSubscriber implements EntitySubscriberInterface<Website>{
    listenTo(): Function | string {
        return Website
    }

    async afterInsert(event: InsertEvent<Website>):  Promise<void> {
        sendEmailGeneric(event.entity.contact_email, "New Website Booking Created", `A new website booking has been created with ID: ${event.entity.id}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    }
}