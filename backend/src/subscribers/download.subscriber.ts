import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Download } from "../entities/download.entities";
import { sendEmailGeneric } from "../utils/sendEmail";
import logger from "../logger/app.logger";

@EventSubscriber()
export class DownloadSubscriber implements EntitySubscriberInterface<Download>{
    listenTo(): Function | string {
        return Download
    }

    async afterInsert(event: InsertEvent<Download>): Promise<void> {
        sendEmailGeneric(event.entity.user.email, "Your Design Asset Download Link", `Thank you for downloading from our platform! Here's your secure download link: ${event.entity.asset.file_url}\n\nIf you experience any issues accessing your file, please don't hesitate to contact our support team.`)
            .then(() => logger.info("Download link email sent successfully"))
            .catch(error => logger.error("Error sending download link email:", error));
    }
        // console.log(`${event.entity.user.email} ${event.entity.asset.id}`)
}