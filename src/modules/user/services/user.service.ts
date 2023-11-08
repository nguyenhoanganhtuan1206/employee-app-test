import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { validateHash } from '../../../common/utils';
import { Order } from '../../../constants';
import {
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import MailService from '../../../integrations/mail/mail.service';
import { Mail, Recipient } from '../../../integrations/mail/models';
import type { LevelDto } from '../dtos/level.dto';
import { PasswordDto } from '../dtos/password.dto';
import type { PositionDto } from '../dtos/position.dto';
import UpdateUserDto from '../dtos/update-user.dto';
import type { UserDto } from '../dtos/user.dto';
import UserCreationDto from '../dtos/user-creation.dto';
import type { UsersPageOptionsDto } from '../dtos/users-page-options.dto';
import { LevelEntity } from '../entities/level.entity';
import { PositionEntity } from '../entities/position.entity';
import { UserEntity } from '../entities/user.entity';
import UserMapper from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
    private readonly userMapper: UserMapper,
    private readonly mailService: MailService,
  ) {}

  private readonly loginPageUrl: string = process.env.LOGIN_PAGE_URL!;

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  async findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(user: UserCreationDto): Promise<UserDto> {
    await this.verifyDataBeforeCreate(user);
    const userEntity = await this.userMapper.toUserEntity(user);

    // Generate password
    const generatedPassword = this.generatePassword();
    // Set user data
    userEntity.password = generatedPassword;
    // Create
    const userEntityCreated = await this.userRepository.save(userEntity);
    // Send mail
    this.sendMailToCreatedUser(userEntityCreated, generatedPassword);

    return userEntityCreated.toDto();
  }

  @Transactional()
  async updateUser(userId: number, user: UpdateUserDto): Promise<UserDto> {
    // Find existing user
    const existingUserEntity = await this.findUserById(userId);
    await this.verifyDataBeforeUpdate(existingUserEntity, user);

    // Copy changed value to exsiting
    const userEntityToUpdate = await this.userMapper.toUserEntityToUpdate(
      existingUserEntity,
      user,
    );

    // Update
    const userEntityUpdated =
      await this.userRepository.save(userEntityToUpdate);

    return userEntityUpdated.toDto();
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.getUsersQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUsersWithoutPageDto(): Promise<UserDto[]> {
    const items = await this.userRepository.find();

    return items.toDtos();
  }

  async getUserById(userId: number): Promise<UserDto> {
    const userEntity = await this.findUserById(userId);

    return userEntity.toDto();
  }

  async findUsersByKeyword(keyword: string): Promise<UserDto[]> {
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level');

    if (keyword) {
      queryBuilder = queryBuilder.where(
        `LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:keyword) OR LOWER(user.companyEmail) LIKE LOWER(:keyword)`,
        { keyword: `%${keyword}%` },
      );
    }

    const userEntity = await queryBuilder.getMany();

    return userEntity.toDtos();
  }

  async deactivatedUser(userId: number): Promise<void> {
    // Find existing user
    const existingUserEntity = await this.findUserById(userId);

    // Set user to deactivated
    existingUserEntity.isActive = false;

    // Update
    await this.userRepository.save(existingUserEntity);
  }

  @Transactional()
  async updateUserPhoto(userId: number, url: string) {
    const user = await this.findUserById(userId);

    user.photo = url;
    await this.userRepository.save(user);
  }

  @Transactional()
  async changePassword(
    userId: number,
    passwordDto: PasswordDto,
  ): Promise<void> {
    const existingUserEntity = await this.findUserById(userId);

    if (
      !(await validateHash(
        passwordDto.currentPassword,
        existingUserEntity.password,
      ))
    ) {
      throw new InvalidBadRequestException(
        ErrorCode.CURRENT_PASSWORD_NOT_MATCH,
      );
    }

    if (existingUserEntity.firstLogin) {
      existingUserEntity.firstLogin = false;
    }

    existingUserEntity.password = passwordDto.newPassword;

    await this.userRepository.save(existingUserEntity);
  }

  async findAllPositions(): Promise<PositionDto[]> {
    const positions = await this.positionRepository.find({
      order: {
        name: Order.ASC,
      },
    });

    return positions.toDtos();
  }

  async findAllLevels(): Promise<LevelDto[]> {
    const levels = await this.levelRepository.find({
      order: {
        label: Order.ASC,
      },
    });

    return levels.toDtos();
  }

  async findUserById(userId: number): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!userEntity) {
      throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return userEntity;
  }

  private sendMailToCreatedUser(user: UserEntity, generatedPassword: string) {
    const mail = new Mail();
    const toRecipient = new Recipient(user.companyEmail);
    // Setting variables
    const variables = new Map();
    variables.set('fullName', `${user.firstName} ${user.lastName}`);
    variables.set('loginPageUrl', this.loginPageUrl);
    variables.set('companyEmail', user.companyEmail);
    variables.set('password', generatedPassword);

    // Setting mail before send
    mail.to = toRecipient;
    mail.subject = '[OWT VN] Account activation';
    mail.template = 'new_user_created';
    mail.variables = variables;

    // Send mail
    this.mailService.send(mail);
  }

  private generatePassword(): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '?=.*[!#$%&()*+,.:;<>?@[\\]^_{}~-]';

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getRandomChar = (charSet: string): string => {
      const randomIndex = Math.floor(Math.random() * charSet.length);

      return charSet[randomIndex];
    };

    const uppercaseChar = getRandomChar(uppercaseChars);
    const lowercaseChar = getRandomChar(lowercaseChars);
    const numberChar = getRandomChar(numberChars);
    const specialChar = getRandomChar(specialChars);

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;
    const additionalChars = Array.from({ length: 4 })
      .fill(0)
      .map(() => getRandomChar(allChars))
      .join('');

    const passwordChars =
      uppercaseChar +
      lowercaseChar +
      numberChar +
      specialChar +
      additionalChars;

    return [...passwordChars].sort(() => Math.random() - 0.5).join('');
  }

  @Transactional()
  async forgotPassword(email: string): Promise<void> {
    const exsitingUser = await this.findUserByEmail(email);

    const newPassword = this.generatePassword();

    exsitingUser.password = newPassword;

    await this.userRepository.save(exsitingUser);

    this.sendMailToUserRequestForgotPassword(exsitingUser, newPassword);
  }

  private async findUserByEmail(email: string): Promise<UserEntity> {
    const exsitingUserWithEmail = await this.userRepository.findOneBy({
      companyEmail: email,
    });

    if (!exsitingUserWithEmail) {
      throw new InvalidBadRequestException(ErrorCode.EMAIL_DOES_NOT_EXIST);
    }

    return exsitingUserWithEmail;
  }

  private sendMailToUserRequestForgotPassword(
    user: UserEntity,
    newPassword: string,
  ) {
    const mail = new Mail();
    const toRecipient = new Recipient(user.companyEmail);

    const variables = new Map();
    variables.set('fullName', `${user.firstName} ${user.lastName}`);
    variables.set('loginPageUrl', process.env.LOGIN_PAGE_URL);
    variables.set('newPassword', newPassword);

    mail.to = toRecipient;
    mail.subject = '[OWT VN] Reset Password';
    mail.template = 'forgot_password';
    mail.variables = variables;

    this.mailService.send(mail);
  }

  private async verifyDataBeforeCreate(user: UserCreationDto) {
    const exsitingUserWithEmail = await this.userRepository.findOneBy({
      companyEmail: user.companyEmail,
    });

    if (exsitingUserWithEmail) {
      throw new InvalidBadRequestException(ErrorCode.EMAIL_IS_EXISTED);
    }

    if (user.endDate && user.endDate < user.startDate) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }
  }

  private async verifyDataBeforeUpdate(
    exsitingUserEntity: UserEntity,
    userToUpdateDto: UpdateUserDto,
  ): Promise<void> {
    if (
      userToUpdateDto.endDate &&
      userToUpdateDto.endDate < userToUpdateDto.startDate
    ) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    if (userToUpdateDto.companyEmail !== exsitingUserEntity.companyEmail) {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where(`user.id <> :userId AND user.companyEmail = :companyEmail`, {
          companyEmail: userToUpdateDto.companyEmail,
          userId: exsitingUserEntity.id,
        });

      const exsitingUserWithEmail = await queryBuilder.getOne();

      if (exsitingUserWithEmail) {
        throw new InvalidBadRequestException(ErrorCode.EMAIL_IS_EXISTED);
      }
    }
  }

  private getUsersQueryBuilder(
    usersPageOptionsDto: UsersPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const { userIds, genders, emails, query, positionIds, levelIds, orderBy } =
      usersPageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs');

    if (query) {
      queryBuilder.andWhere(
        [
          `LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:query)`,
          `LOWER(user.companyEmail) LIKE LOWER(:query)`,
        ].join(' OR '),
        { query: `%${query}%` },
      );
    }

    queryBuilder.orderBy('user.firstName', orderBy);
    queryBuilder.addOrderBy('user.lastName', orderBy);
    queryBuilder.addOrderBy('user.startDate', Order.DESC);

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    if (genders?.length) {
      queryBuilder.andWhere('user.gender IN (:...genders)', {
        genders,
      });
    }

    if (emails?.length) {
      queryBuilder.andWhere('user.company_email IN (:...emails)', {
        emails,
      });
    }

    if (levelIds?.length) {
      queryBuilder.andWhere('user.level_id IN (:...levelIds)', {
        levelIds,
      });
    }

    if (positionIds?.length) {
      queryBuilder.andWhere('user.position_id IN (:...positionIds)', {
        positionIds,
      });
    }

    return queryBuilder;
  }
}
