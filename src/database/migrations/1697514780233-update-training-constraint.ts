import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTrainingConstraint1697514780233
  implements MigrationInterface
{
  name = 'updateTrainingConstraint1697514780233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "trainings"
        ADD CONSTRAINT "fk_trainings_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainings"
      DROP CONSTRAINT "fk_trainings_user"`);
  }
}
