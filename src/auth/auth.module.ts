import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GithubAuthGuard } from './guard/github-auth.guard'
import { JwtAuthGuard } from './guard/jwt-auth.guard'
import { UserModule } from 'src/user/user.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GithubStrategy } from './strategies/github.strategy'

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '1h' }
			}),
			inject: [ConfigService]
		}),
		ConfigModule
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		GithubStrategy,
		GithubAuthGuard,
		JwtAuthGuard
	]
})
export class AuthModule {}
