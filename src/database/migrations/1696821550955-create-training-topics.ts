import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingTopic1696821550955 implements MigrationInterface {
  name = 'createTrainingTopic1696821550955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "training_topics"
        (
            "id"         SERIAL PRIMARY KEY,
            "label"      VARCHAR(100),
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "training_topics"');
  }
}
