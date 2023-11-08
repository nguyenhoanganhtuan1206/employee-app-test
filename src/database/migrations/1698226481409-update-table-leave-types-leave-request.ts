import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableLeaveTypesLeaveRequest1698226481409
  implements MigrationInterface
{
  name = 'updateTableLeaveTypesLeaveRequest1698226481409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            DROP CONSTRAINT IF EXISTS "fk_leave_request_type";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            DROP CONSTRAINT IF EXISTS "fk_attendance_leave_request_user";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendances"
            DROP CONSTRAINT IF EXISTS "fk_attendance_leave";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            RENAME TO "attendance_time_off_requests";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP COLUMN "leave_type_id";
    `);
    await queryRunner.query(`
        DROP TABLE "attendance_leave_types";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendances"
            RENAME COLUMN "leave_request_id" TO "time_off_request_id";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD CONSTRAINT "fk_attendance_times_off_user"
            FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
        ALTER TABLE "attendances"
            ADD CONSTRAINT "fk_attendance_time_off" 
            FOREIGN KEY ("time_off_request_id") REFERENCES "attendance_time_off_requests" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendances"
            DROP CONSTRAINT IF EXISTS "fk_attendance_time_off";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP CONSTRAINT IF EXISTS "fk_attendance_times_off_user";
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN "leave_type_id" INT NOT NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            RENAME TO "attendance_leave_requests";
    `);
    await queryRunner.query(`
        CREATE TABLE "attendance_leave_types"
        (
            "id"         SERIAL PRIMARY KEY,
            "name"       VARCHAR(100) NOT NULL UNIQUE,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            ADD CONSTRAINT "fk_leave_request_type"
            FOREIGN KEY ("leave_type_id") REFERENCES "attendance_leave_types" ("id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            ADD CONSTRAINT "fk_attendance_leave_request_user"
            FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
        ALTER TABLE "attendances"
            RENAME COLUMN "time_off_request_id" TO "leave_request_id";
    `);
  }
}
