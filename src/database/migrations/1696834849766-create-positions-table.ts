import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePositionsTable1696834849766 implements MigrationInterface {
  name = 'createPositionsTable1696834849766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "positions"
            (
                "id"         SERIAL            NOT NULL PRIMARY KEY,
                "name"       VARCHAR(255)      NOT NULL UNIQUE,
                "created_at" TIMESTAMP         NOT NULL    DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP         NOT NULL    DEFAULT CURRENT_TIMESTAMP 
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "positions"');
  }
}
