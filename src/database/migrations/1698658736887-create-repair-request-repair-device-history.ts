import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRepairRequestRepairDeviceHistory1698658736887
  implements MigrationInterface
{
  name = 'createRepairRequestRepairDeviceHistory1698658736887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "repair_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
    `);

    await queryRunner.query(`
        CREATE TABLE "device_assignee_histories"
        (
            "id"          SERIAL PRIMARY KEY,
            "device_id"   INT NOT NULL,
            "user_id"     INT NOT NULL,
            "assigned_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "returned_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "created_at"  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "device_assignee_histories"
            ADD CONSTRAINT "fk_device_histories_device" FOREIGN KEY ("device_id") REFERENCES "devices" ("id") ON DELETE RESTRICT,
            ADD CONSTRAINT "fk_device_histories_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        CREATE TABLE "repair_requests"
        (
            "id"         SERIAL PRIMARY KEY,
            "device_id"  INT NOT NULL,
            "user_id"    INT NOT NULL,
            "reason"     TEXT NOT NULL,
            "note"       TEXT,
            "status"     repair_request_status_enum NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "repair_requests"
            ADD CONSTRAINT "fk_repair_requests_device" FOREIGN KEY ("device_id") REFERENCES "devices" ("id") ON DELETE RESTRICT,
            ADD CONSTRAINT "fk_repair_requests_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        CREATE TABLE "repair_histories"
        (
            "id"             SERIAL PRIMARY KEY,
            "device_id"      INT NOT NULL,
            "requested_by"   INT NOT NULL,
            "repair_date"    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "repair_detail"  TEXT NOT NULL,
            "supplier"       TEXT,
            "created_at"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "repair_histories"
            ADD CONSTRAINT "fk_repair_histories_device" FOREIGN KEY ("device_id") REFERENCES "devices" ("id") ON DELETE RESTRICT,
            ADD CONSTRAINT "fk_repair_histories_user" FOREIGN KEY ("requested_by") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "repair_histories"
            DROP CONSTRAINT IF EXISTS "fk_repair_histories_user",
            DROP CONSTRAINT IF EXISTS "fk_repair_histories_device"
    `);
    await queryRunner.query(`
        ALTER TABLE "repair_requests"
            DROP CONSTRAINT IF EXISTS "fk_repair_request_user",
            DROP CONSTRAINT IF EXISTS "fk_repair_requests_device";
    `);
    await queryRunner.query(`
        ALTER TABLE "device_assignee_histories"
            DROP CONSTRAINT IF EXISTS "fk_devices_user",
            DROP CONSTRAINT IF EXISTS "fk_device_histories_device";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "repair_histories";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "repair_requests";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "device_assignee_histories";
    `);
    await queryRunner.query(`
        DROP TYPE "repair_request_status_enum";
    `);
  }
}
