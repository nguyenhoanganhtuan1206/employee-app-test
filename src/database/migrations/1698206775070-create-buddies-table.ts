import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuddiesTable1698206775070 implements MigrationInterface {
  name = 'createBuddiesTable1698206775070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "buddies"
        (
            "id"                   SERIAL      PRIMARY KEY,
            "user_id"              INT         NOT NULL,
            "created_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
            "updated_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_buddies_user_id"                 FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "buddies"');
  }
}
