import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1696834864024 implements MigrationInterface {
  name = 'createUsersTable1696834864024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "users_role_enum" AS ENUM('USER', 'ADMIN');
        CREATE TYPE "users_contract_type_enum" AS ENUM('FULLTIME', 'PART_TIME', 'INTERN');
        CREATE TYPE "users_gender_enum" AS ENUM('MALE', 'FEMALE');
  `);
    await queryRunner.query(`
        CREATE TABLE "users" (
            "id"            SERIAL     PRIMARY KEY   NOT NULL,
            "first_name"    VARCHAR(255),
            "last_name"     VARCHAR(255),
            "trigram"       VARCHAR(10),
            "position_id"   INT                      NOT NULL,
            "id_no"         INT,
            "phone_no"      VARCHAR(50),
            "qr_code"       VARCHAR(25)      UNIQUE,
            "photo"         VARCHAR(1024),
            "company_email" VARCHAR(255)     UNIQUE  NOT NULL,
            "password"      VARCHAR(255)             NOT NULL,
            "gender"        users_gender_enum        NOT NULL,
            "role"          users_role_enum          NOT NULL   DEFAULT 'USER',
            "contract_type" users_contract_type_enum NOT NULL,
            "date_of_birth" TIMESTAMP,
            "address"       VARCHAR(2048),
            "university"    VARCHAR(255),
            "start_date"    TIMESTAMP                NOT NULL   DEFAULT CURRENT_TIMESTAMP,
            "end_date"      TIMESTAMP,
            "is_active"     BOOLEAN                             DEFAULT TRUE,
            "created_at"    TIMESTAMP                NOT NULL   DEFAULT CURRENT_TIMESTAMP,
            "updated_at"    TIMESTAMP                NOT NULL   DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "users"
            ADD CONSTRAINT "fk_users_positions" FOREIGN KEY ("position_id") REFERENCES "positions" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "users_role_enum"');
    await queryRunner.query('DROP TYPE "users_contract_type_enum"');
    await queryRunner.query('DROP TYPE "users_gender_enum"');
    await queryRunner.query(
      `ALTER TABLE "positions" DROP CONSTRAINT "fk_users_positions"`,
    );
  }
}
