import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuddyBuddeePairsTable1698209035739
  implements MigrationInterface
{
  name = 'createBuddyBuddeePairsTable1698209035739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "buddy_buddee_pairs"
        (
            "id"                   SERIAL      PRIMARY KEY,
            "buddy_id"             INT         NOT NULL,
            "buddee_id"            INT         NOT NULL,
            "created_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
            "updated_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_buddy_buddee_pairs_buddy_id"     FOREIGN KEY ("buddy_id")  REFERENCES "users" ("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_buddy_buddee_pairs_buddee_id"    FOREIGN KEY ("buddee_id") REFERENCES "users" ("id") ON DELETE RESTRICT,
            CONSTRAINT "UQ_buddy_buddee_pairs"              UNIQUE ("buddy_id", "buddee_id")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "buddy_buddee_pairs"');
  }
}
