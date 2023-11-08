import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PageDto } from 'common/dto/page.dto';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { Order } from '../../../constants/order';
import type { BuddyBuddeePairDto } from '../dtos/buddy-buddee-pair.dto';
import type { BuddyBuddeePairPageOptionsDto } from '../dtos/buddy-buddee-pair-page-options.dto';
import { CreateBuddyBuddeesPairRequestDto } from '../dtos/create-buddy-buddees-pair-request.dto';
import { BuddyEntity } from '../entities/buddy.entity';
import { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';
import { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';
import BuddyBuddeePairMapper from '../mappers/buddy-buddee-pair.mapper';

@Injectable()
export class BuddyBuddeePairService {
  constructor(
    @InjectRepository(BuddyEntity)
    private buddyRepository: Repository<BuddyEntity>,
    @InjectRepository(BuddyBuddeePairEntity)
    private buddyPairRepository: Repository<BuddyBuddeePairEntity>,
    @InjectRepository(BuddyBuddeeTouchpointEntity)
    private buddyTouchpointRepository: Repository<BuddyBuddeeTouchpointEntity>,
    private readonly buddyPairMapper: BuddyBuddeePairMapper,
  ) {}

  async getBuddyPairs(
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeePairDto>> {
    const queryBuilder = this.createBuddyPairsQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createBuddyPairs(
    buddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<BuddyBuddeePairDto[]> {
    await this.validateBuddyBuddeesPair(buddyBuddeesPairRequestDto);

    const buddyPairEntities =
      await this.buddyPairMapper.toBuddyBuddeePairEntities(
        buddyBuddeesPairRequestDto,
      );

    const newBuddyPairs =
      await this.buddyPairRepository.save(buddyPairEntities);

    await this.enableTouchpoints(newBuddyPairs);

    return newBuddyPairs.toDtos();
  }

  @Transactional()
  async deleteBuddyPair(id: number): Promise<void> {
    const buddyPairEntity = await this.buddyPairRepository.findOneBy({
      id,
    });

    if (!buddyPairEntity) {
      throw new NotFoundException(`Buddy pair with ID '${id}' not found`);
    }

    await this.removeTouchpoints(
      buddyPairEntity.buddy.id,
      buddyPairEntity.buddee.id,
    );

    await this.buddyPairRepository.remove(buddyPairEntity);
  }

  private async validateBuddyBuddeesPair(
    buddyPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<void> {
    const { buddyId, buddeeIds } = buddyPairRequestDto;

    await this.validateBuddy(buddyId);

    if (buddeeIds.includes(buddyId)) {
      throw new BadRequestException(
        `Cannot pairing buddy and buddee with the same id '${buddyId}'`,
      );
    }

    const buddyPair = await this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id IN (:...buddeeIds)', {
        buddyId,
        buddeeIds,
      })
      .getOne();

    if (buddyPair) {
      throw new ConflictException(
        `Pair of buddy with user id '${buddyId}' and buddee with user id '${buddyPair.buddee.id}' already exists`,
      );
    }
  }

  private async validateBuddy(buddyId: number): Promise<void> {
    const buddy = await this.buddyRepository
      .createQueryBuilder('buddy')
      .where('buddy.user.id = :buddyId', { buddyId })
      .getOne();

    if (!buddy) {
      throw new NotFoundException(`Buddy with user id '${buddyId}' not found`);
    }
  }

  private createBuddyPairsQueryBuilder(
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): SelectQueryBuilder<BuddyBuddeePairEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee');

    if (!sortColumn) {
      queryBuilder.orderBy('buddy.firstName', Order.ASC);
    }

    return queryBuilder;
  }

  private async removeTouchpoints(
    buddyId: number,
    buddeeId: number,
  ): Promise<void> {
    const touchpoints = await this.getTouchpoints(buddyId, buddeeId);

    if (Array.isArray(touchpoints) && touchpoints.length > 0) {
      await this.buddyTouchpointRepository.save(
        touchpoints.map((touchpoint) => {
          touchpoint.deleted = true;

          return touchpoint;
        }),
      );
    }
  }

  private async enableTouchpoints(
    buddyBuddeePairs: BuddyBuddeePairEntity[],
  ): Promise<void> {
    const touchpoints: BuddyBuddeeTouchpointEntity[] = [];

    for (const pair of buddyBuddeePairs) {
      // eslint-disable-next-line no-await-in-loop
      const buddyTouchpoints = await this.getTouchpoints(
        pair.buddy.id,
        pair.buddee.id,
      );

      if (Array.isArray(buddyTouchpoints) && buddyTouchpoints.length > 0) {
        const updatedBuddyTouchpoints: BuddyBuddeeTouchpointEntity[] =
          buddyTouchpoints.map((touchpoint: BuddyBuddeeTouchpointEntity) => {
            touchpoint.deleted = false;

            return touchpoint;
          });

        touchpoints.push(...updatedBuddyTouchpoints);
      }
    }

    if (Array.isArray(touchpoints) && touchpoints.length > 0) {
      await this.buddyTouchpointRepository.save(touchpoints);
    }
  }

  private async getTouchpoints(
    buddyId: number,
    buddeeId: number,
  ): Promise<BuddyBuddeeTouchpointEntity[]> {
    return this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id = :buddeeId', {
        buddyId,
        buddeeId,
      })
      .getMany();
  }
}
