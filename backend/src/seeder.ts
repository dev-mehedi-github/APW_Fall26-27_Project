
import { seeder } from "nestjs-seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import dataSourceOptions from "./config/database.config";
import { User } from "./modules/user/entities/user.entity";
import { UserFactory } from "./database/factories/user.factory";

seeder({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
    }),
    TypeOrmModule.forFeature([User]),
  ],
}).run([UserFactory]);
