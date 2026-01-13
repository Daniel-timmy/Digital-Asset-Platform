import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { User } from "../models/user.entities";
import logger from "../logger/app.logger";
import rabbitMq from "../queue/rabbitMq";
import { EMAIL_QUEUE } from "../config/env";


@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User
    }
    async afterInsert(event: InsertEvent<User>): Promise<any> {
        const content = Buffer.from(JSON.stringify({
            to: event.entity.email,
            subject: "Welcome to Brush - Your Creative Journey Begins!",
            text: `Dear ${event.entity.name},\n\nWelcome to Brush! We're excited to have you join our creative community. Your account has been successfully created and you now have access to our full range of digital services including web development, branding, photography, and social media management.\n\nFeel free to explore our platform and reach out if you need any assistance.\n\nBest regards,\nThe Brush Team`
        }));
        if (EMAIL_QUEUE) {
            await rabbitMq.publish(EMAIL_QUEUE, content);
        }
        else {
            logger.error("Email queue not set");
        }
    }

}