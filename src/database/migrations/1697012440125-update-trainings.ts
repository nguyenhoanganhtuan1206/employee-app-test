import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTrainings1697012440125 implements MigrationInterface {
  name = 'updateTrainings1697012440125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "trainings"
        ALTER COLUMN "duration" TYPE INT USING 0;
    ALTER TABLE "trainings"
        ALTER COLUMN "duration" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "trainings "
        ALTER COLUMN "duration" TYPE TIME;
    ALTER TABLE "trainings"
        ALTER COLUMN "duration" SET NOT NULL;
    `);
  }
}
