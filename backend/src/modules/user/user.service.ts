import {Injectable,NotFoundException,ConflictException,InternalServerErrorException,HttpException,} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    private safeUser(user: User) {
        const { passwordHash, ...result } = user;
        return result;
    }

    async getUsers() {
        try {
            const users = await this.userRepository.find();
            return users.map((user) => this.safeUser(user));
        } catch (error) {
            throw new InternalServerErrorException("Failed to fetch users");
        }
    }

    async getUserById(id: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            return this.safeUser(user);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("Failed to fetch user");
        }
    }

    async createUser(dto: CreateUserDto) {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { email: dto.email },
            });

            if (existingUser) {
                throw new ConflictException("Email already exists");
            }

            const { password, ...userData } = dto;
            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = this.userRepository.create({...userData, passwordHash });

            const savedUser = await this.userRepository.save(newUser);

            return this.safeUser(savedUser);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Failed to create user");
        }
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const { password, email, ...rest } = dto;

            if (email && email !== user.email) {
                const existingUser = await this.userRepository.findOne({
                    where: { email },
                });

                if (existingUser) {
                    throw new ConflictException("Email already exists");
                }

                user.email = email;
            }

            Object.assign(user, rest);

            if (password) {
                user.passwordHash = await bcrypt.hash(password, 10);
            }

            const updatedUser = await this.userRepository.save(user);

            return this.safeUser(updatedUser);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Failed to update user");
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            await this.userRepository.delete({ id });

            return {
                message: "User deleted successfully",
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Failed to delete user");
        }
    }

    async findOneByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
            });

            return user;
        } catch (error) {
            throw new InternalServerErrorException("Failed to find user by email");
        }
    }
}
