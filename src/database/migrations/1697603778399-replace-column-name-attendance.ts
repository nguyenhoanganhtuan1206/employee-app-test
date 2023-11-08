import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceColumnNameAttendance1697603778399
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            RENAME COLUMN "from_at" TO "date_from"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            RENAME COLUMN "to_at" TO "date_to"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
            RENAME COLUMN "from_at" TO "date_from"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
            RENAME COLUMN "to_at" TO "date_to"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            RENAME COLUMN "date_from" TO "from_at"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_leave_requests"
            RENAME COLUMN "date_to" TO "to_at"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
            RENAME COLUMN "date_from" TO "from_at"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
            RENAME COLUMN "date_to" TO "to_at"
    `);
  }
}
