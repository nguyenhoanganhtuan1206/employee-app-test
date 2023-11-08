import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDeviceTable1698658579090 implements MigrationInterface {
  name = 'createDeviceTable1698658579090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "device_status_enum" AS ENUM('ASSIGNED', 'AVAILABLE');
    `);
    await queryRunner.query(`
        CREATE TABLE "devices"
        (
            "id"              SERIAL PRIMARY KEY,
            "model_id"        INT NOT NULL,
            "type_id"         INT NOT NULL,
            "serial_number"   VARCHAR(100) NOT NULL,
            "detail"          TEXT NOT NULL,
            "note"            TEXT,
            "user_id"         INT,
            "status"          device_status_enum NOT NULL,
            "created_at"      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ADD CONSTRAINT "fk_devices_device_model" FOREIGN KEY ("model_id") REFERENCES "device_models" ("id") ON DELETE RESTRICT
      `);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ADD CONSTRAINT "fk_devices_device_type" FOREIGN KEY ("type_id") REFERENCES "device_types" ("id") ON DELETE RESTRICT
      `);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ADD CONSTRAINT "fk_devices_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "devices"
      DROP CONSTRAINT IF EXISTS "fk_devices_user";
    `);
    await queryRunner.query(`
      ALTER TABLE "devices"
      DROP CONSTRAINT IF EXISTS "fk_devices_device_type";
    `);
    await queryRunner.query(`
      ALTER TABLE "devices"
      DROP CONSTRAINT IF EXISTS "fk_devices_device_model";
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "devices";
    `);
    await queryRunner.query(`
        DROP TYPE "device_status_enum";
    `);
  }
}
