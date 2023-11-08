import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePositionTableData1697790308353
  implements MigrationInterface
{
  name = 'updatePositionTableData1697790308353';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE positions SET name = 'Admin' WHERE name = 'Admin Assistant'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'Manager' WHERE name = 'BE Dev'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'Dev' WHERE name = 'DevOps'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'QA' WHERE name = 'FE Dev'`,
    );
    await queryRunner.query(
      `
      UPDATE users
      SET position_id = (
          SELECT id FROM positions WHERE name = 'HR'
      )
      WHERE position_id NOT IN (
          SELECT id FROM positions WHERE name IN ('Admin', 'Manager', 'HR', 'Dev', 'QA')
      );
      `,
    );
    await queryRunner.query(
      `
      DELETE FROM positions
      WHERE name NOT IN ('Admin', 'Manager', 'HR', 'Dev', 'QA');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE positions SET name = 'Admin Assistant' WHERE name = 'Admin'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'BE Dev' WHERE name = 'Manager'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'DevOps' WHERE name = 'Dev'`,
    );
    await queryRunner.query(
      `UPDATE positions SET name = 'FE Dev' WHERE name = 'QA'`,
    );
    await queryRunner.query(
      `
        UPDATE users
        SET position_id = (
            SELECT id FROM positions WHERE name = 'HR'
        )
        WHERE position_id NOT IN (
            SELECT id FROM positions WHERE name IN ('Admin Assistant', 'BE Dev', 'DevOps', 'FE Dev', 'HR')
        );
        `,
    );
    await queryRunner.query(
      `
        INSERT INTO positions (name)
        VALUES ('Admin Assistant'), ('BE Dev'), ('DevOps'), ('FE Dev'), ('Head of Dev'), ('HR'), ('Mobile Dev'), ('Office Manager')
        ON CONFLICT (name) DO NOTHING;
        `,
    );
  }
}
