import type { MigrationInterface, QueryRunner } from 'typeorm';

const leaveTypes = [
  'Vacation',
  'Sickness (max 2 days)',
  'Sickness - Long term (Certificate required)',
  'Sickness - Family member',
  'Wedding',
  'Maternity',
  'Non-paid Leave',
  'Death - Family member',
  'Death - Parent/Spouse/Child',
];

export class CreateAttendanceLeaveWfhTable1697446368271
  implements MigrationInterface
{
  name = 'createAttendanceLeaveWfhTable1697446368271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "attendance_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
        CREATE TYPE "attendance_date_enum" AS ENUM('HALF_DAY', 'FULL_DAY');
  `);

    await queryRunner.query(`
        ALTER TABLE "users" 
        ADD COLUMN "allowance" INT NOT NULL DEFAULT 0;`);

    await queryRunner.query(`
        CREATE TABLE "attendance_leave_types"
        (
            "id"         SERIAL PRIMARY KEY,
            "name"       VARCHAR(100) NOT NULL UNIQUE,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await Promise.all(
      leaveTypes.map(async (name) => {
        await queryRunner.query(
          `
              INSERT INTO "attendance_leave_types" ("name")
              VALUES ($1)
            `,
          [name],
        );
      }),
    );

    await queryRunner.query(`
        CREATE TABLE "attendance_leave_requests"
        (
            "id"            SERIAL PRIMARY KEY,
            "user_id"       INT                     NOT NULL,
            "from_at"       TIMESTAMP               NOT NULL,
            "to_at"         TIMESTAMP               NOT NULL,
            "date_type"     attendance_date_enum    NOT NULL,
            "total_hours"   INT                     NOT NULL,
            "details"       VARCHAR(1024)           NOT NULL,
            "leave_type_id" INT                     NOT NULL,
            "attached_file" VARCHAR(1024),
            "status"        attendance_status_enum  NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
          ADD CONSTRAINT "fk_attendance_leave_request_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
          ADD CONSTRAINT "fk_leave_request_type" FOREIGN KEY ("leave_type_id") REFERENCES "attendance_leave_types" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        CREATE TABLE "attendance_wfh_requests"
        (
            "id"            SERIAL PRIMARY KEY,
            "user_id"       INT                     NOT NULL,
            "from_at"       TIMESTAMP               NOT NULL,
            "to_at"         TIMESTAMP               NOT NULL,
            "date_type"     attendance_date_enum    NOT NULL,
            "total_hours"   INT                     NOT NULL,
            "details"       VARCHAR(1024)           NOT NULL,
            "attached_file" VARCHAR(1024),
            "status"        attendance_status_enum  NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
          ADD CONSTRAINT "fk_attendance_wfh_request_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        CREATE TABLE "attendances"
        (
            "id"               SERIAL PRIMARY KEY,
            "user_id"          INT       NOT NULL,
            "check_in"         TIMESTAMP NOT NULL,
            "check_out"        TIMESTAMP NOT NULL,
            "leave_request_id" INT,
            "wfh_request_id"   INT,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        ALTER TABLE "attendances"
          ADD CONSTRAINT "fk_attendance_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);

    await queryRunner.query(`
        ALTER TABLE "attendances"
          ADD CONSTRAINT "fk_attendance_leave" FOREIGN KEY ("leave_request_id") REFERENCES "attendance_leave_requests" ("id") ON DELETE RESTRICT
      `);
    await queryRunner.query(`
        ALTER TABLE "attendances"
          ADD CONSTRAINT "fk_attendance_wfh" FOREIGN KEY ("wfh_request_id") REFERENCES "attendance_wfh_requests" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attendance_leave_requests" DROP CONSTRAINT "fk_leave_request_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_leave_requests" DROP CONSTRAINT "fk_attendance_leave_request_user"`,
    );
    await queryRunner.query('DROP TABLE "attendance_leave_requests"');
    await queryRunner.query('DROP TABLE "attendance_leave_types"');
    await queryRunner.query(
      `ALTER TABLE "attendance_wfh_requests" DROP CONSTRAINT "fk_attendance_wfh_request_user"`,
    );
    await queryRunner.query('DROP TABLE "attendance_wfh_requests"');
    await queryRunner.query('DROP TYPE "attendance_status_enum"');
    await queryRunner.query('DROP TYPE "attendance_date_enum"');
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "fk_attendance_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "fk_attendance_leave"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "fk_attendance_wfh"`,
    );
    await queryRunner.query('DROP TABLE "attendances"');
  }
}
