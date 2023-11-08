import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { Order } from '../../../constants/order';
import type { BuddyDto } from '../dtos/buddy.dto';
import type { BuddyPageOptionsDto } from '../dtos/buddy-page-options.dto';
import { CreateBuddyRequestDto } from '../dtos/create-buddy-request.dto';
import { BuddyEntity } from '../entities/buddy.entity';
import BuddyMapper from '../mappers/buddy.mapper';

@Injectable()
export class BuddyService {
  constructor(
    @InjectRepository(BuddyEntity)
    private buddyRepository: Repository<BuddyEntity>,
    private readonly buddyMapper: BuddyMapper,
  ) {}

  async getBuddies(
    pageOptionsDto: BuddyPageOptionsDto,
  ): Promise<PageDto<BuddyDto>> {
    const queryBuilder = this.createBuddyQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createBuddy(buddyRequestDto: CreateBuddyRequestDto): Promise<BuddyDto> {
    await this.validateBuddy(buddyRequestDto);

    const buddyEntity = await this.buddyMapper.toBuddyEntity(buddyRequestDto);

    const newBuddy = await this.buddyRepository.save(buddyEntity);

    return newBuddy.toDto();
  }

  @Transactional()
  async deleteBuddy(id: number): Promise<void> {
    const buddyEntity = await this.buddyRepository.findOneBy({
      id,
    });

    if (!buddyEntity) {
      throw new NotFoundException(`Buddy with ID '${id}' not found`);
    }

    await this.buddyRepository.remove(buddyEntity);
  }

  private async validateBuddy(
    buddyRequestDto: CreateBuddyRequestDto,
  ): Promise<void> {
    const { userId } = buddyRequestDto;
    const buddy = await this.buddyRepository
      .createQueryBuilder('buddy')
      .where('buddy.user_id = :userId', { userId })
      .getOne();

    if (buddy) {
      throw new ConflictException(
        `Buddy with user id '${userId}' already exists`,
      );
    }
  }

  createBuddyQueryBuilder(
    pageOptionsDto: BuddyPageOptionsDto,
  ): SelectQueryBuilder<BuddyEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyRepository
      .createQueryBuilder('buddy')
      .leftJoinAndSelect('buddy.user', 'user');

    if (!sortColumn) {
      queryBuilder.orderBy('user.firstName', Order.ASC);
    }

    return queryBuilder;
  }
}
