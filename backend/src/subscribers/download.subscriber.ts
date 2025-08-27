import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Download } from "../entities/download.entities";
import { sendEmailGeneric } from "../utils/sendEmail";

@EventSubscriber()
export class DownloadSubscriber implements EntitySubscriberInterface<Download>{
    listenTo(): Function | string {
        return Download
    }

    async afterInsert(event: InsertEvent<Download>): Promise<void> {
        sendEmailGeneric(event.entity.user.email, "Design Asset download", `Download link for your asset: ${event.entity.asset.file_url}.`)
            .then(() => console.log("Email sent successfully"))
            .catch(error => console.error("Error sending email:", error));
    }
        // console.log(`${event.entity.user.email} ${event.entity.asset.id}`)
}