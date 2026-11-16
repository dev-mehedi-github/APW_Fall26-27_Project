
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "nestjs-seeder";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../../modules/user/entities/user.entity";

@Injectable()
export class UserFactory implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async seed(): Promise<void> {
    const email = "admin@hospital.com";

    const existingAdmin = await this.userRepository.findOneBy({ email });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    const passwordHash = await bcrypt.hash("Admin@12345", 10);

    const admin = this.userRepository.create({
      fullName: "Hospital Admin",
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepository.save(admin);

    console.log("Admin account created successfully");
  }

  async drop(): Promise<void> {
    await this.userRepository.delete({
      email: "admin@hospital.com",
    });
  }
}
