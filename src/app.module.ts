import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { Chat } from './chat/chat.entity'
import { ChatModule } from './chat/chat.module'
import { MailModule } from './mail/mail.module'
import { Message } from './message/message.entity'
import { MessageModule } from './message/message.module' // Импортировать MessageModule
import { UploadModule } from './upload/upload.module'
import { User } from './user/user.entity'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		// Настройка ConfigModule для загрузки переменных окружения из .env файла
		ConfigModule.forRoot({
			isGlobal: true, // Делает конфигурацию доступной во всем приложении
			envFilePath: '.env' // Указывает путь к файлу .env
		}),
		// Настройка TypeOrmModule
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: '070707',
			database: 'messenger',
			entities: [User, Chat, Message],
			synchronize: true
		}),
		// Другие модули
		AuthModule,
		UserModule,
		ChatModule,
		MessageModule,
		MailModule,
		UploadModule // Добавить MessageModule,
	]
})
export class AppModule {}
