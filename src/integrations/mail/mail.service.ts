import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { type Mail, Recipient } from './models';

@Injectable()
export default class MailService {
  constructor(private readonly mailerService: MailerService) {}

  send(mail: Mail) {
    const {
      subject,
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      template,
      variables,
    } = mail;

    const to = this.getEmails(toRecipients);
    const cc = this.getEmails(ccRecipients);
    const bcc = this.getEmails(bccRecipients);

    // Send mail
    this.mailerService
      .sendMail({
        to,
        cc,
        bcc,
        subject,
        template,
        context: Object.fromEntries(variables),
      })
      .then(() => Logger.log('Mail is sent'))
      .catch((error) => Logger.error('Send mail error', error));
  }

  private getEmails(
    recipients?: Recipient | Recipient[],
  ): string | string[] | undefined {
    if (!recipients) {
      return undefined;
    }

    return recipients instanceof Recipient
      ? recipients.email
      : recipients.map((recipient: Recipient) => recipient.email);
  }
}
