import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeTrainingTopicLevel1698053114991
  implements MigrationInterface
{
  name = 'initializeTrainingTopicLevel1698053114991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const levels = ['Beginner', 'Intermediate', 'Expert'];
    await queryRunner.query(`
        ALTER TABLE training_levels
            ADD CONSTRAINT unique_level_label UNIQUE (label);
    `);
    await Promise.all(
      levels.map(async (levelLabel) => {
        await queryRunner.query(
          `
            INSERT INTO training_levels (label)
            VALUES ($1)
            ON CONFLICT (label) DO NOTHING;
        `,
          [levelLabel],
        );
      }),
    );
    const topics = [
      'Angular',
      'AWS',
      'Azure',
      'Docker',
      'Flutter',
      'Github',
      'Java',
      'NestJs',
      'ReactJs',
      'Scrum',
      'Testing',
      'Webpack',
      'Others',
    ];
    await queryRunner.query(`
        ALTER TABLE training_topics
            ADD CONSTRAINT unique_topic_label UNIQUE (label);
    `);
    await Promise.all(
      topics.map(async (topicLabel) => {
        await queryRunner.query(
          ` 
            INSERT INTO training_topics (label)
            VALUES ($1)
            ON CONFLICT (label) DO NOTHING;
            `,
          [topicLabel],
        );
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE training_levels, training_topics');
  }
}
