import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainings1696822218043 implements MigrationInterface {
  name = 'createTrainings1696822218043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "trainings"
    (
        "id"                   SERIAL       PRIMARY KEY,
        "user_id"              INT          NOT NULL,
        "training_date"        DATE         NOT NULL,
        "duration"             TIME         NOT NULL,
        "topic_id"             INT          NOT NULL,
        "level_id"             INT          NOT NULL,
        "training_title"       VARCHAR(256),
        "training_description" VARCHAR(1024),
        "training_link"        VARCHAR(1024),
        "training_coach"       INT,
        "created_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
        "created_by"           INT          NOT NULL,
        "updated_at"           TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
        "updated_by"           INT          NOT NULL
    )`);
    await queryRunner.query(`
      ALTER TABLE "trainings"
        ADD CONSTRAINT "fk_training_topics" FOREIGN KEY ("topic_id") REFERENCES "training_topics" ("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "trainings"
        ADD CONSTRAINT "fk_training_levels" FOREIGN KEY ("level_id") REFERENCES "training_levels" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainings"
      DROP CONSTRAINT "fk_training_levels"`);
    await queryRunner.query(`ALTER TABLE "trainings"
      DROP CONSTRAINT "fk_training_topics"`);
    await queryRunner.query('DROP TABLE "trainings"');
  }
}
