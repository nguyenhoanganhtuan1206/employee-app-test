import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuddyBuddeeTouchpointsTable1698217083166
  implements MigrationInterface
{
  name = 'createBuddyBuddeeTouchpointsTable1698217083166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "buddy_buddee_touchpoints"
        (
            "id"                   SERIAL             PRIMARY KEY,
            "buddy_id"             INT                NOT NULL,
            "buddee_id"            INT                NOT NULL,
            "note"                 CHARACTER VARYING  NOT NULL,
            "visible"              BOOLEAN,
            "deleted"              BOOLEAN                         DEFAULT FALSE,
            "created_at"           TIMESTAMP                       DEFAULT CURRENT_TIMESTAMP,
            "updated_at"           TIMESTAMP                       DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_buddy_buddee_touchpoints_buddy_id"      FOREIGN KEY ("buddy_id")  REFERENCES "users" ("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_buddy_buddee_touchpoints_buddee_id"     FOREIGN KEY ("buddee_id") REFERENCES "users" ("id") ON DELETE RESTRICT
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "buddy_buddee_touchpoints"');
  }
}
