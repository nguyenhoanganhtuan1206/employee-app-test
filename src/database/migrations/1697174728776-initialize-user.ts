import type { MigrationInterface, QueryRunner } from 'typeorm';

import { generateHash } from '../../common/utils';
import { ContractType, GenderType, RoleType } from '../../constants';

const companyEmail = process.env.ROOT_USER_EMAIL;

export class InitializeUser1697174728776 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = generateHash(process.env.ROOT_USER_PASSWORD as string);
    const gender = GenderType.MALE;
    const role = RoleType.ADMIN;
    const contract = ContractType.FULLTIME;

    const positionInsertResult = await queryRunner.query(
      `INSERT INTO positions (name) VALUES ('Admin') RETURNING id`,
    );

    const positionId = positionInsertResult[0]?.id;

    await queryRunner.query(
      `INSERT INTO users (company_email, password, gender, role, contract_type, position_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [companyEmail, password, gender, role, contract, positionId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM users WHERE company_email = $1', [
      companyEmail,
    ]);

    await queryRunner.query(
      `DELETE FROM positions 
        WHERE name = $1 
        AND EXISTS (
            SELECT 1 
            FROM users 
            WHERE users.company_email = $2
        )`,
      ['Admin', companyEmail],
    );
  }
}
