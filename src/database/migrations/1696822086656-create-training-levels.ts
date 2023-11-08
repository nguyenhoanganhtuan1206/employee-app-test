import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingLevels1696822086656 implements MigrationInterface {
  name = 'createTrainingLevels1696822086656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "training_levels"
        (
            "id"         SERIAL PRIMARY KEY,
            "label"      VARCHAR(100),
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "training_levels"');
  }
}
