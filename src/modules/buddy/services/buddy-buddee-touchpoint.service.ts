import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { Order } from '../../../constants';
import type { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import type { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import type { BuddyEntity } from '../entities/buddy.entity';
import { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';
import { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';
import BuddyBuddeeTouchpointMapper from '../mappers/buddy-buddee-touchpoint.mapper';
import { BuddyService } from './buddy.service';

@Injectable()
export class BuddyBuddeeTouchpointService {
  constructor(
    @InjectRepository(BuddyBuddeePairEntity)
    private buddyPairRepository: Repository<BuddyBuddeePairEntity>,
    @InjectRepository(BuddyBuddeeTouchpointEntity)
    private buddyTouchpointRepository: Repository<BuddyBuddeeTouchpointEntity>,
    private buddyService: BuddyService,
    private readonly buddyTouchpointMapper: BuddyBuddeeTouchpointMapper,
  ) {}

  async getBuddyPairTouchpoints(
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const buddyQueryBuilder =
      this.buddyService.createBuddyQueryBuilder(pageOptionsDto);
    const [items] = await buddyQueryBuilder.paginate(pageOptionsDto);

    if (Array.isArray(items) && items.length === 0) {
      return this.toPageDto([], pageOptionsDto);
    }

    const buddyIds = items.map((buddy) => buddy.user.id);
    const buddyPairs = await this.getBuddyBuddeePairs(buddyIds);
    const buddyTouchpoints = await this.getBuddyBuddeeTouchpoints(buddyIds);
    const latestTouchpoints: BuddyBuddeeTouchpointEntity[] =
      this.getBuddyBuddeeLatestTouchpoints(items, buddyPairs, buddyTouchpoints);

    return this.toPageDto(latestTouchpoints, pageOptionsDto);
  }

  async getTouchpointsByPairId(
    pairId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const buddyBuddeePair = await this.findBuddyBuddeePairById(pairId);

    const queryBuilder = this.createBuddyTouchpointsQueryBuilder(
      buddyBuddeePair,
      pageOptionsDto,
    );

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createBuddyBuddeeTouchpoint(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    await this.validateBuddyBuddeeTouchpoint(buddyBuddeeTouchpointRequestDto);

    const buddyTouchpointEntity =
      await this.buddyTouchpointMapper.toBuddyBuddeeTouchpointEntity(
        buddyBuddeeTouchpointRequestDto,
      );

    const newBuddyTouchpoint = await this.buddyTouchpointRepository.save(
      buddyTouchpointEntity,
    );

    return newBuddyTouchpoint.toDto();
  }

  private getBuddyBuddeeLatestTouchpoints(
    buddyEntities: BuddyEntity[],
    buddyPairs: BuddyBuddeePairEntity[],
    buddyTouchpoints: BuddyBuddeeTouchpointEntity[],
  ): BuddyBuddeeTouchpointEntity[] {
    const touchpoints: BuddyBuddeeTouchpointEntity[] = [];

    for (const buddy of buddyEntities) {
      const pairs = buddyPairs.filter(
        (pair) => pair.buddy.id === buddy.user.id,
      );

      if (Array.isArray(pairs) && pairs.length > 0) {
        for (const pair of pairs) {
          const latestTouchpoint = buddyTouchpoints.find(
            (touchpoint) =>
              touchpoint.buddy.id === buddy.user.id &&
              touchpoint.buddee.id === pair.buddee.id,
          );

          const buddyBuddeeTouchpoint = new BuddyBuddeeTouchpointEntity();
          buddyBuddeeTouchpoint.buddy = buddy.user;
          buddyBuddeeTouchpoint.buddee = pair.buddee;

          if (latestTouchpoint) {
            buddyBuddeeTouchpoint.note = latestTouchpoint.note;
            buddyBuddeeTouchpoint.visible = latestTouchpoint.visible;
            buddyBuddeeTouchpoint.createdAt = latestTouchpoint.createdAt;
          }

          touchpoints.push(buddyBuddeeTouchpoint);
        }
      } else {
        const buddyBuddeeTouchpoint = new BuddyBuddeeTouchpointEntity();
        buddyBuddeeTouchpoint.buddy = buddy.user;
        touchpoints.push(buddyBuddeeTouchpoint);
      }
    }

    return touchpoints;
  }

  private toPageDto(
    touchpoints: BuddyBuddeeTouchpointEntity[],
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const metaData = new PageMetaDto({
      pageOptionsDto,
      itemCount: touchpoints.length,
    });

    return touchpoints.toPageDto(metaData);
  }

  private async validateBuddyBuddeeTouchpoint(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<void> {
    const { buddyId, buddeeId } = buddyBuddeeTouchpointRequestDto;

    const buddyPair = await this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id = :buddeeId', {
        buddyId,
        buddeeId,
      })
      .getOne();

    if (!buddyPair) {
      throw new NotFoundException(
        `Pair of buddy with user id '${buddyId}' and buddee with user id '${buddeeId}' not found`,
      );
    }
  }

  private async findBuddyBuddeePairById(
    id: number,
  ): Promise<BuddyBuddeePairEntity> {
    const buddyPair = await this.buddyPairRepository.findOneBy({
      id,
    });

    if (!buddyPair) {
      throw new NotFoundException(
        `Buddy and buddee pair with id '${id}' not found`,
      );
    }

    return buddyPair;
  }

  private createBuddyTouchpointsQueryBuilder(
    buddyPairEntity: BuddyBuddeePairEntity,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): SelectQueryBuilder<BuddyBuddeeTouchpointEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id = :buddeeId', {
        buddyId: buddyPairEntity.buddy.id,
        buddeeId: buddyPairEntity.buddee.id,
      });

    if (!sortColumn) {
      queryBuilder.orderBy('buddyBuddeeTouchpoint.createdAt', Order.DESC);
    }

    return queryBuilder;
  }

  private async getBuddyBuddeePairs(
    buddyIds: number[],
  ): Promise<BuddyBuddeePairEntity[]> {
    return this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id IN (:...buddyIds)', {
        buddyIds,
      })
      .getMany();
  }

  private async getBuddyBuddeeTouchpoints(
    buddyIds: number[],
  ): Promise<BuddyBuddeeTouchpointEntity[]> {
    return this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .where('buddy.id IN (:...buddyIds) AND deleted = false', {
        buddyIds,
      })
      .orderBy('buddyBuddeeTouchpoint.createdAt', Order.DESC)
      .getMany();
  }
}
