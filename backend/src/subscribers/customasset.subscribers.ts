import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import sendEmail from "../utils/sendEmail";
import { CustomAsset } from "../entities/customasset.entities";

@EventSubscriber()
export class CustomAssetSubscriber implements EntitySubscriberInterface<CustomAsset> {
    listenTo() {
        return CustomAsset;
    }
    
    async afterInsert(event: InsertEvent<CustomAsset>) {
        sendEmail(event.entity.user.id, "New Custom Asset Created", `A new custom asset has been created with ID: ${event.entity.id}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    } 

}
