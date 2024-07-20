import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Chat } from './chat.entity'
import { CreateChatDto } from './dto/chat.dto'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/user.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat)
		private readonly chatRepository: Repository<Chat>,
		private readonly userService: UserService
	) {}

	async findAll(operationUserId: number): Promise<Chat[]> {
		console.log(operationUserId)
		const query = this.chatRepository
			.createQueryBuilder('chat')
			.leftJoinAndSelect('chat.users', 'user')
			.leftJoinAndSelect('chat.messages', 'message')
			.where('user.id = :operationUserId', { operationUserId })

		console.log(query.getSql()) // Для отладки, вывод SQL запроса
		return await query.getMany()
	}

	findOne(id: number): Promise<Chat> {
		return this.chatRepository.findOne({
			where: { id: id },
			relations: ['users', 'messages', 'typing']
		})
	}

	save(chat: Chat): Promise<Chat> {
		return this.chatRepository.save(chat)
	}
	async findByUserId(myId: number, userId: number): Promise<Chat> {
		const chat = await this.chatRepository.findOne({
			where: { id: userId },
			relations: ['users', 'messages']
		})
		if (!chat) {
			const user = await this.userService.findOneById(userId)
			return await this.create({
				ids: [myId, userId],
				isPersonal: true,
				name: user.username,
				img: user.picture
			})
		}
		return chat
	}

	async create(dto: CreateChatDto): Promise<Chat | null> {
		const users: User[] = []

		// Проверяем существование последнего пользователя
		const lastUser = await this.userService.findOneById(
			dto.ids[dto.ids.length - 1]
		)
		if (!lastUser) {
			throw new NotFoundException(
				`User with ID ${dto.ids[dto.ids.length - 1]} not found`
			)
		}
		users.push(lastUser)

		for (const id of dto.ids) {
			const user = await this.userService.findOneById(id)
			if (!user) {
				throw new NotFoundException(`User with ID ${id} not found`)
			}

			if (user.id !== lastUser.id) {
				const isInContacts = await this.userService.areUsersInContacts(
					user.id,
					lastUser.id
				)
				if (!dto.isPersonal && !isInContacts) {
					throw new ConflictException(
						'You cannot add a person to a group chat who does not have you in contacts'
					)
				}

				users.push(user)
			}
		}

		const chat = this.chatRepository.create({
			...dto,
			users: users,
			messages: []
		})

		await this.chatRepository.save(chat)
		return chat
	}
	async update(id: number, chatData: Partial<Chat>): Promise<Chat> {
		await this.chatRepository.update(id, chatData)
		return this.chatRepository.findOne({ where: { id: id } })
	}

	async remove(id: number): Promise<void> {
		await this.chatRepository.delete(id)
	}
}
