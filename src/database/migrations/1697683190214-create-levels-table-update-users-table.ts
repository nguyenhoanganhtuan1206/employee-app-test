import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLevelsTableUpdateUsersTable1697683190214
  implements MigrationInterface
{
  name = 'createLevelsTableUpdateUsersTable1697683190214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const levels = ['Junior', 'Middle', 'Senior', 'Expert', 'Intern'];
    await queryRunner.query(
      ` CREATE TABLE "user_levels"
      (
          "id"         SERIAL       NOT NULL PRIMARY KEY,
          "label"      VARCHAR(255) NOT NULL UNIQUE,
          "created_at" TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    );
    await Promise.all(
      levels.map(async (levelLabel) => {
        await queryRunner.query(
          `
              INSERT INTO user_levels (label)
              VALUES ($1)
              ON CONFLICT (label) DO NOTHING
          `,
          [levelLabel],
        );
      }),
    );
    await queryRunner.query(`
        ALTER TABLE users
            ADD COLUMN level_id INT;
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
            ADD CONSTRAINT "fk_user_levels" FOREIGN KEY ("level_id") REFERENCES "user_levels" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_user_levels"
    `);
    await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN IF EXISTS level_id
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
            DROP CONSTRAINT "fk_user_levels"
    `);
    const levels = ['Junior', 'Middle', 'Senior', 'Expert', 'Intern'];
    await Promise.all(
      levels.map(async (lebleLabel) => {
        await queryRunner.query(
          `
              DELETE FROM user_levels
              WHERE name = $1
            `,
          [lebleLabel],
        );
      }),
    );
    await queryRunner.query('DROP TABLE "user_levels"');
  }
}
