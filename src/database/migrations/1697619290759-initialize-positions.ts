import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializePositions1697619290759 implements MigrationInterface {
  name = 'initializePositions1697619290759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const positions = ['Manager', 'Admin', 'HR', 'Dev', 'QA'];
    await queryRunner.query(
      `UPDATE positions SET name = $1 WHERE name = 'Admin'`,
      [positions[0]],
    );
    await Promise.all(
      positions.slice(1).map(async (positionName) => {
        await queryRunner.query(
          `
            INSERT INTO positions (name)
            VALUES ($1)
            ON CONFLICT (name) DO NOTHING
        `,
          [positionName],
        );
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const positions = ['Manager', 'Admin', 'HR', 'Dev', 'QA'];
    await Promise.all(
      positions.map(async (positionName) => {
        await queryRunner.query(
          `
            DELETE FROM positions
            WHERE name = $1
          `,
          [positionName],
        );
      }),
    );
  }
}
