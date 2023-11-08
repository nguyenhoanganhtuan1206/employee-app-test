import type Recipient from './recipient.model';

export default class Mail {
  to: Recipient | Recipient[];

  cc: Recipient | Recipient[];

  bcc: Recipient | Recipient[];

  subject: string;

  template: string;

  variables: Map<string, string | number>;
}
