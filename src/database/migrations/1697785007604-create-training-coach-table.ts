import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingCoachTable1697785007604
  implements MigrationInterface
{
  name = 'createTrainingCoachTable1697785007604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "trainings"
            DROP COLUMN "training_coach"
        `);

    await queryRunner.query(`
        CREATE TABLE "training_coaches"
        (
            "id"           SERIAL         PRIMARY KEY,
            "training_id"  INT     NOT NULL,
            "user_id"      INT     NOT NULL,
            "created_at"           TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
            "updated_at"           TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "training_coaches"
            ADD CONSTRAINT "fk_training_coaches_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
        `);
    await queryRunner.query(`
        ALTER TABLE "training_coaches"
            ADD CONSTRAINT "fk_training_coaches_trainings" FOREIGN KEY ("training_id") REFERENCES "trainings" ("id") ON DELETE RESTRICT
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "training_coaches" DROP CONSTRAINT "fk_training_coaches_users"`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_coaches" DROP CONSTRAINT "fk_training_coaches_trainings"`,
    );
    await queryRunner.query('DROP TABLE "training_coaches"');
  }
}
