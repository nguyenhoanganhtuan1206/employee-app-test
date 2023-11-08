import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableUserFistLogin1698825742467
  implements MigrationInterface
{
  name = 'updateTableUserFistLogin1698825742467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" 
            ADD COLUMN "first_login" BOOLEAN DEFAULT TRUE;
    `);

    await queryRunner.query(`
        UPDATE "users"
        SET "first_login" = FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            DROP COLUMN "first_login";
    `);
  }
}
