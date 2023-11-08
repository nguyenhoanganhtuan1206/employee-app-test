import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCvTable1697016163371 implements MigrationInterface {
  name = 'createCvTable1697016163371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "user_cvs"
        (
          "id"           SERIAL         PRIMARY KEY,
          "user_id"      INT            NOT NULL,
          "cv"           VARCHAR(1024),
          "version"      VARCHAR(50),
          "created_at"   TIMESTAMP                   DEFAULT CURRENT_TIMESTAMP,
          "created_by"   INT            NOT NULL,
          "updated_at"   TIMESTAMP                   DEFAULT CURRENT_TIMESTAMP,
          "updated_by"   INT            NOT NULL
        )`);
    await queryRunner.query(`
      ALTER TABLE "user_cvs"
          ADD CONSTRAINT "fk_user_cvs_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user_cvs"');
    await queryRunner.query(
      `ALTER TABLE "user_cvs" DROP CONSTRAINT "fk_user_cvs_users"`,
    );
  }
}
