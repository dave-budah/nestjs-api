import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createuser.dto';
import { UserResponseInterface } from '@app/user/types/userresponse.interface';
import { LoginUserDto } from '@app/user/dto/loginuser.dto';
import { User } from '@app/user/decorators/user.decorators';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/updateuser.dto';
import { BackendValidationPipe } from '@app/shared/pipes/backendvalidation.pipe';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  // Login functionality
  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async login(
    @Body('user') loginDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  // Current user logic
  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    console.log('Current user', user);
    return this.userService.buildUserResponse(user);
  }

  // Update user logic
  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(
    @User('id') currentUserId: number,
    @Body('user') updateDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(currentUserId, updateDto);
    return this.userService.buildUserResponse(user);
  }
}
