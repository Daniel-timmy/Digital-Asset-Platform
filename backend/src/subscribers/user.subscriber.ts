import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import sendEmail from "../utils/sendEmail";
import { User } from "../entities/user.entities"

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User>{
    listenTo() {
        return User
    }

    async afterInsert(event: InsertEvent<User>): Promise<any> {
        sendEmail(event.entity.id, "Welcome to Baselinks", `A new custom asset has been created with ID: ${event.entity.id}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    }

}