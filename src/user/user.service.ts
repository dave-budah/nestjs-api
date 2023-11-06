import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createuser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userresponse.interface';
import { LoginUserDto } from '@app/user/dto/loginuser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@app/user/dto/updateuser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };
    // Check if the user is already in the repository
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    const userByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'has already been taken';
    }
    if (userByUsername) {
      errorResponse.errors['username'] = 'has already been taken';
    }
    if (userByUsername || userByEmail) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    console.log('newUser: ', newUser);
    return await this.userRepository.save(newUser);
  }
  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // Login functionality
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'is invalid',
      },
    };
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'username', 'email', 'bio', 'image', 'role', 'password'],
    });
    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPassword = await compare(loginUserDto.password, user.password);
    if (!isPassword) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    delete user.password;
    delete user.role;
    return user;
  }

  generateToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET_KEY,
    );
  }

  // Update user logic
  async updateUser(
    userId: number,
    updateUser: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUser);
    return await this.userRepository.save(user);
  }
  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateToken(user),
      },
    };
  }
}
