import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileType } from '@app/profile/types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from '@app/profile/types/profileresponse.interface';
import { FollowEntity } from '@app/profile/types/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }
    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });
    return { ...user, following: Boolean(follow) };
  }

  // Following
  async followProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    // Ensure that the current user cannot follow his profile
    if (currentUserId === user.id) {
      throw new HttpException(
        'You cannot follow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });
    if (!follow) {
      const followCreator = new FollowEntity();
      followCreator.followerId = currentUserId;
      followCreator.followingId = user.id;
      await this.followRepository.save(followCreator);
    }
    return { ...user, following: true };
  }

  // Unfollowing
  // Following
  async unfollowProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    // Ensure that the current user cannot follow his profile
    if (currentUserId === user.id) {
      throw new HttpException(
        'You cannot follow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });
    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
