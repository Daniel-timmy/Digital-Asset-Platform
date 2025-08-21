import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { sendEmailBooking } from "../utils/sendEmail";
import { Photography } from "../entities/photography.entities";

@EventSubscriber()
export class PhotographySubscriber implements EntitySubscriberInterface<Photography>{
    listenTo(): Function | string {
        return Photography
    }

    async afterInsert(event: InsertEvent<Photography>): Promise<void> {
       if (/^\S+@\S+\.\S+$/.test(event.entity.contact)){
            sendEmailBooking(event.entity.contact, "New Photography Booking Created", `A new website booking has been created with ID: ${event.entity.id}.`)
               .then(() => console.log("Email sent successfully"))
               .catch(error => console.error("Error sending email:", error));
       }
    }
}