import emailjs from "@emailjs/browser";
import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, PUBLIC_KEY } from "../config/env";
import { UserService } from "../services/user.service";

if (!PUBLIC_KEY ) {
  throw new Error("Email service configuration is missing");
}


emailjs.init(PUBLIC_KEY);

async function sendEmail(userId: string) {
  
    if (!EMAIL_SERVICE_ID) {
        throw new Error("Email service ID is not defined");
    }
    if (!EMAIL_TEMPLATE_ID) {
        throw new Error("Email template ID is not defined");
    }
    const userService = new UserService();
    const user = await userService.findOne(userId);
    if (!user) {
        throw new Error("User not found");
    }
    try {
        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          {
            to_email: user.email,
            name: user.name,
            message: ``,
          },
          PUBLIC_KEY
        );
        console.log("SUCCESS!");
        return true;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to send email");
    }
}

export default sendEmail;