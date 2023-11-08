import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDeviceTypeModelTable1698635055625
  implements MigrationInterface
{
  name = 'createDeviceTypeModelTable1698635055625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "device_types"
        (
            "id"         SERIAL PRIMARY KEY,
            "name"       VARCHAR(100) NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        CREATE TABLE "device_models"
        (
            "id"             SERIAL PRIMARY KEY,
            "name"           VARCHAR(100) NOT NULL,
            "type_id"        INT NOT NULL,
            "created_at"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "device_models"
            ADD CONSTRAINT "fk_device_type_models" FOREIGN KEY ("type_id") REFERENCES "device_types" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "device_models"
            DROP CONSTRAINT "fk_device_type_models";
    `);
    await queryRunner.query(`
        DROP TABLE "device_models";
    `);
    await queryRunner.query(`
        DROP TABLE "device_types";
    `);
  }
}
