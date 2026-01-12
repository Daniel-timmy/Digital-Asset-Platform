import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { CustomAsset } from "../entities/customasset.entities";
import logger from "../logger/app.logger";
import rabbitMq from "../queue/rabbitMq";
import { EMAIL_QUEUE } from "../config/env";

@EventSubscriber()
export class CustomAssetSubscriber implements EntitySubscriberInterface<CustomAsset> {
    listenTo() {
        return CustomAsset;
    }

    async afterInsert(event: InsertEvent<CustomAsset>) {
        console.log("New CustomAsset inserted with id:", event.entity.user.email);
        const content = Buffer.from(JSON.stringify({
            to: event.entity.user.email,
            subject: "Custom Asset Request Confirmation",
            text: `Thank you for submitting your custom asset request! Your request has been registered with reference ID: ${event.entity.id}.\n\nOur design team will carefully review your requirements and begin working on your custom asset. We'll keep you updated on the progress and reach out if we need any additional information.\n\nThank you for choosing our custom design services!`
        }));
        if (EMAIL_QUEUE) {
            await rabbitMq.publish(EMAIL_QUEUE, content);
        } else {
            logger.error("Email queue not set");
        }
    }

}
