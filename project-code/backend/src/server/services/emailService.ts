import SendGrid from '@sendgrid/mail';
import { config } from "@config/config";
import { Service } from 'typedi';

export interface IEmailService {
    sendEmail(recipient: string, subject: string, htmlContent: string): Promise<boolean>;
}

@Service()
export default class EmailService implements IEmailService {

    /**
     * Creates a new email service.
     */
    constructor() {
        SendGrid.setApiKey(config.sendGridApiKey);
    }

    /**
     * Sends an email.
     * @param recipient The recipient of the email.
     * @param subject The subject of the email.
     * @param htmlContent The HTML content of the email.
     * @returns Promise that resolves with whether the email was sent.
     */
    sendEmail(recipient: string, subject: string, htmlContent: string): Promise<boolean> {
        return new Promise(res => {
            SendGrid.send({
                to: recipient,
                from: {
                    email: config.emailAddress,
                    name: 'CS3099 Journal 15'
                },
                subject,
                html: htmlContent
            }).then(d => res(true))
            .catch(e => res(false));
        });
    }
}