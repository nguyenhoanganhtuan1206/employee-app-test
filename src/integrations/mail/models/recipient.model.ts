export default class Recipient {
  constructor(email: string) {
    this.email = email;
  }

  email: string;

  name?: string;
}
