import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import sendEmail from "../utils/sendEmail";
import { CustomAsset } from "../entities/customasset.entities";

@EventSubscriber()
export class CustomAssetSubscriber implements EntitySubscriberInterface<CustomAsset> {
    listenTo() {
        return CustomAsset;
    }
    
    async afterInsert(event: InsertEvent<CustomAsset>) {
        console.log(`CustomAsset inserted: `, event.entity);
        sendEmail(event.entity.user.id)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));

    } 
}

